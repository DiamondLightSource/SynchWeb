<?php

    # ------------------------------------------------------------------------
    # PDF Generation
    # In order to keep things simple, pdfs are rendered from html templates using
    # mdpf, this should make it easy to update reports and labels in the future.
    # Templates are kept in assets/pdf, member variables of this class are
    # automatically available in the template files
    
    class Pdf extends Page {
        private $vars  = array();
        
        public static $arg_list = array('visit' => '\w+\d+\-\d+',
                              'sid' => '\d+',
                              'p' => '\d',
                              'cid' => '\d+',
                              'did' => '\d+',
                              'sid' => '\d+',
                              'labels' => '[\w-]+',
                              'month' => '\d\d-\d\d\d\d',
                              );

        public static $dispatch = array(array('/sid/:sid/prop/:prop', 'get', '_shipment_label'),
                              array('/container(/sid/:sid)(/cid/:cid)(/did/:did)/prop/:prop', 'get', '_container_report'),
                              array('/report/visit/:visit', 'get', '_visit_report'),
                              array('/sheets', 'get', '_generate_sheets'),
                              array('/awb/sid/:sid', 'get', '_get_awb'),
                              array('/manifest', 'get', '_get_manifest'),
        );
        
        # ------------------------------------------------------------------------
        # Shipment Labels
        function _get_manifest() {
            if (!$this->user->has('view_manifest')) $this->_error('Access denied');

            $month = $this->has_arg('month') ? $this->arg('month') : date('m-Y');

            $d = new DateTime('01-'.$month);
            $d->modify('first day of this month');
            $start = $d->format('d-m-Y');
            $d->modify('last day of this month');
            $end = $d->format('d-m-Y');

            $this->period = $start.' to '.$end;

            $this->shipments = $this->db->pq("SELECT s.shippingid, s.deliveryagent_agentcode, s.deliveryagent_productcode, IF(cta.couriertermsacceptedid,1,0) as termsaccepted, GROUP_CONCAT(d.deliveryagent_barcode) as deliveryagent_barcode, s.deliveryagent_flightcode, TO_CHAR(s.deliveryagent_shippingdate, 'DD-MM-YYYY') as deliveryagent_shippingdate, TO_CHAR(s.deliveryagent_flightcodetimestamp, 'HH24:MI DD-MM-YYYY') as deliveryagent_flightcodetimestamp, count(distinct d.dewarid) as dewars, sum(d.weight) as weight, pe.givenname, pe.familyname, l.name as labname, l.address, l.city, l.postcode, l.country, CONCAT(p.proposalcode, p.proposalnumber) as prop
                FROM shipping s 
                INNER JOIN dewar d ON s.shippingid = d.shippingid
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                LEFT OUTER JOIN couriertermsaccepted cta ON cta.shippingid = s.shippingid
                INNER JOIN labcontact c ON c.labcontactid = s.sendinglabcontactid
                INNER JOIN person pe ON c.personid = pe.personid 
                INNER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid 
                WHERE s.deliveryagent_flightcodetimestamp is NOT NULL
                    AND d.deliveryagent_barcode IS NOT NULL
                    AND s.deliveryagent_shippingdate >= TO_DATE(:1, 'DD-MM-YYYY')
                    AND s.deliveryagent_shippingdate <= TO_DATE(:2, 'DD-MM-YYYY')
                GROUP BY s.shippingid", array($start, $end));

            $totals = array('WEIGHT' => 0, 'PIECES' => 0, 'SHIPMENTS' => 0);
            foreach ($this->shipments as $s) {
                $totals['WEIGHT'] += $s['WEIGHT'];
                $totals['PIECES'] += $s['DEWARS'];
                $totals['SHIPMENTS']++;
            }

            $this->totals = $totals;

            global $facility_company, $facility_address, $facility_city, $facility_postcode, $facility_country, $facility_phone, $dhl_acc;
            $addr = array(str_replace("\n", '<br />', $facility_address), $facility_city, $facility_postcode, $facility_country, $facility_phone);
            $this->facility = $facility_company;
            $this->facility_address = implode("<br />", $addr);
            $this->facility_account = $dhl_acc;

            $this->_render('shipping_manifest', 'L');
        }

        
        # ------------------------------------------------------------------------
        # Shipment Labels
        function _shipment_label() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified', 'Please select a proposal first');
            if (!$this->has_arg('sid')) $this->_error('No shipment specified', 'No shipment id was specified');
            
            $ship = $this->db->pq("SELECT s.safetylevel, CONCAT(p.proposalcode, p.proposalnumber) as prop, s.shippingid, s.shippingname, pe.givenname, pe.familyname, pe.phonenumber,pe.faxnumber, l.name as labname, l.address, l.city, l.postcode, l.country, pe2.givenname as givenname2, pe2.familyname as familyname2, pe2.phonenumber as phonenumber2, pe2.faxnumber as faxnumber2, l2.name as labname2, l2.address as address2, l2.city as city2, '' as postcode2, l2.country as country2, c2.courieraccount, c2.billingreference, c2.defaultcourriercompany 
                FROM shipping s 
                INNER JOIN labcontact c ON s.sendinglabcontactid = c.labcontactid 
                INNER JOIN person pe ON c.personid = pe.personid 
                INNER JOIN laboratory l ON l.laboratoryid = pe.laboratoryid 
                INNER JOIN labcontact c2 ON s.returnlabcontactid = c2.labcontactid 
                INNER JOIN person pe2 ON c2.personid = pe2.personid
                INNER JOIN laboratory l2 ON l2.laboratoryid = pe2.laboratoryid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid  
                WHERE s.shippingid=:1", array($this->arg('sid')));
            if (!sizeof($ship)) $this->_error('No such shipment', 'The specified shipment doesnt exist');
            else $ship = $ship[0];
            
            $addr = array($ship['ADDRESS']);
            if ($ship['CITY']) array_push($addr, $ship['CITY']."\n");
            if ($ship['POSTCODE']) array_push($addr, $ship['POSTCODE']."\n");
            if ($ship['COUNTRY']) array_push($addr, $ship['COUNTRY']."\n");
            $ship['ADDRESS'] = str_replace("\n", '<br/>',  implode(', ', $addr));

            $addr = array($ship['ADDRESS2']);
            if ($ship['CITY2']) array_push($addr, $ship['CITY2']."\n");
            if ($ship['POSTCODE2']) array_push($addr, $ship['POSTCODE2']."\n");
            if ($ship['COUNTRY2']) array_push($addr, $ship['COUNTRY2']."\n");
            $ship['ADDRESS2'] = str_replace("\n", '<br/>',  implode(', ', $addr));
            
            global $facility_fao, $facility_company, $facility_address, $facility_city, $facility_postcode, $facility_country, $facility_phone;
            $addr = array($facility_fao, $facility_company, str_replace("\n", '<br />', $facility_address), $facility_city, $facility_postcode, $facility_country, $facility_phone);
            $ship['FACILITYADDRESS'] = implode("<br />", $addr);

            $this->ship = $ship;
            
            $this->dewars = $this->db->pq("SELECT bl.beamlinename, bl.beamlineoperator, TO_CHAR(bl.startdate, 'DD-MM-YYYY') as st, d.transportvalue, d.customsvalue, d.code, d.barcode 
                FROM dewar d 
                LEFT OUTER JOIN blsession bl ON d.firstexperimentid = bl.sessionid 
                WHERE d.shippingid=:1", array($ship['SHIPPINGID']));
            
            $this->_render('shipment_label');
        }


        function _get_awb() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('sid')) $this->_error('No shipping id specified');
            
            $ship = $this->db->pq("SELECT s.shippingid, s.deliveryagent_label
                FROM shipping s 
                WHERE s.proposalid = :1 AND s.shippingid = :2", array($this->proposalid,$this->arg('sid')));
            
            if (!sizeof($ship)) $this->_error('No such shipment');

            if ($ship[0]['DELIVERYAGENT_LABEL']) {
                $this->app->contentType('application/pdf');
                echo base64_decode($ship[0]['DELIVERYAGENT_LABEL']);
            } else $this->_error('No airway bill for this shipment');
        }
        
        
        # ------------------------------------------------------------------------
        # Report of Data Collections
        function _visit_report() {
            if (!$this->has_arg('visit')) $this->_error('No visit specified', 'You need to specify a visit to view this page');
            
            $info = $this->db->pq("SELECT TIMESTAMPDIFF('MINUTE', s.startdate, s.enddate)/60 as len, s.sessionid as sid, s.beamlinename, s.beamlineoperator as lc, TO_CHAR(s.startdate, 'DD-MM-YYYY HH24:MI') as st, TO_CHAR(s.enddate, 'DD-MM-YYYY HH24:MI') as en, CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) as visit, CONCAT(p.proposalcode, p.proposalnumber) as prop 
                FROM blsession s 
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
            if (!sizeof($info)) $this->_error('No such visit', 'The specified visit doesnt exist');
            else $info = $info[0];
            
            $this->info = $info;
            
            $this->users = $this->db->pq("SELECT p.title, p.familyname, p.givenname FROM person p 
                    INNER JOIN session_has_person shp ON p.personid = shp.personid 
                    WHERE shp.sessionid=:1", array($info['SID']));

            
            $rows = $this->db->pq("SELECT dc.datacollectionid as id, dc.overlap,dc.imageprefix,dc.imagedirectory as dir,dc.datacollectionnumber,TO_CHAR(dc.starttime, 'DD/MM/YYYY HH24:MI:SS'), sa.name, p.name as protein, dc.numberofimages, dc.wavelength, dc.detectordistance, dc.exposuretime, dc.axisstart, dc.axisrange, dc.xbeam, dc.ybeam, dc.resolution, dc.comments 
                FROM datacollection dc 
                LEFT OUTER JOIN blsample sa ON dc.blsampleid = sa.blsampleid 
                LEFT OUTER JOIN crystal c ON sa.crystalid = c.crystalid 
                LEFT OUTER JOIN protein p ON c.proteinid = p.proteinid 
                WHERE dc.sessionid=:1 ORDER BY dc.starttime", array($info['SID']));
            
            if (!sizeof($rows)) $this->_error('No data', 'No data collections for this visit yet');
            
            $screen = array();
            $dcs = array();
            foreach ($rows as $dc) {
                if ($dc['OVERLAP'] == 0) array_push($dcs, 'api.datacollectionid='.$dc['ID']);
                else array_push($screen, 'datacollectionid='.$dc['ID']);
            }
            
            $screen = implode(' OR ', $screen);
            $dcs = implode(' OR ', $dcs);
            
            $aps = sizeof($dcs) ? $this->db->pq("SELECT api.datacollectionid as id, app.autoprocprogramid,app.processingcommandline as type, apss.ntotalobservations as ntobs, apss.ntotaluniqueobservations as nuobs, apss.resolutionlimitlow as rlow, apss.resolutionlimithigh as rhigh, apss.scalingstatisticstype as shell, apss.rmeasalliplusiminus as rmeas, apss.rmerge, apss.completeness, apss.anomalouscompleteness as anomcompleteness, apss.anomalousmultiplicity as anommultiplicity, apss.multiplicity, apss.meanioversigi as isigi, ap.spacegroup as sg, ap.refinedcell_a as cell_a, ap.refinedcell_b as cell_b, ap.refinedcell_c as cell_c, ap.refinedcell_alpha as cell_al, ap.refinedcell_beta as cell_be, ap.refinedcell_gamma as cell_ga 
                FROM autoprocintegration api 
                INNER JOIN autoprocscaling_has_int aph ON api.autoprocintegrationid = aph.autoprocintegrationid 
                INNER JOIN autoprocscaling aps ON aph.autoprocscalingid = aps.autoprocscalingid 
                INNER JOIN autoproc ap ON aps.autoprocid = ap.autoprocid 
                INNER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid 
                INNER JOIN autoprocprogram app ON api.autoprocprogramid = app.autoprocprogramid 
                WHERE $dcs") : array();
            
            $types = array('fast_dp' => 1, '-3da ' => 3, '-2da ' => 2, '-3daii ' => 4);
            $dts = array('cell_a', 'cell_b', 'cell_c', 'cell_al', 'cell_be', 'cell_ga');
            $dts2 = array('rlow', 'rhigh');
            
            $ap = array();
            foreach ($aps as &$a) {
                foreach ($types as $id => $name) {
                    if (strpos($a['TYPE'], $id)) {
                        $a['TYPE'] = $name;
                        break;
                    }
                }
                
                foreach ($dts as $d) {
                    $a[strtoupper($d)] = number_format($a[strtoupper($d)], 2);
                }
                
                
                if (!array_key_exists($a['ID'], $ap)) $ap[$a['ID']] = array();
                if (!array_key_exists($a['TYPE'], $ap[$a['ID']])) $ap[$a['ID']][$a['TYPE']] = array();
                
                $a['ISIGI'] = number_format($a['ISIGI'], 1);
                $a['RMEAS'] = number_format($a['RMEAS'], 3);
                $a['COMPLETENESS'] = number_format($a['COMPLETENESS'], 1);
                
                $ap[$a['ID']][$a['TYPE']][$a['SHELL']] = $a;
            }

            foreach ($rows as &$dc) {
                if (array_key_exists($dc['ID'], $ap)) {
                    $a = $ap[$dc['ID']][max(array_keys($ap[$dc['ID']]))];
                    
                    $o = $a['overall'];
                    $dc['SG'] = $o['SG'];
                    $dc['CELL'] = $o['CELL_A'].', '.$o['CELL_B'].', '.$o['CELL_C'].'<br/>'.$o['CELL_AL'].', '.$o['CELL_BE'].', '.$o['CELL_GA'];
                    
                    $dc['AP'] = array($o,$a['innerShell'],$a['outerShell']);
                    
                } else {
                    $dc['SG'] = '';
                    $dc['CELL'] = '';
                    $dc['AP'] = array();
                }
                
                $dc['DIR'] = preg_replace('/.*\/\d\d\d\d\/\w\w\d+-\d+\//', '', $dc['DIR']);
            }
            
            $this->dcs = $rows;
            
            $rows = $this->db->pq("SELECT sa.name, p.name as protein, es.element, es.peakfprime, es.exposuretime, es.peakfdoubleprime, TO_CHAR(es.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, es.transmissionfactor as transmission, es.inflectionfprime, es.inflectionfdoubleprime, es.comments, es.peakenergy, es.inflectionenergy 
                FROM energyscan es 
                LEFT OUTER JOIN blsample sa ON es.blsampleid = sa.blsampleid 
                LEFT OUTER JOIN crystal c ON sa.crystalid = c.crystalid 
                LEFT OUTER JOIN protein p ON c.proteinid = p.proteinid 
                WHERE es.sessionid=:1 ORDER BY es.starttime", array($info['SID']));
            
            foreach ($rows as &$r) $r['TRANSMISSION']*= 100;
            
            $this->ess = $rows;
            
            $rows = $this->db->pq("SELECT sa.name, p.name as protein, xrf.filename as dir, xrf.exposuretime, TO_CHAR(xrf.starttime, 'DD-MM-YYYY HH24:MI:SS') as st, xrf.beamtransmission as transmission, xrf.energy, xrf.comments 
                FROM xfefluorescencespectrum xrf 
                LEFT OUTER JOIN blsample sa ON xrf.blsampleid = sa.blsampleid 
                LEFT OUTER JOIN crystal c ON sa.crystalid = c.crystalid 
                LEFT OUTER JOIN protein p ON c.proteinid = p.proteinid 
                WHERE xrf.sessionid=:1 ORDER BY xrf.starttime", array($info['SID']));
            
            foreach ($rows as &$r) {
                $results = str_replace('.mca', '.results.dat', preg_replace('/(data\/\d\d\d\d\/\w\w\d+-\d+)/', '\1/processed/pymca', $r['DIR']));
                    
                $elements = array();
                if (file_exists($results)) {
                    $dat = explode("\n",file_get_contents($results));
                    foreach ($dat as $i => $d) {
                        $l = explode(' ', $d);
                        if ($i < 5) array_push($elements, $l[0]);
                    }
                }
                
                $r['ELEMENTS'] = $elements;
            }

            $this->fls = $rows;

            // Generate stats here by consuming REST API internally.
            
            $this->_render('visit_report', 'L');
        }
        
        
        # ------------------------------------------------------------------------
        # Report of containers from a dewar
        function _container_report() {
            if (!($this->has_arg('cid') || $this->has_arg('did') || $this->has_arg('sid'))) $this->_error('No container, dewar, or shipment', 'No container, dewar, or shipment was specified');
            if (!$this->has_arg('prop')) $this->_error('No proposal specified', 'No proposal was specified');
            
            if ($this->has_arg('cid')) {
                $where = 'c.containerid=:2';
                $args = $this->arg('cid');
            }
            
            if ($this->has_arg('did')) {
                $where = 'd.dewarid=:2';
                $args = $this->arg('did');
            }
            
            if ($this->has_arg('sid')) {
                $where = 's.shippingid=:2';
                $args = $this->arg('sid');
            }
            
            
            $containers = $this->db->pq("SELECT CONCAT(p.proposalcode, p.proposalnumber) as prop, c.capacity, c.containerid,c.code as container, d.code as dewar, s.shippingname as shipment 
                FROM container c 
                INNER JOIN dewar d ON d.dewarid = c.dewarid 
                INNER JOIN shipping s ON s.shippingid = d.shippingid 
                INNER JOIN proposal p ON p.proposalid = s.proposalid 
                WHERE p.proposalid=:1 AND $where", array($this->proposalid, $args));
            
            
            foreach ($containers as &$c) {
                $c['SAMPLES'] = $this->db->pq("SELECT sp.code, sp.comments, sp.name, TO_NUMBER(sp.location) as location, pr.acronym, cr.spacegroup 
                    FROM blsample sp 
                    INNER JOIN crystal cr ON sp.crystalid = cr.crystalid 
                    INNER JOIN protein pr ON cr.proteinid = pr.proteinid 
                    INNER JOIN container c ON sp.containerid = c.containerid 
                    INNER JOIN dewar d ON d.dewarid = c.dewarid 
                    INNER JOIN shipping s ON s.shippingid = d.shippingid 
                    WHERE pr.proposalid=:1 AND c.containerid = :2 
                    ORDER BY TO_NUMBER(sp.location)", array($this->proposalid,$c['CONTAINERID']));
                
                $used = array();
                foreach($c['SAMPLES'] as $r) array_push($used, $r['LOCATION']);
                $tot = array();
                for ($i = 1; $i < $c['CAPACITY']+1; $i++) array_push($tot, $i);
                
                foreach (array_diff($tot, $used) as $i => $d) {
                    array_splice($c['SAMPLES'], $d-1, 0, array(array('COMMENTS' => '', 'NAME' => '', 'LOCATION' => $d, 'ACRONYM' => '', 'SPACEGROUP' => '', 'CODE' => '')));
                }
            }
            
            $this->containers = $containers;
            $this->_render('container', 'L');            
        }
        
        
        # ------------------------------------------------------------------------
        # Generate barcodes for labels
        function _generate_sheets() {
            $this->labels = array('i03', 'mx-storage-i03', 'i03-rack', 'mx-storage-i02', 'mx-storage-i04', 'mx-storage-i04-1', 'mx-storage-i24', 'mx-storage-in-in','mx-storage-in-out');

            if ($this->has_arg('labels')) {
                if (is_array($this->arg('labels'))) $this->labels = $this->arg('labels');
                else $this->labels = array($this->arg('labels'));
            }

            $this->_render('sheets', 'L');


        }

        
        # ------------------------------------------------------------------------
        # Render html template to PDF file
        function _render($file, $orientation = '') {
            ini_set('memory_limit', '256M');
            require_once('lib/mpdf/mpdf.php');

            $f = 'assets/pdf/'.$file.'.php';
            
            if (!$this->has_arg('p')) {
                if ($orientation) $orientation = '-'.$orientation;
                
                # Enable output buffering to capture html
                ob_start();
                $mpdf = new mPDF('', 'A4'.$orientation);
                $mpdf->WriteHTML(file_get_contents('assets/pdf/styles.css'),1);
                
                if (file_exists($f)) {
                    extract($this->vars);
                    include($f);
                }

                # Write output buffer to pdf
                $mpdf->WriteHTML(ob_get_contents());
                ob_end_clean();

                $this->app->contentType('application/pdf');
                $mpdf->Output();
                
            
            # Preview mode outputs raw html, add /p/1 to url
            } else {
                print "<html>\n     <head>\n        <link href=\"/api/assets/pdf/styles.css\" type=\"text/css\" rel=\"stylesheet\" >\n    </head>\n    <body>\n\n";

                if (file_exists($f)) {
                    extract($this->vars);
                    include($f);
                }

                print "\n\n    </body>\n</html>";
            }
        }

        function __get($name) {
            return $this->vars[$name];
        }
        
        function __set($name, $value) {
            $this->vars[$name] = $value;
        }
                        
    }

?>