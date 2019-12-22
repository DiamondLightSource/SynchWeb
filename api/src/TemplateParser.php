<?php

namespace SynchWeb;

class TemplateParser
{

        # YEAR         from visit
        # BEAMLINENAME from visit

        # VISITDIR     interpolated from config $visit_directory, requires DCID, SESSIONID, or VISIT
        
        # IMFILE       imagefile, pass IMAGENUMBER to offset from STARTIMAGENUMBER, required DCID
        # IMDIRECTORY  imagedirectory, relative to VISITDIR
        # DCID         needs to be passed in args

        var $params = array();

        function __construct($db) {
            $this->db = $db;
        }
        

        # ------------------------------------------------------------------------
        # Interpolate a string with its arguments
        function interpolate($string, $args) {
            if (strpos($string, 'VISITDIR') !== false && (array_key_exists('VISIT', $args) || array_key_exists('SESSIONID', $args) || array_key_exists('DCID', $args))) {
                $args['VISITDIR'] = $this->visit_dir($args);
            }

            if ((strpos($string, 'IMFILE') !== false || strpos($string, 'IMDIRECTORY') !== false) && array_key_exists('DCID', $args)) {
                $more_args = $this->filetemplate($args);
                $args = array_merge($args, $more_args);
            }


            # Use underscore.js style template to be consistent with the front end
            return preg_replace_callback('/<%=(\w+)%>/', 
                function($mat) use ($args) {
                    if (array_key_exists($mat[1], $args)) {
                        return $args[$mat[1]];
                    }
                }, 
                $string);
        }


        # ------------------------------------------------------------------------
        # Directory and File template manipulations

        # Provides VISITDIR from sessionid, dcid, or visit
        function visit_dir($options) {
            global $visit_directory;

            if (array_key_exists('VISITDIR', $this->params)) return $this->params['VISITDIR'];

            $args = array();

            if (array_key_exists('SESSIONID', $options)) {
                $where = 'WHERE s.sessionid=:1';
                array_push($args, $options['SESSIONID']);
            }

            if (array_key_exists('VISIT', $options)) {
                $where = "WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1";
                array_push($args, $options['VISIT']);
            }

            if (array_key_exists('DCID', $options)) {
                array_push($args, $options['DCID']);

                $visit = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'YYYY') as year, s.beamlinename, dc.imagedirectory
                    FROM blsession s 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    INNER JOIN datacollectiongroup dcg ON dcg.sessionid = s.sessionid
                    INNER JOIN datacollection dc ON dcg.datacollectiongroupid = dc.datacollectiongroupid 
                    
                    WHERE dc.datacollectionid=:1", $args);

                if (sizeof($visit)) $visit = $visit[0];
                else return;

                $this->params['VISITDIR'] = preg_replace('/'.$visit['VISIT'].'\/.*/', $visit['VISIT'], $visit['IMAGEDIRECTORY']);

            } else {
                $visit = $this->db->pq("SELECT CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, TO_CHAR(s.startdate, 'YYYY') as year, s.beamlinename
                    FROM blsession s 
                    INNER JOIN proposal p ON p.proposalid = s.proposalid
                    $where", $args);

                if (sizeof($visit)) $visit = $visit[0];
                else return;

                $this->params['VISITDIR'] = $this->interpolate($visit_directory, $visit);
            }
            return $this->params['VISITDIR'];
        }


        # Return a directory relative to the visit
        function relative($dir, $options) {
            $dir = preg_replace('/\/$/', '', $dir);
            return str_replace($this->visit_dir($options).'/', '', $dir);
        }


        # Returns a filetemplate (i.e. img_1_####.cbf) with imagenumber replaced and padded based on dcid
        function filetemplate($options) {
            if (!array_key_exists('DCID', $options)) return;

            $dc = $this->db->pq("SELECT dc.startimagenumber, dc.imagedirectory, dc.imagesuffix, dc.imageprefix, dc.filetemplate, dcg.sessionid, dc.datacollectionnumber
                FROM datacollection dc 
                INNER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid
                WHERE dc.datacollectionid=:1", array($options['DCID']));

            if (sizeof($dc)) $dc = $dc[0];
            else return;

            $imnum = array_key_exists('IMAGENUMBER', $options) ? $options['IMAGENUMBER'] : $dc['STARTIMAGENUMBER'];

            $temp = preg_replace_callback('/(#+)/', function($mat) use ($imnum) {
                return str_pad($imnum, strlen($mat[1]), '0', STR_PAD_LEFT);
            }, $dc['FILETEMPLATE']);

            if (!array_key_exists('SUFFIX', $options)) {
                $temp = str_replace('.'.$dc['IMAGESUFFIX'], '', $temp);
            }

            return array('IMFILE' =>$temp, 'IMDIRECTORY' => $this->relative($dc['IMAGEDIRECTORY'], array('SESSIONID' => $dc['SESSIONID'])), 'IMPREFIX' => $dc['IMAGEPREFIX'], 'DCNUMBER' => $dc['DATACOLLECTIONNUMBER']);
        }
}
