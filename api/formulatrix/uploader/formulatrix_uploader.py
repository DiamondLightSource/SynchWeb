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


class MySQL:

    def __init__(self, user, pw, db, host='127.0.0.1'):
        self._conn = MySQLdb.connect(host=host, user=user, passwd=pw, db=db)
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


    def run(self):
        while self._running:
            files = glob.glob(self.config['holding_dir']+"/*EF*.xml")
            for xml in files:
                logging.getLogger().debug(xml)
                st = os.stat(xml)
                
                image = xml.replace('.xml', '.jpg')
                if not os.path.exists(image):
                    logging.getLogger().error('Corresponding image not found for %s expected %s' % (str(xml), str(image)) )
                    continue


                if time.time() - st.st_mtime > 10:
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
                    visit = container['visit']
                    proposal = visit[ : visit.index('-')]
                    new_root = '{root}/{proposal}/{visit}'.format(root=self.config['upload_dir'], proposal=proposal, visit=visit)
                    if not os.path.exists(new_root):
                        logging.getLogger().error('Visit location for image doesnt exist: %s' % new_root)
                        continue

                    # Keep images in visit/imaging/containerid/inspectionid
                    new_path = '{new_root}/imaging/{containerid}/{inspectionid}'.format(new_root=new_root, containerid=container['containerid'], inspectionid=inspectionid)
                    if not os.path.exists(new_path):
                        try:
                            os.makedirs(new_path)
                            if config['web_user']:
                                subprocess.call(['/usr/bin/setfacl', '-R', '-m', 'u:'+config['web_user']+':rwx', new_path]);

                        except OSError as exc:
                            if exc.errno == errno.EEXIST and os.path.isdir(new_path):
                                pass
                            elif exc.errno == errno.EACCES:
                                logging.getLogger().error("%s - %s" % (exc.strerror, new_path))
                                continue
                            else:
                                raise

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

                                # clear up
                                self._move_files(image, xml, 'processed')

                                #os.unlink(image)
                                #os.unlink(xml)

                            except IOError as e:
                                logging.getLogger().error('Error saving image file %s' % file+'th'+ext)
                        except IOError as e:
                            logging.getLogger().error('Error opening image file %s' % new_file)
                    except IOError as e:
                        logging.getLogger().error('Error copying image file %s to %s' % (image, new_file))

            logging.getLogger().debug('Sleeping until next iteration')
            time.sleep(30)


    def _move_files(self, image, xml, path):
        for f in [image, xml]:
            os.rename(f, f.replace(self.config['holding_dir'], self.config['holding_dir']+'/'+path))
            logging.getLogger().debug('move %s %s' % (f, f.replace(self.config['holding_dir'], self.config['holding_dir']+'/'+path)))


    def _get_container(self, inspectionid):
        container = self.db.pq("""SELECT c.containertype, c.containerid, c.sessionid, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), ses.visit_number) as visit, DATE_FORMAT(c.bltimestamp, '%%Y') as year
            FROM Container c 
            INNER JOIN ContainerInspection ci ON ci.containerid = c.containerid
            INNER JOIN Dewar d ON d.dewarid = c.dewarid
            INNER JOIN Shipping s ON s.shippingid = d.shippingid
            INNER JOIN Proposal p ON p.proposalid = s.proposalid
            LEFT OUTER JOIN BLSession ses ON ses.sessionid = c.sessionid
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


def killHandler(sig,frame):
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


cf = open('config.json')
config = json.load(cf)
cf.close()

set_logging(config['logging'])

try:
    pid = os.fork()
except OSError, e:
    logging.getLogger().error("Unable to fork, can't run as daemon in background")
    sys.exit(1)
if pid != 0:
    sys.exit()


# pid_file = config['pid_file']
# if pid_file != None:
#     try:
#         f = open(pid_file, 'w')     
#         f.write(str(os.getpid()))
#         f.close()
#     except:
#         logging.getLogger().error("Unable to write to pid file %s" % pid_file)

atexit.register(logging.shutdown)
signal.signal(signal.SIGTERM,killHandler)

db = MySQL(user=config['user'], pw=config['pw'], db=config['db'], host=config['host'])

uploader = FormulatrixUploader(db=db, config=config)
uploader.run()

