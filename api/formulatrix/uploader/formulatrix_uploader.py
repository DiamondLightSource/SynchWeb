# -*- coding: utf-8 -*-
#!/usr/bin/env python
#
#   Copyright 2015 Diamond Light Source <stuart.fisher@diamond.ac.uk>
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
#
# Implementation of Jon Diprose's ImageUploader in Python for
# formulatrix plate imagers, takes outputted xml / image files and
# puts them in the correct location, and adds an entry to SynchWeb

import json
import time
import glob
import re
import os
import sys
import atexit
import signal
import errno
import subprocess
import logging
import logging.handlers
import MySQLdb
from PIL import Image
from shutil import copyfile
import xml.etree.ElementTree as ET
import shutil
import getopt

class MySQL:

    def __init__(self, user, pw, db, host='127.0.0.1', port=3306):
        self._conn = MySQLdb.connect(host=host, user=user, passwd=pw, db=db, port=port)
        self._conn.autocommit(1)
        self._conn.ping(True)

        self._cur = self._conn.cursor(MySQLdb.cursors.DictCursor)


    def __del__(self):
        if self._cur is not None:
            self._cur.close()

        if self._conn is not None:
            self._conn.close()


    def pq(self, query, args=[]):
        res = self._cur.execute(query, args)

        rows = []
        for r in self._cur:
            rows.append(r)

        return rows if rows else []


    def id(self):
        return self._cur.connection.insert_id()



class FormulatrixUploader:

    _running = True

    def __init__(self, db=None, config=None):
        self.db = db
        self.config = config

        for d in ['processed', 'nosample']:
            if not os.path.exists(config['holding_dir']+'/'+d):
                os.mkdir(config['holding_dir']+'/'+d)

    def _move_dir(self, src_dir, target_dir):
        """This will overwrite any existing files with the same names.
        Make sure files are completed (written, closed) before moving them."""

        logging.getLogger().debug("trying to glob.glob('%s/*')" % src_dir)
        files = glob.glob("%s/*" % src_dir)
        for f in files:
            st = os.stat(f)
            if time.time() - st.st_mtime > 10 and st.st_size > 0:
                new_f = os.path.join(target_dir, os.path.basename(f))
                logging.getLogger().debug('copy: %s to %s' % (f, new_f))
                try:
                    shutil.copyfile(f, new_f)
                    try:
                        os.unlink(f)
                    except IOError as e:
                        logging.getLogger().error('Error deleting image file %s' % f)
                except IOError as e:
                    logging.getLogger().error('Error copying image file %s to %s' % (f, new_f))
            else:
                logging.getLogger().debug('Not moving file %s yet as it there is a handle on it' % f)

        # Remove the src_dir if empty
        self._rmdir(src_dir)
        
    def _rmdir(self, dir):
        """rmdir the dir (only works if it's empty)"""
        try:
            os.rmdir(dir)
        except OSError as e:
            pass

    def _get_most_recent_container_dirs(self, dirs):
        """Generate a dict of all containers with their most recent z-slice directories (dates)"""
        containers = dict()
        for dir in dirs:
             dir_containers = glob.glob(dir+"/*/")
             for dir_container in dir_containers:
                 barcode = os.path.basename(os.path.abspath(dir_container))
                 containers[barcode] = dir
        return containers

    def _get_visit_dir(self, container):
        visit = container['visit']
        proposal = visit[ : visit.index('-')]
        new_root = '{root}/{proposal}/{visit}'.format(root=self.config['upload_dir'], proposal=proposal, visit=visit)
        old_root = '{root}/{year}/{visit}'.format(root=self.config['upload_dir_old'], year=container['year'], visit=visit)

        the_root = None
        if os.path.exists(new_root):
            the_root = new_root
        elif os.path.exists(old_root):
            the_root = old_root
        else:
            logging.getLogger().error('Visit directory for visit doesnt exist, tried %s and %s' % (new_root, old_root))
            return None

        return the_root

    def _make_dirs(self, path):
        if not os.path.exists(path):

            try:
                os.makedirs(path)
                if config['web_user']:
                    subprocess.call(['/usr/bin/setfacl', '-R', '-m', 'u:'+config['web_user']+':rwx', path]);
    
            except OSError as exc:
                if exc.errno == errno.EEXIST and os.path.isdir(new_path):
                    pass
                elif exc.errno == errno.EACCES:
                    logging.getLogger().error("%s - %s" % (exc.strerror, new_path))
                    return False
                else:
                    raise
        return True

    def handle_zslice_images(self):
        """Move the z-slice images from the configured 'archive_dir' to their target_dir which is a folder 
        named by the container barcode in the tmp folder in the container's visit dir."""

        date_dirs = glob.glob(self.config['archive_dir']+"/*/")
        container_dict = self._get_most_recent_container_dirs(date_dirs)

        # Move the files in the most recent container imaging dirs within the archive_dir
        for barcode in container_dict:
            container = self._get_container_by_barcode(barcode)
            if container['visit'] is None:
                logging.getLogger().error('Container barcode %s has no session' % (str(barcode)) )
                continue
            
            # Determine the container's target directory
            visit_dir = self._get_visit_dir(container)
            if visit_dir is None:
                continue
            target_dir = os.path.join(visit_dir, "tmp", barcode)

            if not self._make_dirs(target_dir):
                continue

            # Move all the files (overwrite any existing files) in the barcode dir to the target_dir
            src_dir = os.path.join(container_dict[barcode], barcode) 
            self._move_dir(src_dir, target_dir)

        # Delete all non-recent container imaging dirs within the archive_dir
        recent_container_dirs = [] 
        for barcode in container_dict:
            recent_container_dirs.append(os.path.join(container_dict[barcode], barcode)) 
        
        all_container_dirs = glob.glob(self.config['archive_dir']+"/*/*/")
        for dir in all_container_dirs:
            # Remove the last character ("/") from the dir when comparing 
            if dir[:-1] not in recent_container_dirs:
                try:
                    logging.getLogger().debug("trying to rmtree(%s)" % (dir))
                    shutil.rmtree(dir)
                except OSError as oe:
                    logging.getLogger().error("OSError in shutil.rmtree('%s')" % dir)

        # Remove date folders if empty 
        for dir in date_dirs:
            self._rmdir(dir)
                

    def handle_ef_images(self):
        """Move extended focus (EF) images from the configuration holding_dir to 
        imaging/{containerid}/{inspectionid} within the container's visit dir. 
        Also create thumbnail images."""
        files = glob.glob(self.config['holding_dir']+"/*EF*.xml")
        for xml in files:
            logging.getLogger().debug(xml)
            st = os.stat(xml)

            image = xml.replace('.xml', '.jpg')
            if not os.path.exists(image):
                logging.getLogger().error('Corresponding image not found for %s expected %s' % (str(xml), str(image)) )
                continue
            
            if time.time() - st.st_mtime > 10 and st.st_size > 0:
                tree = ET.parse(xml)
                root = tree.getroot()

                # deal with xml namespace
                ns = root.tag.split('}')[0].strip('{')
                nss = { 'oppf': ns }

                inspectionid = re.sub('\-.*', '', root.find('oppf:ImagingId', nss).text)

                logging.getLogger().debug('inspection: %s' % str(inspectionid))

                container = self._get_container(inspectionid)
                if container is None:
                    continue

                # Check if the visit dir exists yet
                the_root = self._get_visit_dir(container)
                if the_root is None:
                    continue

                # Keep images in visit/imaging/containerid/inspectionid
                new_path = '{the_root}/imaging/{containerid}/{inspectionid}'.format(the_root=the_root, containerid=container['containerid'], inspectionid=inspectionid)
                if not self._make_dirs(new_path):
                    continue

                position = self._get_position(root.find('oppf:Drop', nss).text, container['containertype'])
                if position is None:
                    logging.getLogger().error('Could not match drop: %s to position: %s' % (root.find('oppf:Drop', nss).text, container['containertype']) )
                    continue

                logging.getLogger().debug('Drop: %s position: %s' % (root.find('oppf:Drop', nss).text, position))

                sampleid = self._get_sampleid(position, container['containerid'])
                if sampleid is None:
                    self._move_files(image, xml, 'nosample')
                    continue

                mppx = float(root.find('oppf:SizeInMicrons', nss).find('oppf:Width', nss).text) / float(root.find('oppf:SizeInPixels', nss).find('oppf:Width', nss).text)
                mppy = float(root.find('oppf:SizeInMicrons', nss).find('oppf:Height', nss).text) / float(root.find('oppf:SizeInPixels', nss).find('oppf:Height', nss).text)

                db.pq("""INSERT INTO BLSampleImage (blsampleid, micronsperpixelx, micronsperpixely, containerinspectionid)
                    VALUES (%s,%s,%s,%s)""", [sampleid, mppx, mppy, inspectionid])
                logging.getLogger().debug("INSERT INTO BLSampleImage "\
                                          "(blsampleid, micronsperpixelx, micronsperpixely, containerinspectionid) "\
                                          "VALUES (%s,%s,%s,%s)" % (str(sampleid), str(mppx), str(mppy), str(inspectionid)))

                iid = db.id()

                # Use blsampleimageid as file name as we are sure this is unique
                new_file = '{path}/{iid}.jpg'.format(path=new_path, iid=iid)

                db.pq("""UPDATE BLSampleImage set imagefullpath=%s WHERE blsampleimageid=%s""", [new_file, iid])
                logging.getLogger().debug("UPDATE BLSampleImage set imagefullpath=%s WHERE blsampleimageid=%s" % (new_file, str(iid)))

                # move image
                logging.getLogger().debug('copy: %s to %s' % (image, new_file))
                try:
                    copyfile(image, new_file)

                    # create a thumbnail
                    file, ext = os.path.splitext(new_file)
                    try:
                        im = Image.open(new_file)
                        im.thumbnail((config['thumb_width'], config['thumb_height']))
                        try:
                            im.save(file+'th'+ext)
                        except IOError as e:
                            logging.getLogger().error('Error saving image file %s' % file+'th'+ext)
                        # clear up - should be in a try ... except?
                        #self._move_files(image, xml, 'processed')
                        try:
                            os.unlink(image)
                        except IOError as e:
                            logging.getLogger().error('Error deleting image file %s' % image)
                        try:
                            os.unlink(xml)
                        except IOError as e:
                            logging.getLogger().error('Error deleting XML file %s' % xml)
                    except IOError as e:
                        logging.getLogger().error('Error opening image file %s' % new_file)
                except IOError as e:
                    logging.getLogger().error('Error copying image file %s to %s' % (image, new_file))


    def _move_files(self, image, xml, path):
        for f in [image, xml]:
            os.rename(f, f.replace(self.config['holding_dir'], self.config['holding_dir']+'/'+path))
            logging.getLogger().debug('move %s %s' % (f, f.replace(self.config['holding_dir'], self.config['holding_dir']+'/'+path)))

    def _get_container_by_barcode(self, barcode):
        container = self.db.pq("""SELECT c.containertype, c.containerid, c.sessionid, CONCAT(p.proposalcode, p.proposalnumber, '-', bs.visit_number) as visit, DATE_FORMAT(c.bltimestamp, '%%Y') as year
            FROM Container c
            LEFT OUTER JOIN BLSession bs ON bs.sessionid = c.sessionid
            LEFT OUTER JOIN Proposal p ON p.proposalid = bs.proposalid
            WHERE c.barcode=%s
            LIMIT 1""", [barcode])

        if not len(container):
            logging.getLogger().error('Couldnt find container in database for barcode %s' % str(barcode))
            return None

        logging.getLogger().debug(str(container[0]['visit']))

        return container[0]
        

    def _get_container(self, inspectionid):
        container = self.db.pq("""SELECT c.containertype, c.containerid, c.sessionid, CONCAT(p.proposalcode, p.proposalnumber, '-', bs.visit_number) as visit, DATE_FORMAT(c.bltimestamp, '%%Y') as year
            FROM Container c
            INNER JOIN ContainerInspection ci ON ci.containerid = c.containerid
            INNER JOIN Dewar d ON d.dewarid = c.dewarid
            INNER JOIN Shipping s ON s.shippingid = d.shippingid
            INNER JOIN Proposal p ON p.proposalid = s.proposalid
            LEFT OUTER JOIN BLSession bs ON bs.sessionid = c.sessionid
            WHERE ci.containerinspectionid=%s
            LIMIT 1""", [inspectionid])

        if not len(container):
            logging.getLogger().error('Couldnt find container for inspectionid %s' % str(inspectionid))
            return

        logging.getLogger().debug(str(container))

        if not container[0]['sessionid']:
            logging.getLogger().error('Container %s has no sessionid. inspectionid is %s ' % (str(container[0]['containerid']), str(inspectionid)))
            return

        return container[0]


    def _get_position(self, text_position, platetype):
        well, drop = text_position.split('.')

        drop = int(drop)
        row = ord(well[0])-65
        col = int(well[1:])-1

        # Need to know what type of plate this is to know how many columns its got
        # This should be in the database, currently in json format embedded in this collection:
        # http://ispyb.diamond.ac.uk/beta/client/js/modules/shipment/collections/platetypes.js
        if not platetype in self.config['types']:
            logging.getLogger().error('Unknown plate type: %s' % platetype)
            return

        ty = self.config['types'][platetype]

        # Position is a linear sequence left to right across the plate
        return (ty['well_per_row']*row*ty['drops_per_well']) + (col*ty['drops_per_well']) + (drop-1) + 1


    # Return a blsampleid from a position and containerid
    def _get_sampleid(self, position, containerid):
        sample = self.db.pq("""SELECT s.blsampleid, s.name, s.location
            FROM BLSample s
            INNER JOIN Container c ON c.containerid = s.containerid
            WHERE s.location = %s AND c.containerid = %s
            LIMIT 1""", [position, containerid])

        if not len(sample):
            logging.getLogger().error('Couldnt find a blsample for containerid: %s, position: %s', str(containerid), str(position))
            return

        logging.getLogger().debug(str(sample[0]))

        return sample[0]['blsampleid']


def kill_handler(sig,frame):
    hostname = os.uname()[1]
    logging.getLogger().warning("%s: got SIGTERM on %s :-O" % (sys.argv[0], hostname))
    logging.shutdown()
    os._exit(-1)

def set_logging(logs):
    levels_dict = {"debug" : logging.DEBUG, "info" : logging.INFO, "warning" : logging.WARNING, "error" : logging.ERROR, "critical" : logging.CRITICAL}

    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    for log_name in logs:
        handler = None
        if log_name == "syslog":
            handler = logging.handlers.SysLogHandler(address=(logs[log_name]['host'], logs[log_name]['port']))
        elif log_name == "rotating_file":
            handler = logging.handlers.RotatingFileHandler(filename=logs[log_name]['filename'], maxBytes=logs[log_name]['max_bytes'], backupCount=logs[log_name]['no_files'])
        else:
            sys.exit("Invalid logging mechanism defined in config: %s. (Valid options are syslog and rotating_file.)" % log_name)

        handler.setFormatter(logging.Formatter(logs[log_name]['format']))
        level = logs[log_name]['level']
        if levels_dict[level]:
            handler.setLevel(levels_dict[level])
        else:
            handler.setLevel(logging.WARNING)
        logger.addHandler(handler)

def clean_up():
    global pid_file
    os.unlink(pid_file)
    logging.getLogger().info("%s: exiting python interpreter :-(" % sys.argv[0])
    logging.shutdown()

def print_usage():
    usage = """Script for uploading image files from Rock Imager into the correct session directories. 
Syntax: %s -c <configuration file> [-rp]
Arguments: 
     -h|--help : display this help
     -c|--conf <conf file> : use the given configuration file, default is config_ef.json""" % sys.argv[0]

    print usage

global pid_file
pid_file = None
conf_file = 'config_ef.json'
log_file = None

# Get command-line arguments
try:
    opts, args = getopt.gnu_getopt(sys.argv[1:], "hc:", ["help", "conf"])
except getopt.GetoptError:
    print_usage()
    sys.exit(2)

for o,a in opts:
    if o in ("-h", "--help"):
        print_usage()
        sys.exit()
    elif o in ("-c", "--conf"):
        conf_file = a

cf = open(conf_file)
config = json.load(cf)
cf.close()

if config['task'] not in ('EF', 'Z'):
    print_usage()
    sys.exit()

set_logging(config['logging'])

signal.signal(signal.SIGTERM, kill_handler)

# Create a pid file
pid_file = config['pid_file']
if os.path.isfile(pid_file):
    logging.getLogger().error("%s already exists, exiting" % pid_file)
    sys.exit()

if pid_file != None:
    try:
        f = open(pid_file, 'w')
        f.write(str(os.getpid()))
        f.close()
    except:
        logging.getLogger().error("Unable to write to pid file %s" % pid_file)

atexit.register(clean_up) # Remove pid file when exiting
atexit.register(logging.shutdown)


db = MySQL(user=config['user'], pw=config['pw'], db=config['db'], host=config['host'], port=int(config['port']))

uploader = FormulatrixUploader(db=db, config=config)
if config['task'] == 'EF':
    uploader.handle_ef_images()
elif config['task'] == 'Z':
    uploader.handle_zslice_images()

