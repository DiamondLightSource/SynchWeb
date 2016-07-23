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
import errno
import MySQLdb
from shutil import copyfile
import xml.etree.ElementTree as ET


class MySQL:

    def __init__(self, user, pw, db, host='127.0.0.1'):
        self._conn = MySQLdb.connect(host=host, user=user, passwd=pw, db=db)
        self._conn.autocommit(1)

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

    def __init__(self, db=None, config=None):
        self.db = db
        self.config = config

        if not os.path.exists(config['holding_dir']+'/processed'):
            os.mkdir(config['holding_dir']+'/processed')


    def run(self):
        while self.running:
            files = glob.glob(self.config['holding_dir']+"/*EF*.xml")
            for xml in files:
                print xml
                st = os.stat(xml)
                
                image = xml.replace('.xml', '.jpg')
                if not os.path.exists(image):
                    print 'Corresponding image not found for', xml, 'expected', image
                    continue


                if time.time() - st.st_mtime > 10:
                    tree = ET.parse(xml)
                    root = tree.getroot()

                    # deal with xml namespace
                    ns = root.tag.split('}')[0].strip('{')
                    nss = { 'oppf': ns }

                    inspectionid = re.sub('\-.*', '', root.find('oppf:ImagingId', nss).text)

                    print 'inspection', inspectionid

                    container = self._get_container(inspectionid)
                    if container is None:
                        continue

                    # Check if the visit dir exists yet
                    new_root = '{root}/{year}/{visit}'.format(root=self.config['upload_dir'], year=container['year'], visit=container['visit'])
                    if not os.path.exists(new_root):
                        print 'Visit location for image doesnt exist', new_root
                        continue

                    # Keep images in visit/imaging/containerid/inspectionid
                    new_path = '{new_root}/imaging/{containerid}/{inspectionid}'.format(new_root=new_root, containerid=container['containerid'], inspectionid=inspectionid)
                    if not os.path.exists(new_path):
                        try:
                            os.makedirs(new_path)
                        except OSError as exc:
                            if exc.errno == errno.EEXIST and os.path.isdir(new_path):
                                pass
                            else:
                                raise

                    position = self._get_position(root.find('oppf:Drop', nss).text, container['containertype'])
                    if position is None:
                        print 'Could not match drop to position', root.find('oppf:Drop', nss).text, container['containertype']
                        continue

                    print 'Drop', root.find('oppf:Drop', nss).text, 'position', position

                    sampleid = self._get_sampleid(position, container['containerid'])
                    if sampleid is None:
                        continue

                    mppx = float(root.find('oppf:SizeInMicrons', nss).find('oppf:Width', nss).text) / float(root.find('oppf:SizeInPixels', nss).find('oppf:Width', nss).text)
                    mppy = float(root.find('oppf:SizeInMicrons', nss).find('oppf:Height', nss).text) / float(root.find('oppf:SizeInPixels', nss).find('oppf:Height', nss).text)

                    db.pq("""INSERT INTO BLSampleImage (blsampleid, micronsperpixelx, micronsperpixely, containerinspectionid)
                        VALUES (%s,%s,%s,%s)""", [sampleid, mppx, mppy, inspectionid])
                    print "INSERT INTO BLSampleImage (blsampleid, micronsperpixelx, micronsperpixely, containerinspectionid) VALUES (%s,%s,%s,%s)", [sampleid, mppx, mppy, inspectionid]

                    iid = db.id()

                    # Use blsampleimageid as file name as we are sure this is unique
                    new_file = '{path}/{iid}.jpg'.format(path=new_path, iid=iid)

                    db.pq("""UPDATE BLSampleImage set imagefullpath=%s WHERE blsampleimageid=%s""", [new_file, iid])
                    print "UPDATE BLSampleImage set imagefullpath=%s WHERE blsampleimageid=%s", [new_file, iid]

                    # move image
                    print 'copy', image, new_file
                    copyfile(image, new_file)

                    # clear up
                    os.rename(image, image.replace(self.config['holding_dir'], self.config['holding_dir']+'/processed'))
                    print 'move', image, image.replace(self.config['holding_dir'], self.config['holding_dir']+'/processed')

                    os.rename(xml, xml.replace(self.config['holding_dir'], self.config['holding_dir']+'/processed'))
                    print 'move', xml, xml.replace(self.config['holding_dir'], self.config['holding_dir']+'/processed')

                    #os.unlink(image)
                    #os.unlink(xml)


            print 'Sleeping until next iteration'
            time.sleep(10)


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
            print 'Couldnt find container for inspectionid', inspectionid
            return

        print container

        if not container[0]['sessionid']:
            print 'Container has no sessionid', container[0]['containerid'], inspectionid
            return

        return container[0]



    def _get_position(self, text_position, platetype):
        well, drop = text_position.split('.')

        drop = int(drop)
        row = ord(well[0])-65
        col = int(well[1:])

        # Need to know what type of plate this is to know how many columns its got
        # This should be in the database, currently in json format embedded in this collection:
        # http://ispyb.diamond.ac.uk/beta/client/js/modules/shipment/collections/platetypes.js
        if not platetype in self.config['types']:
            print 'Unknown plate type', ty
            return

        ty = self.config['types'][platetype]

        # Position is a linear sequence left to right across the plate
        return (ty['well_per_row']*(row-1)*ty['drops_per_well']) + (col*ty['drops_per_well']) + (drop-1) + 1



    # Return a blsampleid from a position and containerid
    def _get_sampleid(self, position, containerid):
        sample = self.db.pq("""SELECT s.blsampleid, s.name, s.location
            FROM BLSample s
            INNER JOIN Container c ON c.containerid = s.containerid
            WHERE s.location = %s AND c.containerid = %s
            LIMIT 1""", [position, containerid])

        if not len(sample):
            print 'Couldnt find a blsample for containerid', containerid, 'position', position
            return

        print sample[0]

        return sample[0]['blsampleid']



cf = open('config.json')
config = json.load(cf)
cf.close()

db = MySQL(user=config['user'], pw=config['pw'], db=config['db'], host=config['host'])

uploader = FormulatrixUploader(db=db, config=config)
uploader.run()
