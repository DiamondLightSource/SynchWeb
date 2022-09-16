<?php

namespace SynchWeb\Page;

use SynchWeb\Page;
use SynchWeb\Queue;

class Sample extends Page
{
        

        public static $arg_list = array('page' => '\d+',
                              'per_page' => '\d+',
                              'sort_by' => '\w+',
                              'order' => '\w+',
                              's' => '\w+',


                              'prop' => '\w+\d+',
                              'term' => '\w+',
                              'pid' => '\d+',
                              'sid' => '\d+',
                              'ssid' => '\d+',
                              'cid' => '\d+',
                              'crid' => '\d+',
                              'lid' => '\d+',
                              'value' => '.*',
                              'ty' => '\w+',
                              't' => '\w+',
                              'pjid' => '\d+',
                              'imp' => '\d',
                              'lt' => '\w+',
                              'existing_pdb' => '\d+',
                              'pdb_code' => '\w\w\w\w',
                              'pdbid' => '\d+',
                              'visit' => '\w+\d+-\d+',
                              'type' => '\d+',
                              'global' => '\d+',
                              'seq' => '\d',
                              'bcd' => '\d',
                              'phase' => '',
                              'crystal' => '',
                              'container' => '',
                              'capillary' => '',
                              'capillaryPhase' => '',
                              'json' => '',
                              'dcp' => '\d',

                              'collected_during' => '\w+\d+-\d+',

                              'DEWARID' => '\d+',
                              'PROTEINID' => '\d+',
                              'CRYSTALID' => '\d+',
                              'CONTAINERID' => '\d+',
                              'LOCATION' => '\d+',
                              'CODE' => '(\w|\s|\-)+|^$', // Change validation to work for dashes as well as numbers
                              // 'NAME' => '.*',
                              'ACRONYM' => '([\w-])+',
                              'SEQUENCE' => '[\s\w\(\)\.>\|;\n]+',
                              'MOLECULARMASS' => '\d+(.\d+)?',
                              'VOLUME' => '\d+(.\d+)?',
                              'DENSITY' => '\d+(.\d+)?',
                              'THEORETICALDENSITY' => '\d+(.\d+)?',

                              'NAME' => '[\w\s-()]+',
                              'COMMENTS' => '.*',
                              'SPACEGROUP' => '(\w|\s|\-|\/)+|^$', // Any word character (inc spaces bars and slashes) or empty string
                              'CELL_A' => '\d+(.\d+)?',
                              'CELL_B' => '\d+(.\d+)?',
                              'CELL_C' => '\d+(.\d+)?',
                              'CELL_ALPHA' => '\d+(.\d+)?',
                              'CELL_BETA' => '\d+(.\d+)?',
                              'CELL_GAMMA' => '\d+(.\d+)?',
                              'REQUIREDRESOLUTION' => '\d+(.\d+)?',
                              'ANOMALOUSSCATTERER' => '(\w+)|^$', // Any word character or empty string
                              'BLSUBSAMPLEID' => '\d+',
                              'SCREENCOMPONENTGROUPID' => '\d+',

                              'COMPONENTTYPEID' => '\d+',
                              'CONCENTRATIONTYPEID' => '\d+',
                              'GLOBAL' => '\d+',

                              'COMPONENTIDS' => '\d+',
                              'COMPONENTAMOUNTS' => '\d+(.\d+)?',
                              'ABUNDANCE' => '\d+(.\d+)?',
                              'PACKINGFRACTION' => '\d+(.\d+)?',
                              'DIMENSION1' => '\d+(.\d+)?',
                              'DIMENSION2' => '\d+(.\d+)?',
                              'DIMENSION3' => '\d+(.\d+)?',
                              'SHAPE' => '\w+',
                              'LOOPTYPE' => '\w+',
                              'COMPONENTID' => '\d+',
                              'BLSAMPLETYPEID' => '\d+',
                              'scid' => '\d+-\d+',

                              'BLSAMPLEID' => '\d+',
                              'X' => '\d+(.\d+)?',
                              'Y' => '\d+(.\d+)?',
                              'Z' => '\d+(.\d+)?',
                              'X2' => '\d+(.\d+)?',
                              'Y2' => '\d+(.\d+)?',
                              'Z2' => '\d+(.\d+)?',

                              'EXPERIMENTKIND' => '[\w|\s]+',
                              'CENTRINGMETHOD' => '\w+',
                              'RADIATIONSENSITIVITY' => '\w+',
                              'ENERGY' => '\w+',
                              'USERPATH' => '(?=.{0,40}$)(\w|-)+\/?(\w|-)+', // Up to two folders as a path, 40 characters maximum
                              'EXPOSURETIME' => '\d+(.\d+)?',
                              'PREFERREDBEAMSIZEX' => '\d+(.\d+)?',
                              'PREFERREDBEAMSIZEY' => '\d+(.\d+)?',
                              'BOXSIZEX' => '\d+',
                              'BOXSIZEY' => '\d+',
                              'NUMBEROFIMAGES' => '\d+',
                              'AXISSTART' => '-?\d+(.\d+)?',
                              'AXISRANGE' => '\d+(.\d+)?',
                              'TRANSMISSION' => '\d+(.\d+)?',
                              'ENERGY' => '\d+(.\d+)?',
                              'MONOCHROMATOR' => '\w+',
                              'PRESET' => '\d',
                              'BEAMLINENAME' => '[\w-]+',

                              'queued' => '\d',
                              'UNQUEUE' => '\d',
                              'nodata' => '\d',
                              'notcompleted' => '\d',

                               // external is a flag to indicate this protein/sample has a user office system id
                               // whereas externalid is the actual reference
                              'external' => '\d',
                              // Original refers to the real user office sample - not any clone / copy
                              'original' => '\d',
                              'EXTERNALID' => '\w+',
                              'SAFETYLEVEL' => '\w+',

                              'COMPONENTLATTICEID' => '\d+',

                              'BLSAMPLEGROUPID' => '\d+',
                              'GROUPORDER' => '\d+',
                              'TYPE' => '\w+',
                              'BLSAMPLEGROUPSAMPLEID' => '\d+-\d+',
                              'PLANORDER' => '\d',

                              'SAMPLEGROUPID' => '\d+',
                              'SCREENINGMETHOD' => '\w+',
                              'SCREENINGCOLLECTVALUE' => '\d+',
                              'SAMPLEGROUP' => '\d+',
                              'INITIALSAMPLEGROUP' => '\d+',
                              'STRATEGYOPTION' => '',
                              'MINIMUMRESOLUTION' => '\d+(.\d+)?',
                              'groupSamplesType' => '.*' // query parameter to query sample groups by sample types. Should be comma separated values like so: groupSamplesType=container,capillary
        );
        
        
        public static $dispatch = array(array('(/:sid)(/cid/:cid)', 'get', '_samples'),
                              array('', 'put', '_bulk_update_sample_full'),
                              array('/:sid', 'patch', '_update_sample'),
                              array('/:sid', 'put', '_update_sample_full'),
                              array('', 'post', '_add_sample'),
                              array('/simple', 'post', '_add_simple_sample'),

                              array('/components', 'post', '_add_sample_component'),
                              array('/components/:scid', 'delete', '_remove_sample_component'),

                              array('/sub(/:ssid)(/sid/:sid)', 'get', '_sub_samples'),
                              array('/sub/:ssid', 'patch', '_update_sub_sample'),
                              array('/sub/:ssid', 'put', '_update_sub_sample_full'),
                              array('/sub', 'post', '_add_sub_sample'),
                              array('/sub/:ssid', 'delete', '_delete_sub_sample'),
                              array('/sub/queue(/:BLSUBSAMPLEID)', 'get', '_pre_q_sub_sample'),

                              array('/plan', 'get', '_get_diffraction_plans'),
                              array('/plan', 'post', '_add_diffraction_plan'),
                              array('/plan/:pid', 'patch', '_update_diffraction_plan'),
                              array('/plan/:pid', 'delete', '_delete_diffraction_plan'),


                              array('/proteins(/:pid)', 'get', '_proteins'),
                              array('/proteins', 'post', '_add_protein'),
                              array('/proteins/:pid', 'patch', '_update_protein'),
                              array('/proteins/distinct', 'get', '_disinct_proteins'),

                              array('/proteins/lattice(/:lid)', 'get', '_protein_lattices'),
                              array('/proteins/lattice', 'post', '_add_protein_lattice'),
                              array('/proteins/lattice/:lid', 'patch', '_update_protein_lattice'),


                              array('/crystals(/:CRYSTALID)', 'get', '_crystals'),
                              array('/crystals', 'post', '_add_crystal'),
                              array('/crystals/:CRYSTALID', 'patch', '_update_crystal'),

                              array('/pdbs(/pid/:pid)', 'get', '_get_pdbs'),
                              array('/pdbs', 'post', '_add_pdb'),
                              array('/pdbs(/:pdbid)', 'delete', '_remove_pdb'),

                              array('/concentrationtypes', 'get', '_concentration_types'),
                              array('/componenttypes', 'get', '_component_types'),

                              array('/groups', 'get', '_sample_groups'),
                              array('/groups', 'post', '_add_new_sample_group'),
                              array('/groups/:BLSAMPLEID', 'get', '_get_sample_groups_by_sample'),
                              array('/groups/:BLSAMPLEGROUPID/samples', 'post', '_add_sample_to_group'),
                              array('/groups/:BLSAMPLEGROUPID/samples/:BLSAMPLEGROUPSAMPLEID', 'put', '_update_sample_in_group'),
                              array('/groups/:BLSAMPLEGROUPID/samples/:BLSAMPLEGROUPSAMPLEID', 'delete', '_remove_sample_from_group'),
                              array('/groups/:BLSAMPLEGROUPID/samples', 'get', '_get_sample_group_samples'),

                              array('/spacegroups(/:SPACEGROUPID)', 'get', '_get_spacegroups'),

        );


        /**
         * Insert Protein, Crystal, Container, BLSample, DiffractionPlan (+associated tables) and PDB file information as a single transaction
         * Can add one or more complete sets of sample information to ISPyB from a form submission or a file upload
         * */
        function _add_simple_sample() {
            // ID holder for all the ids associated with the current iteration
            // This will be populated by getting ids of each entity after insertion
            // Mostly a helper store for ids but also the return value of this method
            $ids = array();

            // Placeholder capillary id variables that will be null until populated (if required) on first iteration of foreach loop below
            // For further iterations the value assigned will be re-used to associated remaining samples with the set capillary
            $capillaryPhaseId = null;
            $capillaryId = null;
            $blSampleCapillaryId = null;

            // Default values used for diffraction plan
            $defaultBeamSizeX = 70;
            $defaultBeamSizeY = 70;
            $defaultEnergy = 76600;
            $defaultMonoBandwidth = 0.1;

            // Hardcoded detector ids?
            $detector1_id = 28;
            $detector1_distance = 200;

            $detector2_id = 25;
            $detector2_distance = 800;

            $this->db->start_transaction();

            /**
             * Sets of sample information will appear in $args as "sample_1", "sample_2" etc
             * Therefore we can reuse the code for form submission or file upload
             * */
            foreach($this->args as $model => $attrs) {
                // Not interested in anything that isn't sample information
                if(substr($model, 0, strpos($model, '_', 0)) != 'sample') {
                    continue;
                } else {
                    // Critical model validation (we won't insert anything if these fail)
                    if (!$attrs->prop) $this->_error('No proposal specified');
                    if (!$attrs->crystal) $this->_error('No crystal defined');
                    if (!$attrs->capillary) $this->_error('No capillary defined');
                    if (!$attrs->capillaryPhase) $this->_error('No capillary material defined');
                    if (!$attrs->phase) $this->_error('No phase defined');
                    if (!$attrs->container) $this->_error('No container defined');
                    if (!$attrs->DEWARID) $this->_error('No default dewar defined');
                    
                    $phase = $attrs->phase;
                    $crystal = $attrs->crystal;
                    $container = $attrs->container;
                    $capillary = $attrs->capillary;
                    $capillaryPhase = $attrs->capillaryPhase;

                    // Critical sub model validation, we again can't proceed if anything is missing
                    if (!array_key_exists('PROTEINID', $phase) && !array_key_exists('ACRONYM', $phase)) $this->_error('No protein id or acronym');
                    if (!array_key_exists('ACRONYM', $capillaryPhase)) $this->_error('No protein acronym for capillary material');
                    if (!array_key_exists('NAME', $crystal)) $this->_error('No crystal name specified');
                    if (!array_key_exists('NAME', $capillary) || !array_key_exists('CRYSTALID', $capillary)) $this->_error('No capillary name specified');
                    if (!array_key_exists('NAME', $container)) $this->_error('No container name specified');
                    if (!array_key_exists('CONTAINERTYPE', $container)) $this->_error('No container type specified');

                    // Create ID holder for this iteration (this set of sample information)
                    $ids[$model] = array();

                    /**
                     * Insert Proteins
                     * For each iteration there will be an actual protein and usually (not always) a capillary in which the protein is held
                     * A Protein can be 'containerless' (no capillary) as identified by a boolean flag, or it may be associated with an existing capillary already in ISPyB
                     * We need to check the above conditions to see if we are being asked to create a new capillary, re-use an existing one or do nothing (containerless)
                     * If we need to add protein information for a capillary it will be added to an array with the actual protein information
                     *
                     * When a file upload is received, it's only possible to associate all the samples with one capillary (whether it already existed or is to be created)
                     * The variable $capillaryPhaseId will be null on first iteration which will ensure a new capillary is added and then re-used for all other iterations
                     */
                    $phases = null;
                    if($attrs->fromFile)
                        $phases = $capillaryPhaseId == null && !$capillary->CONTAINERLESS && $capillary->CRYSTALID == null ? array($capillaryPhase, $phase) : array($phase);
                    else
                        $phases = $capillary->CRYSTALID == null && !$capillary->CONTAINERLESS ? array($capillaryPhase, $phase) : array($phase);

                    $isCapillary = sizeof($phases) > 1 ? true : false;

                    foreach($phases as $protein){
                        $phaseName = array_key_exists('NAME', $protein) ? $protein->NAME : '';
                        $phaseSeq = array_key_exists('SEQUENCE', $protein) ? $protein->SEQUENCE : '';
                        $phaseMass = array_key_exists('MOLECULARMASS', $protein) ? $protein->MOLECULARMASS : null;
                        $phaseDensity = array_key_exists('DENSITY', $protein) ? $protein->DENSITY : null;
                        $externalid = array_key_exists('EXTERNALID', $protein) ? $protein->EXTERNALID : null;

                        $chk = $this->db->pq("SELECT proteinid FROM protein
                            WHERE proposalid=:1 AND acronym=:2", array($this->proposalid, $protein->ACRONYM));
                            if (sizeof($chk)) $this->_error('Protein acronym ' . $protein->ACRONYM . ' already exists in this proposal');

                        $this->db->pq('INSERT INTO protein (proteinid,proposalid,name,acronym,sequence,molecularmass,bltimestamp,density,externalid)
                            VALUES (s_protein.nextval,:1,:2,:3,:4,:5,CURRENT_TIMESTAMP,:6,UNHEX(:7)) RETURNING proteinid INTO :id',
                            array($this->proposalid, $phaseName, $protein->ACRONYM, $phaseSeq, $phaseMass, $phaseDensity, $externalid));
                            
                        if($isCapillary){
                            $ids[$model]['CAPILLARYPHASEID'] = $this->db->id();
                            $capillaryPhaseId = $this->db->id();
                        } else {
                            $ids[$model]['PHASEID'] = $this->db->id();
                            $ids[$model]['CAPILLARYPHASEID'] = $capillaryPhaseId;
                        }
                        $isCapillary = false;
                    }

                    /**
                     * Insert Crystals
                     * The same as Proteins, in each iteration we need to check if we have Crystal information for both the actual crystal and its capillary (if required)
                     * If the crystal is to be containerless there will not be any crystal information for a capillary.
                     *
                     * Same logic on proteins applies to the file upload where $capillaryId holds the same single capillary id ready to associate it with all samples added in the transaction
                     * */
                    $crystals = null;
                    if($attrs->fromFile)
                        $crystals = $capillaryId == null && !$capillary->CONTAINERLESS && $capillary->CRYSTALID == null ? array($capillary, $crystal) : array($crystal);
                    else
                        $crystals = $capillary->CRYSTALID == null && !$capillary->CONTAINERLESS ? array($capillary, $crystal) : array($crystal);

                    $isCapillary = sizeof($crystals) > 1 ? true : false;

                    foreach($crystals as $sample){
                        $c = array();
                        foreach (array('SPACEGROUP', 'COMMENTS', 'NAME') as $f) $c[$f] = array_key_exists($f, $sample) ? $sample->$f : '';
                        foreach (array('ABUNDANCE', 'THEORETICALDENSITY') as $f) $c[$f] = array_key_exists($f, $sample) ? $sample->$f : null;

                        $pid = $isCapillary ? $ids[$model]['CAPILLARYPHASEID'] : $ids[$model]['PHASEID'];

                        $this->db->pq("INSERT INTO crystal (crystalid,proteinid,spacegroup,abundance,comments,name,theoreticaldensity) VALUES (s_crystal.nextval,:1,:2,:3,:4,:5,:6) RETURNING crystalid INTO :id", 
                            array($pid, $c['SPACEGROUP'], $c['ABUNDANCE'], $c['COMMENTS'], $c['NAME'], $c['THEORETICALDENSITY']));

                        if($isCapillary){
                            $ids[$model]['CAPILLARYID'] = $this->db->id();
                            $capillaryId = $this->db->id();
                        } else {
                            $ids[$model]['CRYSTALID'] = $this->db->id();
                        }
                        $isCapillary = false;
                    }

                    // Recently changed this so assumption is that request includes the default dewar id
                    // Avoids the need for a shared function. UI calls /dewar/default end point first
                    // No other info required about dewar so reuse of current endpoint preferred in this case
                    $ids[$model]['DEWARID'] = $attrs->DEWARID;
                    
                    // Do we have a container associated with this dewar?
                    $chk = $this->db->pq("SELECT containerid FROM container WHERE dewarid =:1", array($ids[$model]['DEWARID']));
                    if (sizeof($chk)) $ids[$model]['CONTAINERID'] = $chk[0]['CONTAINERID'];

                    // Insert Container if we don't already have one
                    if(!array_key_exists('CONTAINERID', $ids[$model])) {
                        $cap = array_key_exists('CAPACITY', $container) ? $container->CAPACITY : 16;
                        $com = array_key_exists('COMMENTS', $container) ? $container->COMMENTS : null;

                        $this->db->pq("INSERT INTO container (containerid,dewarid,code,bltimestamp,capacity,containertype,comments) 
                        VALUES (s_container.nextval,:1,:2,CURRENT_TIMESTAMP,:3,:4,:5) RETURNING containerid INTO :id", 
                        array($ids[$model]['DEWARID'], $container->NAME, $cap, $container->CONTAINERTYPE, $com));
                        $ids[$model]['CONTAINERID'] = $this->db->id();
                    }

                    // ADD BLSAMPLES
                    $blSamples = array();
                    // In ISPyB a container can be various things, but for simple sample it is a box that can be imagined to have a grid layout
                    // We need to know which space the next sample needs to be added into. This query looks up the next free space
                    $maxloc_tmp = $this->db->pq("SELECT IFNULL((SELECT location FROM blsample WHERE containerid =:1 ORDER BY location * 1 DESC LIMIT 1),0) as location", array($ids[$model]['CONTAINERID']));
                    $maxLocation = $maxloc_tmp[0]['LOCATION'];
                    
                    // Like Proteins and Crystals, we need to check if we need to add the BLSample related information for the capillary as well as the sample
                    // Also: LoopType = 1 means the BLSample is a container/capillary. Took some hunting to figure that out...
                    if(array_key_exists('CAPILLARYID', $ids[$model]) && $capillary->CRYSTALID == null && !$capillary->CONTAINERLESS)
                        $blSamples['capillary'] = array('CONTAINERID' => $ids[$model]['CONTAINERID'], 'CRYSTALID' => $ids[$model]['CAPILLARYID'], 'PROTEINID' => $ids[$model]['CAPILLARYPHASEID'], 'LOCATION' => ++$maxLocation, 'NAME' => $capillary->NAME, 'PACKINGFRACTION' => 1, 'COMMENTS' => array_key_exists('COMMENTS', $capillary) ? $capillary->COMMENTS : '', 'DIMENSION1' => $capillary->OUTERDIAMETER, 'DIMENSION2' => $capillary->INNERDIAMETER, 'DIMENSION3' => $capillary->LENGTH, 'SHAPE' => $capillary->SHAPE, 'LOOPTYPE' => 1);
                    
                    $blSamples['sample'] = array('CONTAINERID' => $ids[$model]['CONTAINERID'], 'CRYSTALID' => $ids[$model]['CRYSTALID'], 'PROTEINID' => $ids[$model]['PHASEID'], 'LOCATION' => ++$maxLocation, 'NAME' => $crystal->NAME, 'PACKINGFRACTION' => $attrs->PACKINGFRACTION ? $attrs->PACKINGFRACTION : null, 'COMMENTS' => array_key_exists('COMMENTS', $crystal) ? $crystal->COMMENTS : '');
                    
                    foreach($blSamples as $key => $blSample){
                        $a = $this->_prepare_sample_args($blSample);
                        $this->db->pq("INSERT INTO blsample (blsampleid,crystalid,containerid,location,comments,name,code,packingfraction,dimension1,dimension2,dimension3,shape,looptype) VALUES (s_blsample.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12) RETURNING blsampleid INTO :id", 
                            array($key == 'capillary' ? $ids[$model]['CAPILLARYID'] : $ids[$model]['CRYSTALID'], $a['CONTAINERID'], $a['LOCATION'], $a['COMMENTS'], $a['NAME'] ,$a['CODE'], $a['PACKINGFRACTION'], $a['DIMENSION1'], $a['DIMENSION2'], $a['DIMENSION3'], $a['SHAPE'], $a['LOOPTYPE']));
                        
                        if($key == 'capillary'){
                            $ids[$model]['BLSAMPLECAPILLARYID'] = $this->db->id();
                            $blSampleCapillaryId = $this->db->id();
                        } else {
                            $ids[$model]['BLSAMPLEID'] = $this->db->id();
                        }

                        /**
                         * Add DiffractionPlan (DataCollectionPlan DCP) information
                         * This is a set of inserts that collectively make up a DCP and associate it to a BLSample
                         * There are two detectors required for xpdf on I15-1 so we have one insert for each and the detector distance for each is an agreed constant
                         * The dectectors and detector distance values can be changed by users from the plan experiements page in SynchWeb
                         *  */
                        $this->db->pq("INSERT INTO diffractionplan (preferredbeamsizex, preferredbeamsizey, energy, monobandwidth)
                            VALUES (:1, :2, :3, :4)", array($defaultBeamSizeX, $defaultBeamSizeY, $defaultEnergy, $defaultMonoBandwidth));
                        if($key == 'capillary')
                            $ids[$model]['CAPILLARYDIFFRACTIONPLANID'] = $this->db->id();
                        else
                            $ids[$model]['DIFFRACTIONPLANID'] = $this->db->id();

                        $expTime = $attrs->EXPOSURETIME ? $attrs->EXPOSURETIME : 600;

                        // Need to know the highest current DCP plan order so we can add new ones after it
                        $maxLocation = $this->_get_current_max_dcp_plan_order($ids[$model]['CONTAINERID']);

                        $this->db->pq("INSERT INTO blsample_has_datacollectionplan (blsampleid, datacollectionplanid, planorder) 
                            VALUES (:1, :2, :3)", array($key == 'capillary' ? $ids[$model]['BLSAMPLECAPILLARYID'] : $ids[$model]['BLSAMPLEID'], $key == 'capillary' ? $ids[$model]['CAPILLARYDIFFRACTIONPLANID'] : $ids[$model]['DIFFRACTIONPLANID'], $maxLocation+1));

                        $this->db->pq("INSERT INTO datacollectionplan_has_detector (datacollectionplanid, detectorid, exposureTime, distance)
                            VALUES (:1, :2, :3, :4)", array($key == 'capillary' ? $ids[$model]['CAPILLARYDIFFRACTIONPLANID'] : $ids[$model]['DIFFRACTIONPLANID'], $detector1_id, $expTime, $detector1_distance));

                        $this->db->pq("INSERT INTO datacollectionplan_has_detector (datacollectionplanid, detectorid, exposureTime, distance)
                            VALUES (:1, :2, :3, :4)", array($key == 'capillary' ? $ids[$model]['CAPILLARYDIFFRACTIONPLANID'] : $ids[$model]['DIFFRACTIONPLANID'], $detector2_id, $expTime, $detector2_distance));

                        $this->db->pq("INSERT INTO scanparametersmodel (scanparametersserviceid, datacollectionplanid, sequencenumber, start, stop, step) 
                            VALUES (:1, :2, :3, :4, :5, :6)", array(5, $key == 'capillary' ? $ids[$model]['CAPILLARYDIFFRACTIONPLANID'] : $ids[$model]['DIFFRACTIONPLANID'], 0, 0, 0, 1));
                    }

                    /**
                     * Add Container Group
                     * Assuming a sample is not marked as containerless, we need to create a container group which is just an id number
                     * This container group id is used by BLSampleGroup_has_BLSample in a many to many relationship by mapping it to a BLSample id
                     * Doing this allows a sample to be associated with a capillary for experiment planning which can be useful for background subtraction
                     *  */
                    if(!$capillary->CONTAINERLESS){
                        $this->db->pq("INSERT INTO blsamplegroup (blsamplegroupid, proposalid) VALUES(NULL, :1)", array($this->proposalid));
                        $ids[$model]['SAMPLEGROUPID'] = $this->db->id();
                        
                        if(!array_key_exists('BLSAMPLECAPILLARYID', $ids[$model])){
                            if($attrs->fromFile && $capillaryId != null) {
                                $tmp_ids = $this->db->pq("SELECT blsampleid FROM blsample where crystalid = :1", array($capillaryId));
                                $ids[$model]['BLSAMPLECAPILLARYID'] = $tmp_ids[0]['BLSAMPLEID'];
                            } else {
                                $tmp_ids = $this->db->pq("SELECT blsampleid FROM blsample where crystalid = :1", array($capillary->CRYSTALID));
                                $ids[$model]['BLSAMPLECAPILLARYID'] = $tmp_ids[0]['BLSAMPLEID'];
                            }
                        }

                        $this->db->pq("INSERT INTO blsamplegroup_has_blsample (blsampleid, blsamplegroupid, grouporder, type) 
                        VALUES (:1,:2, :3, :4)", array($ids[$model]['BLSAMPLECAPILLARYID'], $ids[$model]['SAMPLEGROUPID'], 2, 'capillary'));
                
                        $this->db->pq("INSERT INTO blsamplegroup_has_blsample (blsampleid, blsamplegroupid, grouporder, type) 
                        VALUES (:1,:2, :3, :4)", array($ids[$model]['BLSAMPLEID'], $ids[$model]['SAMPLEGROUPID'], 1, 'sample'));
                    }

                    /**
                     * Insert CIF file(s) reference
                     * CIF files will be associated with ALL submitted samples
                     *  */
                    $fileCount = 0;
                    foreach($_FILES as $f){
                        $fileRef = 'pdb_file_'.$fileCount;
                        $info = pathinfo($_FILES[$fileRef]['name']);

                        if ($info['extension'] == 'pdb' || $info['extension'] == 'cif') {
                            $file = file_get_contents($_FILES[$fileRef]['tmp_name']);
                            $this->_associate_pdb($info['basename'],$file,'',$ids[$model]['PHASEID']);
                        }
                        $fileCount++;
                    }
                }
                $this->db->end_transaction();
                $this->_output($ids);
            }
        }

        function _pre_q_sub_sample() {
            if (!$this->has_arg('BLSUBSAMPLEID')) $this->_error('No subsample specified');

            if (is_array($this->arg('BLSUBSAMPLEID'))) {
                $ret = array();
                foreach ($this->arg('BLSUBSAMPLEID') as $sid) {
                    array_push($ret, array('BLSUBSAMPLEID' => $sid, 'CONTAINERQUEUESAMPLEID' => $this->_do_pre_q_sample(array('BLSUBSAMPLEID' => $sid))));
                    $this->_output($ret);
                }

            } else {
                $this->_output(array('CONTAINERQUEUESAMPLEID' => $this->_do_pre_q_sample(array('BLSUBSAMPLEID' => $this->arg('BLSUBSAMPLEID')))));
            }
        }

        function _do_pre_q_sample($options) {
            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $options['BLSUBSAMPLEID']));

            if (!sizeof($samp)) $this->_error('No such sub sample');

            if ($this->has_arg('UNQUEUE')) {
                $this->db->pq("DELETE FROM containerqueuesample WHERE blsubsampleid=:1 AND containerqueueid IS NULL", array($options['BLSUBSAMPLEID']));

            } else {
                $this->db->pq("INSERT INTO containerqueuesample (blsubsampleid) VALUES (:1)", array($options['BLSUBSAMPLEID']));
                return $this->db->id();
            }
        }


        function _add_sample_component() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('ABUNDANCE')) $this->_error('No amount specified');
            if (!$this->has_arg('COMPONENTID')) $this->_error('No component specified');
            if (!$this->has_arg('BLSAMPLETYPEID')) $this->_error('No crystal specified');

            $check = $this->db->pq("SELECT crystalid FROM crystal c
              INNER JOIN protein pr ON pr.proteinid = c.proteinid
              WHERE pr.proposalid=:1 AND c.crystalid=:2", array($this->proposalid, $this->arg('BLSAMPLETYPEID')));
            if (!sizeof($check)) $this->_error('No such blsampletype');

            $this->_update_sample_components(array(), array($this->arg('COMPONENTID')), array($this->arg('ABUNDANCE')), $this->arg('BLSAMPLETYPEID'));
            $this->_output(1);
        }


        function _remove_sample_component() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('scid')) $this->_error('No crystal/component specified');

            list($crystalid, $componentid) = explode('-', $this->arg('scid'));

            $check = $this->db->pq("SELECT crystalid FROM crystal c
              INNER JOIN protein pr ON pr.proteinid = c.proteinid
              WHERE pr.proposalid=:1 AND c.crystalid=:2", array($this->proposalid, $crystalid));
            if (!sizeof($check)) $this->_error('No such blsampletype');

            $this->_update_sample_components(array($componentid), array(), array(), $crystalid);
            $this->_output(1);
        }
        

        function _sub_samples() {
            $where = '';
            $having = '';
            $first_inner_select_where = '';
            $second_inner_select_where = '';
            $args = array($this->proposalid);

            if ($this->has_arg('sid')) {
                $where .= ' AND s.blsampleid=:'.(sizeof($args)+1);
                $first_inner_select_where .= ' AND s.blsampleid=:'.(sizeof($args) + 2);
                $second_inner_select_where .= ' AND s.blsampleid=:'.(sizeof($args) + 3);
                array_push($args, $this->arg('sid'), $this->arg('sid'), $this->arg('sid'));
            }

            if ($this->has_arg('ssid')) {
                $where .= ' AND ss.blsubsampleid=:'.(sizeof($args)+1);
                $first_inner_select_where .= ' AND ss.blsubsampleid=:'.(sizeof($args) + 2);
                $second_inner_select_where .= ' AND ss.blsubsampleid=:'.(sizeof($args) + 3);

                array_push($args, $this->arg('ssid'), $this->arg('ssid'), $this->arg('ssid'));
            }

            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                $first_inner_select_where .= ' AND s.containerid=:'.(sizeof($args) + 2);
                $second_inner_select_where .= ' AND s.containerid=:'.(sizeof($args) + 3);
                array_push($args, $this->arg('cid'), $this->arg('cid'), $this->arg('cid'));
            }

            if ($this->has_arg('queued')) {
                $where .= ' AND cqs.containerqueuesampleid IS NOT NULL';
            }

            if ($this->has_arg('notcompleted')) {
                $where .= ' AND cq2.completedtimestamp IS NULL';
            }

            if ($this->has_arg('nodata')) {
                $having .= ' HAVING count(dc.datacollectionid) = 0';
            }

            $this->db->wait_rep_sync(true);
            $ss_query = "SELECT
                pr.acronym as protein,
                s.name as sample,
                dp.experimentkind,
                dp.preferredbeamsizex,
                dp.preferredbeamsizey,
                round(dp.exposuretime,6) as exposuretime,
                dp.requiredresolution,
                dp.boxsizex,
                dp.boxsizey,
                dp.monochromator,
                dp.axisstart,
                dp.axisrange,
                dp.numberofimages,
                dp.transmission,
                dp.energy,
                count(sss.blsampleid) as samples,
                s.location,
                ss.diffractionplanid,
                pr.proteinid,
                ss.blsubsampleid,
                ss.blsampleid,
                ss.source,
                ss.blsampleimageid,
                ss.comments,
                ss.positionid,
                po.posx as x,
                po.posy as y,
                po.posz as z,
                po2.posx as x2,
                po2.posy as y2,
                po2.posz as z2,
                IF(cqs.containerqueuesampleid IS NOT NULL AND cqs.containerqueueid IS NULL, 1, 0) as readyforqueue,
                cq.containerqueueid,
                count(distinct IF(dc.overlap != 0,
                dc.datacollectionid,NULL)) as sc,
                count(distinct IF(dc.overlap = 0 AND dc.axisrange = 0,dc.datacollectionid,NULL)) as gr,
                count(distinct IF(dc.overlap = 0 AND dc.axisrange > 0,dc.datacollectionid,NULL)) as dc,
                count(distinct so.screeningid) as ai,
                count(distinct app.autoprocprogramid) as ap,
                count(distinct IF(dcg.experimenttype LIKE 'XRF map', dc.datacollectionid, NULL)) as xm,
                count(distinct IF(dcg.experimenttype LIKE 'XRF spectrum', dc.datacollectionid, NULL)) as xs,
                count(distinct IF(dcg.experimenttype LIKE 'Energy scan', dc.datacollectionid, NULL)) as es,
                round(min(st.rankingresolution),2) as scresolution,
                max(ssw.completeness) as sccompleteness,
                round(min(apss.resolutionlimithigh),2) as dcresolution,
                round(max(apss.completeness),1) as dccompleteness,
                cq2.completedtimestamp as queuecompleted
                FROM (
                    SELECT ss.blsubsampleid
                    FROM (
                        SELECT s.blsampleid, max(si.blsampleimageid) AS blsampleimageid
                      FROM blsample s
                          INNER JOIN blsampleimage si ON si.blsampleid = s.blsampleid
                      WHERE 1=1 $first_inner_select_where
                      GROUP BY s.blsampleid
                    ) qq
                    JOIN blsubsample ss ON ss.blsampleimageid = qq.blsampleimageid
                    WHERE ss.source = 'auto'
            
                    UNION ALL
            
                    SELECT ss.blsubsampleid
                    FROM blsubsample ss
                        LEFT JOIN blsample s on ss.blsampleid = s.blsampleid
                    WHERE ss.source = 'manual' $second_inner_select_where
                ) q
                JOIN blsubsample ss ON ss.blsubsampleid = q.blsubsampleid
                LEFT OUTER JOIN position po ON po.positionid = ss.positionid
                LEFT OUTER JOIN position po2 ON po2.positionid = ss.position2id
                LEFT OUTER JOIN blsample sss on ss.blsubsampleid = sss.blsubsampleid
                INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
                INNER JOIN crystal cr ON cr.crystalid = s.crystalid
                INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN container c ON c.containerid = s.containerid
                INNER JOIN dewar d ON d.dewarid = c.dewarid
                INNER JOIN shipping sh ON sh.shippingid = d.shippingid
                INNER JOIN proposal p ON p.proposalid = sh.proposalid


                LEFT OUTER JOIN containerqueuesample cqs ON cqs.blsubsampleid = ss.blsubsampleid
                LEFT OUTER JOIN containerqueue cq ON cqs.containerqueueid = cq.containerqueueid AND cq.completedtimestamp IS NULL
                
                LEFT OUTER JOIN containerqueuesample cqs2 ON cqs2.blsubsampleid = ss.blsubsampleid
                LEFT OUTER JOIN containerqueue cq2 ON cq2.containerqueueid = cqs2.containerqueueid AND cq2.completedtimestamp IS NOT NULL
                
                
                LEFT OUTER JOIN diffractionplan dp ON ss.diffractionplanid = dp.diffractionplanid
                
                LEFT OUTER JOIN datacollection dc ON ss.blsubsampleid = dc.blsubsampleid
                LEFT OUTER JOIN datacollectiongroup dcg on dc.datacollectiongroupid = dcg.datacollectiongroupid
                LEFT OUTER JOIN screening sc ON dc.datacollectionid = sc.datacollectionid
                LEFT OUTER JOIN screeningoutput so ON sc.screeningid = so.screeningid
                
                LEFT OUTER JOIN screeningstrategy st ON st.screeningoutputid = so.screeningoutputid AND sc.shortcomments LIKE '%EDNA%'
                LEFT OUTER JOIN screeningstrategywedge ssw ON ssw.screeningstrategyid = st.screeningstrategyid
                
                LEFT OUTER JOIN autoprocintegration ap ON ap.datacollectionid = dc.datacollectionid
                LEFT OUTER JOIN autoprocscaling_has_int aph ON aph.autoprocintegrationid = ap.autoprocintegrationid
                LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid
                LEFT OUTER JOIN autoprocprogram app ON app.autoprocprogramid = ap.autoprocprogramid AND app.processingstatus = 1

                WHERE p.proposalid=:1 $where
                GROUP BY pr.acronym,
                    s.name,
                    dp.experimentkind,
                    dp.preferredbeamsizex,
                    dp.preferredbeamsizey,
                    dp.exposuretime,
                    dp.requiredresolution,
                    s.location,
                    ss.diffractionplanid,
                    pr.proteinid,
                    ss.blsubsampleid,
                    ss.blsampleid,
                    ss.source,
                    ss.comments,
                    ss.positionid,
                    po.posx,
                    po.posy,
                    po.posz
                $having
                ORDER BY ss.blsubsampleid";
            $subs = $this->db->pq($ss_query, $args);

            $this->db->wait_rep_sync(false);

            foreach ($subs as $i => &$r) $r['RID'] = $i;

            if ($this->has_arg('ssid')) {
                if (!sizeof($subs)) $this->_error('No such sub sample');
                else $this->_output($subs[0]);

            } else {
                $this->_output($subs);
            }
        }

        function _update_sub_sample() {
            if (!$this->has_arg('ssid')) $this->_error('No subsample specified');
            
            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid,ss.position2id FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('ssid')));

            if (!sizeof($samp)) $this->_error('No such sub sample');
            
            foreach(array('COMMENTS') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE blsubsample SET '.$f.'=:1 WHERE blsubsampleid=:2', array($this->arg($f), $this->arg('ssid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($samp[0]['DIFFRACTIONPLANID']) {
                foreach(array('REQUIREDRESOLUTION', 'EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR') as $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE diffractionplan SET '.$f.'=:1 WHERE diffractionplanid=:2', array($this->arg($f), $samp[0]['DIFFRACTIONPLANID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }

            if ($samp[0]['POSITIONID']) {
                foreach(array('X', 'Y', 'Z') as $f) {
                    if ($this->has_arg($f)) {
                        $this->db->pq('UPDATE position SET pos'.$f.'=:1 WHERE positionid=:2', array($this->arg($f), $samp[0]['POSITIONID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }

            if ($samp[0]['POSITION2ID']) {
                foreach(array('X2', 'Y2', 'Z2') as $f) {
                    if ($this->has_arg($f)) {
                        $cn = str_replace('2', '', $f);
                        $this->db->pq('UPDATE position SET pos'.$cn.'=:1 WHERE positionid=:2', array($this->arg($f), $samp[0]['POSITION2ID']));
                        $this->_output(array($f => $this->arg($f)));
                    }
                }
            }
        }


        function _update_sub_sample_full() {
            if (!$this->arg('ssid')) $this->_error('No sub sample specified');

            $samp = $this->db->pq("SELECT ss.diffractionplanid,s.blsampleid,ss.positionid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('ssid')));

            if (!sizeof($samp)) $this->_error('No such sub sample');

            if ($samp[0]['DIFFRACTIONPLANID']) {
                $args = array($samp[0]['DIFFRACTIONPLANID']);
                foreach(array('REQUIREDRESOLUTION', 'EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 
                  'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR') as $f) {
                    array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
                }
                $this->db->pq('UPDATE diffractionplan 
                  SET requiredresolution=:2, experimentkind=:3, preferredbeamsizex=:4, preferredbeamsizey=:5, exposuretime=:6, boxsizex=:7, boxsizey=:8, axisstart=:9, axisrange=:10, numberofimages=:11, transmission=:12, energy=:13, monochromator=:14 
                  WHERE diffractionplanid=:1', $args);

                $this->_output(array('BLSUBSAMPLEID' => $this->arg('ssid')));
            }
        }



        function _add_sub_sample() {
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');
            if (!$this->has_arg('X')) $this->_error('No x position specified');
            if (!$this->has_arg('Y')) $this->_error('No y position specified');

            $z = $this->has_arg('Z') ? $this->arg('Z') : null;

            $x2 = $this->has_arg('X2') ? $this->arg('X2') : null;
            $y2 = $this->has_arg('Y2') ? $this->arg('Y2') : null;
            $z2 = $this->has_arg('Z2') ? $this->arg('Z2') : null;

            $samp = $this->db->pq("SELECT s.blsampleid FROM blsample s
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND s.blsampleid=:2", array($this->proposalid, $this->arg('BLSAMPLEID')));

            if (!sizeof($samp)) $this->_error('No such sample');

            $this->db->pq("INSERT INTO position (positionid, posx, posy, posz) 
              VALUES (s_position.nextval, :1, :2, :3) RETURNING positionid INTO :id", array($this->arg('X'), $this->arg('Y'), $z));
            $pid = $this->db->id();

            if ($x2 && $y2) {
                $this->db->pq("INSERT INTO position (positionid, posx, posy, posz) 
                    VALUES (s_position.nextval, :1, :2, :3) RETURNING positionid INTO :id", array($x2, $y2, $z2));
                $pid2 = $this->db->id();
            } else $pid2 = null;

            $exp = ($x2 && $y2) ? 'MESH' : 'SAD';
            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid,experimentkind) 
              VALUES (s_diffractionplan.nextval,:1) RETURNING diffractionplanid INTO :id", array($exp));
            $did = $this->db->id();

            $this->db->pq("INSERT INTO blsubsample (blsubsampleid, blsampleid, positionid, position2id, diffractionplanid) 
              VALUES (s_blsubsample.nextval, :1, :2, :3, :4) RETURNING blsubsampleid INTO :id", array($this->arg('BLSAMPLEID'), $pid, $pid2, $did));

            // $this->_output(array('BLSUBSAMPLEID' => $this->db->id()));
            $this->args['ssid'] = $this->db->id();
            $this->_sub_samples();
        }


        function _delete_sub_sample() {
            if (!$this->has_arg('ssid')) $this->_error('No subsample specified');

            $can_delete = true;
            $ref = null;
            foreach (array('datacollection', 'energyscan', 'xfefluorescencespectrum', 'blsample') as $table) {
                $chk = $this->db->pq("SELECT blsubsampleid FROM ${table} WHERE blsubsampleid=:1", array($this->arg('ssid')));
                if (sizeof($chk)) $can_delete = false;
                $ref = $table;
            }

            if (!$can_delete) $this->_error('Cannot delete that subsample as it is referenced by another entity: '.$ref);

            $ssamp = $this->db->pq("SELECT ss.blsubsampleid FROM blsubsample ss
              INNER JOIN blsample s ON s.blsampleid = ss.blsampleid
              INNER JOIN container c ON c.containerid = s.containerid
              INNER JOIN dewar d ON d.dewarid = c.dewarid
              INNER JOIN shipping sh ON sh.shippingid = d.shippingid
              INNER JOIN proposal p ON p.proposalid = sh.proposalid
              WHERE p.proposalid=:1 AND ss.blsubsampleid=:2", array($this->proposalid, $this->arg('ssid')));

            if (!sizeof($ssamp)) $this->_error('No such subsample');

            $this->db->pq("DELETE FROM blsubsample WHERE blsubsampleid=:1", array($this->arg('ssid')));
            $this->_output(1);
        }





        # ------------------------------------------------------------------------
        # List of samples for a proposal
        function _samples() {
            // ini_set('memory_limit', '512M');
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'pr.proposalid=:1';
            $having = '';
            $join = '';
            
            # For a specific project
            if ($this->has_arg('pjid')) {
                $info = $this->db->pq('SELECT p.title FROM project p LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid WHERE p.projectid=:1 AND (p.personid=:2 or php.personid=:3)', array($this->arg('pjid'), $this->user->personid, $this->user->personid));
                if (!sizeof($info)) $this->_error('No such project');

                $args = array($this->arg('pjid'));
                $where = '(pj.projectid=:'.sizeof($args).')';
                $join = ' LEFT OUTER JOIN project_has_blsample pj ON pj.blsampleid=b.blsampleid';
                
                if (!$this->staff) {
                    $join .= " INNER JOIN blsession ses ON ses.proposalid = p.proposalid 
                    INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid AND shp.personid=:".(sizeof($args)+1);

                    array_push($args, $this->user->personid);
                }
                
                if ($this->has_arg('imp')) {
                    if ($this->arg('imp')) {
                        array_push($args, $this->arg('pjid'));
                        $join .= ' LEFT OUTER JOIN project_has_protein pji ON pji.proteinid=pr.proteinid';
                        $where = preg_replace('/\(pj/', '(pji.projectid=:'.sizeof($args).' OR pj', $where);
                    }
                }
            }
            
            # For a specific protein
            if ($this->has_arg('pid')) {
                $where .= ' AND (pr.proteinid=:'.(sizeof($args)+1).' OR chc2.componentid=:'.(sizeof($args)+2).')';
                $join .= ' LEFT OUTER JOIN blsampletype_has_component chc2 ON chc2.blsampletypeid=b.crystalid';
                array_push($args, $this->arg('pid'));
                array_push($args, $this->arg('pid'));
            }

            # For a particular crystal
            if ($this->has_arg('crid')) {
                $where .= ' AND cr.crystalid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('crid'));                
            }

            # Sample group
            if ($this->has_arg('BLSAMPLEGROUPID')) {
                $where .= ' AND bsg.blsamplegroupid =:'.(sizeof($args)+1);
                array_push($args, $this->arg('BLSAMPLEGROUPID'));
            }

            # For a specific container
            if ($this->has_arg('cid')) {
                $where .= ' AND c.containerid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('cid'));
            }
            
            # For a particular sample
            if ($this->has_arg('sid')) {
                $where .= ' AND b.blsampleid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('sid'));                
            }

            # For a loop type
            if ($this->has_arg('lt')) {
                $where .= ' AND b.looptype LIKE :'.(sizeof($args)+1);
                array_push($args, $this->arg('lt'));
            }
            
            
            # For a visit
            if ($this->has_arg('visit')) {
                $info = $this->db->pq("SELECT s.beamlinename as bl FROM blsession s INNER JOIN proposal p ON p.proposalid = s.proposalid WHERE CONCAT(CONCAT(CONCAT(p.proposalcode, p.proposalnumber), '-'), s.visit_number) LIKE :1", array($this->arg('visit')));
            
                if (!sizeof($info)) $this->_error('No such visit');
                else $info = $info[0];
                                      
                $where .= " AND d.dewarstatus='processing' AND c.beamlinelocation LIKE :".(sizeof($args)+1)." AND c.samplechangerlocation is NOT NULL";
                array_push($args, $info['BL']);
            }
            

            $cseq = '';
            $sseq = '';
            if ($this->has_arg('seq')) {
                $cseq = 'string_agg(cpr.sequence) as componentsequences,';
                $sseq = 'pr.sequence,';
            }
            
            # Collected during visit
            if ($this->has_arg('collected_during')) {
              $visit = $this->db->pq("SELECT s.sessionid
                FROM blsession s
                INNER JOIN proposal p ON p.proposalid = s.proposalid
                WHERE CONCAT(p.proposalcode, p.proposalnumber, '-', s.visit_number) LIKE :1 AND p.proposalid=:2",
                array($this->arg('collected_during'), $this->proposalid));

              if (!sizeof($visit)) $this->_error("No such visit");
              $sessionid = $visit[0]["SESSIONID"];

              $join .= " LEFT OUTER JOIN datacollectiongroup dcg ON dcg.datacollectiongroupid = dc.datacollectiongroupid";
              $where .= " AND (r.blsessionid=:".(sizeof($args)+1)." OR dcg.sessionid=:".(sizeof($args)+2).")";
              array_push($args, $sessionid);
              array_push($args, $sessionid);
            }
            
            // Search
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(b.name) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(b.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')) OR lower(b.code) LIKE lower(CONCAT(CONCAT('%',:".($st+3)."), '%')))";
                for ($i = 0; $i < 4; $i++) array_push($args, $this->arg('s'));
            }
            
            
            // Filter by sample status
            if ($this->has_arg('t')) {
                //$this->db->set_debug(true);
                $types = array('R' => 'count(distinct r.robotactionid)',
                               'SC' => 'count(distinct IF(dc.overlap != 0,dc.datacollectionid,NULL))',
                               'AI' => 'count(distinct so.screeningid)',
                               'DC' => 'count(distinct IF(dc.overlap = 0 AND dc.axisrange > 0,dc.datacollectionid,NULL))',
                               'AP' => 'count(distinct ap.autoprocintegrationid)');
                if (array_key_exists($this->arg('t'), $types)) {
                    $having .= " HAVING ".$types[$this->arg('t')]." > 0";
                }
            }

            $tot = $this->db->pq("SELECT count(distinct b.blsampleid) as tot 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN blsamplegroup_has_blsample bsg ON bsg.blsampleid = b.blsampleid
              LEFT OUTER JOIN blsampletype_has_component chc ON b.crystalid = chc.blsampletypeid
              INNER JOIN proposal p ON p.proposalid = pr.proposalid 
              INNER JOIN container c ON c.containerid = b.containerid 
              INNER JOIN dewar d ON d.dewarid = c.dewarid 
              LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid
              LEFT OUTER JOIN robotaction r ON r.blsampleid = b.blsampleid AND r.actiontype = 'LOAD'
              $join WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            
            
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'b.blsampleid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('SAMPLEID' => 'b.blsampleid', 'NAME' => 'b.name', 'ACRONYM' => 'pr.acronym', 'SPACEGROUP' => 'cr.spacegroup', 'COMMENTS' => 'b.comments', 'SHIPMENT' => 'shipment', 'DEWAR' => 'dewar', 'CONTAINER' => 'container', 'b.blsampleid', 'SC' => 'sc', 'SCRESOLUTION' => 'scresolution', 'DC' => 'ap', 'DCRESOLUTION' => 'dcresolution', 'POSITION' => 'TO_NUMBER(b.location)', 'RECORDTIMESTAMP' => 'b.recordtimestamp');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT distinct b.blsampleid, b.crystalid, b.screencomponentgroupid, ssp.blsampleid as parentsampleid, ssp.name as parentsample, b.blsubsampleid, count(distinct si.blsampleimageid) as inspections, CONCAT(p.proposalcode,p.proposalnumber) as prop, b.code, b.location, pr.acronym, pr.proteinid, cr.spacegroup,b.comments,b.name,s.shippingname as shipment,s.shippingid,d.dewarid,d.code as dewar, c.code as container, c.containerid, c.samplechangerlocation as sclocation, count(distinct IF(dc.overlap != 0,dc.datacollectionid,NULL)) as sc, count(distinct IF(dc.overlap = 0 AND dc.axisrange = 0,dc.datacollectionid,NULL)) as gr, count(distinct IF(dc.overlap = 0 AND dc.axisrange > 0,dc.datacollectionid,NULL)) as dc, count(distinct IF(dcg.experimenttype LIKE 'XRF map', dc.datacollectionid, NULL)) as xm, count(distinct IF(dcg.experimenttype LIKE 'XRF spectrum', dc.datacollectionid, NULL)) as xs, count(distinct IF(dcg.experimenttype LIKE 'Energy scan', dc.datacollectionid, NULL)) as es, count(distinct so.screeningid) as ai, count(distinct app.autoprocprogramid) as ap, count(distinct r.robotactionid) as r, round(min(st.rankingresolution),2) as scresolution, max(ssw.completeness) as sccompleteness, round(min(apss.resolutionlimithigh),2) as dcresolution, round(max(apss.completeness),1) as dccompleteness, dp.anomalousscatterer, dp.requiredresolution, cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma, b.packingfraction, b.dimension1, b.dimension2, b.dimension3, b.shape, cr.theoreticaldensity, cr.name as crystal, pr.name as protein, b.looptype, dp.centringmethod, dp.experimentkind, cq.containerqueueid, TO_CHAR(cq.createdtimestamp, 'DD-MM-YYYY HH24:MI') as queuedtimestamp
                                  , $cseq $sseq string_agg(cpr.name) as componentnames, string_agg(cpr.density) as componentdensities
                                  ,string_agg(cpr.proteinid) as componentids, string_agg(cpr.acronym) as componentacronyms, string_agg(cpr.global) as componentglobals, string_agg(chc.abundance) as componentamounts, string_agg(ct.symbol) as componenttypesymbols, b.volume, pct.symbol,ROUND(cr.abundance,3) as abundance, TO_CHAR(b.recordtimestamp, 'DD-MM-YYYY') as recordtimestamp, dp.radiationsensitivity, dp.energy, dp.userpath, dp.strategyoption, dp.minimalresolution as minimumresolution
                                    ,count(distinct dc.dataCollectionId) as dcc            
                
                                  
                                  FROM blsample b

                                  INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                                  INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  LEFT OUTER JOIN concentrationtype pct ON pr.concentrationtypeid = pct.concentrationtypeid

                                  LEFT OUTER JOIN blsampletype_has_component chc ON b.crystalid = chc.blsampletypeid
                                  LEFT OUTER JOIN protein cpr ON cpr.proteinid = chc.componentid
                                  LEFT OUTER JOIN concentrationtype ct ON cpr.concentrationtypeid = ct.concentrationtypeid

                                  INNER JOIN container c ON b.containerid = c.containerid
                                  INNER JOIN dewar d ON d.dewarid = c.dewarid
                                  INNER JOIN shipping s ON s.shippingid = d.shippingid
                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid

                                  LEFT OUTER JOIN containerqueue cq ON cq.containerid = c.containerid AND cq.completedtimestamp IS NULL
                                  
                                  LEFT OUTER JOIN diffractionplan dp ON dp.diffractionplanid = b.diffractionplanid 
                                  LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid
                                  LEFT OUTER JOIN datacollectiongroup dcg ON dc.datacollectiongroupid = dcg.datacollectiongroupid
                                  LEFT OUTER JOIN screening sc ON dc.datacollectionid = sc.datacollectionid
                                  LEFT OUTER JOIN screeningoutput so ON sc.screeningid = so.screeningid
                                  
                                  LEFT OUTER JOIN screeningstrategy st ON st.screeningoutputid = so.screeningoutputid AND sc.shortcomments LIKE '%EDNA%'
                                  LEFT OUTER JOIN screeningstrategywedge ssw ON ssw.screeningstrategyid = st.screeningstrategyid
                                  
                                  
                                  LEFT OUTER JOIN autoprocintegration ap ON ap.datacollectionid = dc.datacollectionid
                                  LEFT OUTER JOIN autoprocscaling_has_int aph ON aph.autoprocintegrationid = ap.autoprocintegrationid
                                  LEFT OUTER JOIN autoprocscalingstatistics apss ON apss.autoprocscalingid = aph.autoprocscalingid
                                  LEFT OUTER JOIN autoprocprogram app ON app.autoprocprogramid = ap.autoprocprogramid AND app.processingstatus = 1

                                  LEFT OUTER JOIN blsampleimage si ON b.blsampleid = si.blsampleid

                                  LEFT OUTER JOIN blsubsample ss ON b.blsubsampleid = ss.blsubsampleid AND ss.source='manual'
                                  LEFT OUTER JOIN blsample ssp ON ss.blsampleid = ssp.blsampleid
                                  
                                  
                                  LEFT OUTER JOIN robotaction r ON r.blsampleid = b.blsampleid AND r.actiontype = 'LOAD'
                                  
                                  $join
                                  
                                  WHERE $where
                                  
                                  GROUP BY b.blsampleid
                                  
                                  $having
                                  
                                  ORDER BY $order", $args);
            
            foreach ($rows as &$r) {
                foreach (array('COMPONENTIDS', 'COMPONENTAMOUNTS', 'COMPONENTACRONYMS', 'COMPONENTTYPESYMBOLS', 'COMPONENTGLOBALS', 'COMPONENTNAMES', 'COMPONENTDENSITIES', 'COMPONENTSEQUENCES') as $k) {
                    if (array_key_exists($k, $r)) {
                      if ($r[$k]) $r[$k] = explode(',', $r[$k]);
                    }
                }

                // display DCP count for each sample
                if($this->has_arg('dcp')){
                    $dcpCount = $this->db->pq("SELECT COUNT(*) AS DCPCOUNT FROM BLSample_has_DataCollectionPlan WHERE blSampleId =:1", array($r['BLSAMPLEID']));
                    $r['DCPCOUNT'] = $dcpCount[0]['DCPCOUNT'];
                }
            }


            if ($this->has_arg('sid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such sample');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }

        function _update_sample_full() {
            $a = $this->_prepare_strategy_option_for_sample($this->_prepare_sample_args());
            $result = $this->_handle_update_sample_full($a, $this->arg('sid'));

            $this->_output($result);
        }
        

        function _handle_update_sample_full($a, $sid) {
            if (empty($sid)) $this->_error('No sampleid provided');

            $samp = $this->db->pq("SELECT sp.blsampleid, pr.proteinid, cr.crystalid, dp.diffractionplanid, string_agg(chc.componentid) as componentids
              FROM blsample sp
              INNER JOIN crystal cr ON sp.crystalid = cr.crystalid
              INNER JOIN protein pr ON cr.proteinid = pr.proteinid
              LEFT OUTER JOIN blsampletype_has_component chc ON sp.crystalid = chc.blsampletypeid
              INNER JOIN proposal p ON pr.proposalid = p.proposalid
              LEFT OUTER JOIN diffractionplan dp ON dp.diffractionplanid = sp.diffractionplanid
              WHERE p.proposalid = :1 AND sp.blsampleid=:2
              GROUP BY sp.blsampleid, pr.proteinid, cr.crystalid, dp.diffractionplanid",
              array($this->proposalid, $sid));

            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $blSampleId = $samp['BLSAMPLEID'];

            $this->db->pq("UPDATE blsample set name=:1,comments=:2,code=:3,volume=:4,packingfraction=:5,dimension1=:6,dimension2=:7,dimension3=:8,shape=:9,looptype=:10 WHERE blsampleid=:11",
              array($a['NAME'],$a['COMMENTS'],$a['CODE'],$a['VOLUME'],$a['PACKINGFRACTION'],$a['DIMENSION1'],$a['DIMENSION2'],$a['DIMENSION3'],$a['SHAPE'],$a['LOOPTYPE'], $blSampleId));

            if (array_key_exists('PROTEINID', $a)) {
                $this->db->pq("UPDATE crystal set spacegroup=:1,proteinid=:2,cell_a=:3,cell_b=:4,cell_c=:5,cell_alpha=:6,cell_beta=:7,cell_gamma=:8,theoreticaldensity=:9 WHERE crystalid=:10",
                  array($a['SPACEGROUP'], $a['PROTEINID'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $a['THEORETICALDENSITY'], $samp['CRYSTALID']));
                $this->db->pq("UPDATE diffractionplan set anomalousscatterer=:1,requiredresolution=:2, experimentkind=:3, centringmethod=:4, radiationsensitivity=:5, energy=:6, userpath=:7, strategyoption=:8, minimalresolution=:9 WHERE diffractionplanid=:10",
                  array($a['ANOMALOUSSCATTERER'], $a['REQUIREDRESOLUTION'], $a['EXPERIMENTKIND'], $a['CENTRINGMETHOD'], $a['RADIATIONSENSITIVITY'], $a['ENERGY'], $a['USERPATH'], $a['STRATEGYOPTION'], $a['MINIMUMRESOLUTION'], $samp['DIFFRACTIONPLANID']));

                if (!isset($a['INITIALSAMPLEGROUP']) && $a['VALID_SAMPLE_GROUP'] && $sid) {
                    $this->_save_sample_to_group($sid, $a['SAMPLEGROUP'], null, null);
                } else if (isset($a['INITIALSAMPLEGROUP']) && !$a['SAMPLEGROUP'] && isset($blSampleId)) {
                    $this->_delete_sample_from_group($a['INITIALSAMPLEGROUP'], $blSampleId);
                }
            }

            $init_comps = explode(',', $samp['COMPONENTIDS']);
            $fin_comps = $a['COMPONENTIDS'] ? $a['COMPONENTIDS'] : array();
            $amounts = $a['COMPONENTAMOUNTS'] ? $a['COMPONENTAMOUNTS'] : null;
            $this->_update_sample_components($init_comps, $fin_comps, $amounts, $samp['CRYSTALID']);

            return array('BLSAMPLEID' => $samp['BLSAMPLEID']);
        }

        function _update_sample_components($initial, $final, $amounts, $crystalid) {
            $rem = array_diff($initial, $final);
            $add = array_diff($final, $initial);

            foreach ($rem as $r) $this->db->pq("DELETE FROM blsampletype_has_component WHERE blsampletypeid=:1 AND componentid=:2", array($crystalid, $r));
            foreach ($add as $a) $this->db->pq("INSERT INTO blsampletype_has_component (blsampletypeid, componentid) VALUES (:1,:2)", array($crystalid, $a));

            if ($amounts) {
                foreach($final as $i => $f) {
                    $this->db->pq("UPDATE blsampletype_has_component SET abundance=:1 WHERE blsampletypeid=:2 AND componentid=:3", array($amounts[$i], $crystalid, $f));
                }
            }
        }


        function _add_sample() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            // Register entire container
            if ($this->has_arg('collection')) {
                $this->db->start_transaction();
                $col = array();
                foreach ($this->arg('collection') as $s) {
                    $id = $this->_do_add_sample($this->_prepare_sample_args($s));

                    if ($id) {
                        $s['BLSAMPLEID'] = $id;
                        array_push($col, $s);
                    }
                }

                $this->db->end_transaction();
                $this->user->set_cache('container', null);
                $this->_output($col);

            // Register single sample
            } else {
                $id = $this->_do_add_sample($this->_prepare_sample_args());
                $this->_output(array('BLSAMPLEID' => $id));
            }
        }

        function _bulk_update_sample_full() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            // Register entire container
            $this->db->start_transaction();
            $col = array();
            foreach ($this->arg('collection') as $s) {
                $sample = $this->_prepare_strategy_option_for_sample($this->_prepare_sample_args($s));
                $result = $this->_handle_update_sample_full($sample, $s['BLSAMPLEID']);

                if ($result) {
                    array_push($col, $result);
                }
            }

            $this->db->end_transaction();
            $this->_output($col);
        }


        function _prepare_sample_args($s=null) {
            $a = array();
            foreach (array('LOCATION', 'CONTAINERID', 'NAME') as $f) {
                if ($s) {
                    if (!array_key_exists($f, $s)) $this->_error('One or more fields are mising');
                    else $a[$f] = $s[$f];

                } else {
                    if (!$this->has_arg($f)) $this->_error('One or more fields are mising');
                    else $a[$f] = $this->arg($f);
                }
            }

            $haskey = false;
            foreach (array('PROTEINID', 'CRYSTALID') as $f) {
                if ($s) {
                    if (array_key_exists($f, $s)) {
                        $a[$f] = $s[$f];
                        $haskey = true;
                    }
                } else {
                    if ($this->has_arg($f)) {
                        $a[$f] = $this->arg($f);
                        $haskey = true;
                    }
                }
            }            
            if (!$haskey) $this->_error('One or more fields is missing');


            foreach (array('COMMENTS', 'SPACEGROUP', 'CODE', 'ANOMALOUSSCATTERER') as $f) {
                if ($s) $a[$f] = array_key_exists($f, $s) ? $s[$f] : '';
                else $a[$f] = $this->has_arg($f) ? $this->arg($f) : '';
            }

            foreach (
                array(
                    'CENTRINGMETHOD',
                    'EXPERIMENTKIND',
                    'RADIATIONSENSITIVITY',
                    'SCREENCOMPONENTGROUPID',
                    'BLSUBSAMPLEID',
                    'COMPONENTIDS',
                    'COMPONENTAMOUNTS',
                    'REQUIREDRESOLUTION',
                    'CELL_A',
                    'CELL_B',
                    'CELL_C',
                    'CELL_ALPHA',
                    'CELL_BETA',
                    'CELL_GAMMA',
                    'VOLUME',
                    'ABUNDANCE',
                    'PACKINGFRACTION',
                    'DIMENSION1',
                    'DIMENSION2',
                    'DIMENSION3',
                    'SHAPE',
                    'THEORETICALDENSITY',
                    'LOOPTYPE',
                    'ENERGY',
                    'USERPATH',
                    'SCREENINGMETHOD',
                    'SCREENINGCOLLECTVALUE',
                    'SAMPLEGROUP',
                    'STRATEGYOPTION',
                    'MINIMUMRESOLUTION',
                    'INITIALSAMPLEGROUP'
                ) as $f
            ) {
                if ($s) $a[$f] = array_key_exists($f, $s) ? $s[$f] : null;
                else $a[$f] = $this->has_arg($f) ? $this->arg($f) : null;
            }

            return $a;
        }


        function _do_add_sample($s) {
            $a = $this->_prepare_strategy_option_for_sample($s);

            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid, requiredresolution, anomalousscatterer, centringmethod, experimentkind, radiationsensitivity, energy, userpath, strategyoption, minimalresolution) VALUES (s_diffractionplan.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9) RETURNING diffractionplanid INTO :id",
                array($a['REQUIREDRESOLUTION'], $a['ANOMALOUSSCATTERER'], $a['CENTRINGMETHOD'], $a['EXPERIMENTKIND'], $a['RADIATIONSENSITIVITY'], $a['ENERGY'], $a['USERPATH'], $a['STRATEGYOPTION'], $a['MINIMUMRESOLUTION']));
            $did = $this->db->id();

            if (!array_key_exists('CRYSTALID', $a)) {
                $chk = $this->db->pq("SELECT pr.proteinid
                    FROM protein pr
                    INNER JOIN proposal p ON p.proposalid = pr.proposalid
                    WHERE p.proposalid = :1 AND pr.proteinid = :2", array($this->proposalid, $a['PROTEINID']));
                if (!sizeof($chk)) $this->_error('No such crystal');

                $this->db->pq("INSERT INTO crystal (crystalid,proteinid,spacegroup,cell_a,cell_b,cell_c,cell_alpha,cell_beta,cell_gamma,abundance,theoreticaldensity) VALUES (s_crystal.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10) RETURNING crystalid INTO :id",
                array($a['PROTEINID'], $a['SPACEGROUP'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $a['ABUNDANCE'], $a['THEORETICALDENSITY']));
                $crysid = $this->db->id();

                if ($a['COMPONENTIDS']) $this->_update_sample_components(array(), $a['COMPONENTIDS'], $a['COMPONENTAMOUNTS'], $crysid);
            } else {
                $chk = $this->db->pq("SELECT cr.crystalid
                    FROM crystal cr
                    INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                    INNER JOIN proposal p ON p.proposalid = pr.proposalid
                    WHERE p.proposalid = :1 AND cr.crystalid = :2", array($this->proposalid, $a['CRYSTALID']));
                if (!sizeof($chk)) $this->_error('No such crystal');

                $crysid = $a['CRYSTALID'];
            }

            $this->db->pq("INSERT INTO blsample (blsampleid,crystalid,diffractionplanid,containerid,location,comments,name,code,blsubsampleid,screencomponentgroupid,volume,packingfraction,dimension1,dimension2,dimension3,shape,looptype) VALUES (s_blsample.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16) RETURNING blsampleid INTO :id",
                array($crysid, $did, $a['CONTAINERID'], $a['LOCATION'], $a['COMMENTS'], $a['NAME'] ,$a['CODE'], $a['BLSUBSAMPLEID'], $a['SCREENCOMPONENTGROUPID'], $a['VOLUME'], $a['PACKINGFRACTION'], $a['DIMENSION1'], $a['DIMENSION2'], $a['DIMENSION3'],$a['SHAPE'],$a['LOOPTYPE']));
            $sid = $this->db->id();

            if ($a['VALID_SAMPLE_GROUP']) {
                $this->_save_sample_to_group($sid, $a['SAMPLEGROUP'], null, null);
            }

            return $sid;
        }

        function _prepare_strategy_option_for_sample($a) {
            $is_valid_sample_group = false;
            $strategyOptionsData = ["sample_group" => null];

            if (isset($a['SAMPLEGROUP'])) {
                $args = array($this->proposalid);
                array_push($args, $a['SAMPLEGROUP']);
                $check = $this->db->pq("SELECT blsamplegroupid FROM blsamplegroup WHERE proposalid = :1 AND blsamplegroupid = :2", $args);

                if (sizeof($check)) {
                    $is_valid_sample_group = true;
                    $strategyOptionsData["sample_group"] = $a["SAMPLEGROUP"];
                }
            }

            if (isset($a["SCREENINGMETHOD"]) && $a['SCREENINGMETHOD'] == 'best' && $is_valid_sample_group) {
                $strategyOptionsData = array_merge($strategyOptionsData, array(
                    "screen" => $a['SCREENINGMETHOD'],
                    "collect_samples" => intval($a['SCREENINGCOLLECTVALUE']),
                ));

                $a['STRATEGYOPTION'] = json_encode($strategyOptionsData);
            }
            else if (isset($a["SCREENINGMETHOD"]) && $a['SCREENINGMETHOD'] == 'all') {
                $strategyOptionsData = array_merge($strategyOptionsData, array(
                    "screen" => $a['SCREENINGMETHOD'],
                    "collect_samples" => null
                ));

                $a['STRATEGYOPTION'] = json_encode($strategyOptionsData);
            }
            else if (isset($a["SCREENINGMETHOD"]) && $a['SCREENINGMETHOD'] == 'none') {
                $strategyOptionsData = array_merge($strategyOptionsData, array(
                    "screen" => null,
                    "collect_samples" => null
                ));

                $a['STRATEGYOPTION'] = json_encode($strategyOptionsData);
            } else {
                $a['STRATEGYOPTION'] = null;
            }

            $a['VALID_SAMPLE_GROUP'] = $is_valid_sample_group;

            return $a;
        }

        
        # ------------------------------------------------------------------------
        # List of proteins for a proposal
        function _proteins() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $args = array($this->proposalid);
            $where = '(pr.proposalid=:1 /*or pr.global=1*/)';
            $join = '';
            $extc = '';

            if ($this->has_arg('pjid')) {
                $info = $this->db->pq('SELECT p.title FROM project p LEFT OUTER JOIN project_has_person php ON php.projectid = p.projectid WHERE p.projectid=:1 AND (p.personid=:2 or php.personid=:3)', array($this->arg('pjid'), $this->user->personid, $this->user->personid));
                if (!sizeof($info)) $this->_error('No such project');

                $args = array($this->arg('pjid'));
                $where = 'pj.projectid=:'.sizeof($args);
                $join .= ' INNER JOIN project_has_protein pj ON pj.proteinid=pr.proteinid';
                
                if (!$this->staff) {
                    $join .= " INNER JOIN blsession ses ON ses.proposalid = p.proposalid 
                    INNER JOIN session_has_person shp ON shp.sessionid = ses.sessionid AND shp.personid=:".(sizeof($args)+1);

                    array_push($args, $this->user->personid);
                }
            }
            
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('pid'));
                $extc = 'pr.sequence, ';
            }

            if ($this->has_arg('seq')) {
                $extc = 'pr.sequence, ';
            }


            if ($this->has_arg('type')) {
                $where .= ' AND pr.componenttypeid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('type'));
            }

            if ($this->has_arg('external')) {
                $where .= ' AND pr.externalid IS NOT NULL';
            }
            
            if ($this->has_arg('SAFETYLEVEL')) {
                $where .= ' AND pr.safetylevel=:'.(sizeof($args)+1);
                array_push($args, $this->arg('SAFETYLEVEL'));
            }
            

            $tot = $this->db->pq("SELECT count(distinct pr.proteinid) as tot FROM protein pr INNER JOIN proposal p ON p.proposalid = pr.proposalid $join WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(pr.name) LIKE lower(CONCAT(CONCAT('%',:".$st."), '%')) OR lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')))";
                for ($i = 0; $i < 2; $i++) array_push($args, $this->arg('s'));
            }
            
            
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'pr.proteinid DESC';

            $group = 'pr.proteinId';

            // Only display original UAS approved proteins (not clones which have the same externalId)
            if($this->has_arg('original') && $this->arg('original') == 1){
                $group = 'pr.externalId';
                $order .= ', pr.bltimeStamp DESC';
            }

            if ($this->has_arg('sort_by')) {
                $cols = array('NAME' => 'pr.name', 'ACRONYM' => 'pr.acronym', 'MOLECULARMASS' =>'pr.molecularmass', 'HASSEQ' => "CASE WHEN sequence IS NULL THEN 'No' ELSE 'Yes' END");
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT /*distinct*/ $extc pr.concentrationtypeid, 
                                ct.symbol as concentrationtype, pr.componenttypeid, cmt.name as componenttype,
                                CASE WHEN sequence IS NULL THEN 'No' ELSE 'Yes' END as hasseq, 
                                pr.proteinid,
                                CONCAT(p.proposalcode,p.proposalnumber) as prop,
                                pr.name, pr.acronym, pr.molecularmass, pr.global,
                                IF(pr.externalid IS NOT NULL, 1, 0) as external,
                                HEX(pr.externalid) as externalid,
                                pr.density,
                                count(php.proteinid) as pdbs,
                                pr.safetylevel

                                FROM protein pr
                                LEFT OUTER JOIN concentrationtype ct ON ct.concentrationtypeid = pr.concentrationtypeid
                                LEFT OUTER JOIN componenttype cmt ON cmt.componenttypeid = pr.componenttypeid
                                LEFT OUTER JOIN protein_has_pdb php ON php.proteinid = pr.proteinid
                                /*LEFT OUTER JOIN crystal cr ON cr.proteinid = pr.proteinid
                                LEFT OUTER JOIN blsample b ON b.crystalid = cr.crystalid
                                LEFT OUTER JOIN datacollection dc ON b.blsampleid = dc.blsampleid*/
                                INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                $join
                                WHERE $where
                                GROUP BY $group
                                ORDER BY $order", $args);
            
            $ids = array();
            $wcs = array();
            foreach ($rows as $r) {
                array_push($ids, $r['PROTEINID']);
                array_push($wcs, 'pr.proteinid=:'.sizeof($ids));
            }
            
            $dcs = array();
            $scs = array();
            
            if (sizeof($ids)) {
                $dcst = $this->db->pq('SELECT pr.proteinid, count(dc.datacollectionid) as dcount FROM datacollection dc INNER JOIN blsample s ON s.blsampleid=dc.blsampleid INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid WHERE '.implode(' OR ', $wcs).' GROUP BY pr.proteinid', $ids);

                
                foreach ($dcst as $d) {
                    $dcs[$d['PROTEINID']] = $d['DCOUNT'];
                }

                $scst = $this->db->pq('SELECT pr.proteinid, count(s.blsampleid) as scount FROM blsample s INNER JOIN crystal cr ON cr.crystalid = s.crystalid INNER JOIN protein pr ON pr.proteinid = cr.proteinid WHERE '.implode(' OR ', $wcs).' GROUP BY pr.proteinid', $ids);

                foreach ($scst as $d) {
                    $scs[$d['PROTEINID']] = $d['SCOUNT'];
                }
            }
            
            foreach ($rows as &$r) {
                $dcount = array_key_exists($r['PROTEINID'], $dcs) ? $dcs[$r['PROTEINID']] : 0;
                $r['DCOUNT'] = $dcount;
                $scount = array_key_exists($r['PROTEINID'], $scs) ? $scs[$r['PROTEINID']] : 0;
                $r['SCOUNT'] = $scount;
                
                if ($this->has_arg('pid')) $r['SEQUENCE'] = $this->db->read($r['SEQUENCE']);
            }
            
            if ($this->has_arg('pid')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such protein');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }

        
        # ------------------------------------------------------------------------
        # Return distinct proteins for a proposal
        function _disinct_proteins() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = '(pr.proposalid=:1)';

            if ($this->has_arg('global')) {
                $where = '(pr.proposalid=:1 OR pr.global=1)';
            }

            if ($this->has_arg('external')) {
                $where .= ' AND pr.externalid IS NOT NULL';
            }

            $has_safety_level = $this->has_arg('SAFETYLEVEL');
            if ($has_safety_level && $this->arg('SAFETYLEVEL')  === 'ALL') {
                $where .= ' AND pr.safetyLevel IS NOT NULL';
            } else if ($has_safety_level && $this->arg('SAFETYLEVEL')  !== 'ALL') {
                $where .= ' AND pr.safetyLevel=:'.(sizeof($args)+1);
                array_push($args, $this->arg('SAFETYLEVEL'));
            }

            if ($this->has_arg('term')) {
                $where .= " AND (lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".(sizeof($args)+1)."), '%')) OR lower(pr.name) LIKE lower(CONCAT(CONCAT('%',:".(sizeof($args)+2)."), '%')))";
                array_push($args, $this->arg('term'));
                array_push($args, $this->arg('term'));
            }

            $rows = $this->db->pq("SELECT distinct pr.global, pr.name, pr.acronym, pr.safetylevel,
              max(pr.proteinid) as proteinid,
              ct.symbol as concentrationtype,
              1 as hasph,
              IF(pr.externalid IS NOT NULL, 1, 0) as external
              FROM protein pr
              LEFT OUTER JOIN concentrationtype ct ON ct.concentrationtypeid = pr.concentrationtypeid
              WHERE pr.acronym is not null AND $where
              GROUP BY ct.symbol, pr.acronym, pr.name, pr.global
              ORDER BY lower(pr.acronym)", $args);
                                 
            $this->_output($rows);
        }


        
        # ------------------------------------------------------------------------
        # Update a particular field for a protein
        function _update_protein() {
            if (!$this->has_arg('pid')) $this->_error('No proteinid specified');

            $prot = $this->db->pq("SELECT pr.proteinid, pr.sequence FROM protein pr
              WHERE pr.proposalid = :1 AND pr.proteinid = :2", array($this->proposalid,$this->arg('pid')));
            
            if (!sizeof($prot)) $this->_error('No such protein');
            
            foreach(array('NAME', 'SEQUENCE', 'ACRONYM', 'MOLECULARMASS', 'CONCENTRATIONTYPEID', 'COMPONENTTYPEID', 'GLOBAL', 'DENSITY') as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq('UPDATE protein SET '.$f.'=:1 WHERE proteinid=:2', array($this->arg($f), $this->arg('pid')));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($this->has_arg('SEQUENCE') && empty($prot[0]['SEQUENCE'])) {
                # Only trigger alphafold if the sequence was previously empty
                $this->_on_add_protein_sequence($prot[0]["PROTEINID"]);
            }
        }


        # ------------------------------------------------------------------------
        # Update a particular field for a sample
        function _update_sample() {

            if (!$this->has_arg('sid')) $this->_error('No sampleid specified');

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid,$this->arg('sid')));

            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            if($this->has_arg('CONTAINERID') && $this->arg('CONTAINERID') == 0) {
                $defaultContainerLocation = $this->_get_default_sample_container();
                $this->args['CONTAINERID'] = $defaultContainerLocation['CONTAINERID'];
                $this->args['LOCATION'] = $defaultContainerLocation['LOCATION'];
            }

            $maxLocation = $this->_get_current_max_dcp_plan_order($this->args['CONTAINERID']);
            $maxLocation = sizeof($maxLocation) ? $maxLocation : -1;

            $sfields = array('CODE', 'NAME', 'COMMENTS', 'VOLUME', 'PACKINGFRACTION', 'DIMENSION1', 'DIMENSION2', 'DIMENSION3', 'SHAPE', 'POSITION', 'CONTAINERID', 'LOOPTYPE', 'LOCATION');
            foreach ($sfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsample SET $f=:1 WHERE blsampleid=:2", array($this->arg($f), $samp['BLSAMPLEID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            $cfields = array('PROTEINID', 'SPACEGROUP', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'ABUNDANCE', 'THEORETICALDENSITY');
            foreach ($cfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE crystal SET $f=:1 WHERE crystalid=:2", array($this->arg($f), $samp['CRYSTALID']));
                    
                    if ($f == 'PROTEINID') {
                        $name = $this->db->pq('SELECT acronym FROM protein WHERE proteinid=:1', array($this->arg('PROTEINID')));
                        if (sizeof($name)) {
                            $this->_output(array('ACRONYM' => $name[0]['ACRONYM']));
                        }
                    } else $this->_output(array($f => $this->arg($f)));
                }
            }

            $dfields = array('REQUIREDRESOLUTION', 'ANOMALOUSSCATTERER', 'CENTRINGMETHOD', 'EXPERIMENTKIND', 'RADIATIONSENSITIVITY', 'ENERGY', 'USERPATH');
            foreach ($dfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE diffractionplan SET $f=:1 WHERE diffractionplanid=:2", array($this->arg($f), $samp['DIFFRACTIONPLANID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($this->has_arg('SCREENINGMETHOD')) {
                $sample_data = array(
                    "SCREENINGMETHOD" => $this->arg("SCREENINGMETHOD"),
                    "SCREENINGCOLLECTVALUE" => $this->arg("SCREENINGCOLLECTVALUE"),
                    "SAMPLEGROUP" => $this->arg("SAMPLEGROUP")
                );
                $strategyOptionsData = $this->_prepare_strategy_option_for_sample($sample_data);
                $this->db->pq("UPDATE diffractionplan SET STRATEGYOPTION = :1 WHERE diffractionplanid = :2", array($strategyOptionsData, $samp['DIFFRACTIONPLANID']));
                $this->_output(array($f => $this->arg($f)));
            }

            if($this->has_arg('PLANORDER')) {
                // If we're moving a BLSample to a new container we need to adjust the DCP plan order not to clash with existing plans for samples in the new container
                $dcps = $this->db->pq("SELECT dataCollectionPlanId FROM BLSample_has_DataCollectionPlan
                                WHERE blSampleId = :1", array($this->arg('sid')));

                if(sizeof($dcps)) {
                    foreach($dcps as $dcp){
                        ++$maxLocation;
                        $this->db->pq("UPDATE BLSample_has_DataCollectionPlan SET planOrder = :1 WHERE dataCollectionPlanId = :2 AND blSampleId = :3", array($maxLocation, $dcp['DATACOLLECTIONPLANID'], $this->arg('sid')));
                    }
                }
            }
        }


        # ------------------------------------------------------------------------
        # Look up the default container for proposal and the next available location
        function _get_default_sample_container() {

            $containers = $this->db->pq("SELECT DISTINCT c.containerId, c.code, b.location
              FROM Container c
              INNER JOIN BLSample b ON b.containerId = c.containerId
              INNER JOIN Crystal cr ON cr.crystalId = b.crystalId
              INNER JOIN Protein pr ON pr.proteinId = cr.proteinId
              WHERE pr.proposalId =:1 AND c.code LIKE :2", array($this->proposalid, "%_samples"));

            $free = null;

            if(sizeof($containers)){
                $locations = array();
                foreach($containers as $c) {
                    array_push($locations, $c['LOCATION']);
                }

                $free = max($locations)+1;

                for($i=1; $i<max($locations); $i++){
                    if(!in_array($i, $locations)){
                        $free = $i;
                        break;
                    }
                }
            } else {
                // It's possible the default container is empty so we would fail to find it above
                // Find it via dewars and shipping instead
                $containers = $this->db->pq("SELECT c.containerId, c.code
                  FROM Container c
                  INNER JOIN Dewar d ON c.dewarId = d.dewarId
                  INNER JOIN Shipping s ON d.shippingId = s.shippingId
                  INNER JOIN Proposal p on s.proposalId = p.proposalId
                  WHERE p.proposalId = :1 AND c.code LIKE :2", array($this->proposalid, "%_samples"));

                $free = 1;
            }

            return array('CONTAINERID'=>$containers[0]['CONTAINERID'], 'LOCATION'=>$free);
        }


        # ------------------------------------------------------------------------
        # Look up highest value DPC plan order to append new ones
        function _get_current_max_dcp_plan_order($containerId) {

            $maxLocation = $this->db->pq("SELECT MAX(bhd.planOrder) AS LOC
                                        FROM BLSample_has_DataCollectionPlan bhd
                                        INNER JOIN BLSample bls ON bls.blSampleId = bhd.blSampleId
                                        INNER JOIN Container c ON c.containerId = bls.containerId
                                        WHERE c.containerId = :1", array($containerId));

            return $maxLocation[0]['LOC'];
        }
        
        
        # ------------------------------------------------------------------------
        # Get list of pdbs for a proposal
        function _get_pdbs() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $where = 'pr.proposalid=:1';
            $args = array($this->proposalid);
            
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:2';
                array_push($args, $this->arg('pid'));
            }

            $rows = $this->db->pq("SELECT distinct hp.proteinhaspdbid, p.pdbid,pr.proteinid, p.name,p.code FROM pdb p INNER JOIN protein_has_pdb hp ON p.pdbid = hp.pdbid INNER JOIN protein pr ON pr.proteinid = hp.proteinid WHERE $where ORDER BY p.pdbid DESC", $args);
            
            $this->_output($rows);
        }
        
        # ------------------------------------------------------------------------
        # Add a new pdb
        function _add_pdb() {
            if (!$this->has_arg('PROTEINID')) $this->_error('No protein id specified');

            $prot = $this->db->pq("SELECT pr.proteinid 
              FROM protein pr 
              WHERE pr.proposalid = :1 AND pr.proteinid = :2", array($this->proposalid,$this->arg('PROTEINID')));
            
            if (!sizeof($prot)) $this->_error('No such protein');

            if (array_key_exists('pdb_file', $_FILES)) {
                if ($_FILES['pdb_file']['name']) {
                    $info = pathinfo($_FILES['pdb_file']['name']);
                    
                    if ($info['extension'] == 'pdb' || $info['extension'] == 'cif') {
                        $file = file_get_contents($_FILES['pdb_file']['tmp_name']);
                        $this->_associate_pdb($info['basename'],$file,'',$this->arg('PROTEINID'));
                    }
                }
            }
                
            if ($this->has_arg('pdb_code')) {
                $this->_associate_pdb($this->arg('pdb_code'),'',$this->arg('pdb_code'),$this->arg('PROTEINID'));
            }

            if ($this->has_arg('existing_pdb')) {
                $rows = $this->db->pq("SELECT p.pdbid FROM pdb p INNER JOIN protein_has_pdb hp ON p.pdbid = hp.pdbid INNER JOIN protein pr ON pr.proteinid = hp.proteinid WHERE pr.proposalid=:1 AND p.pdbid=:2", array($this->proposalid, $this->arg('existing_pdb')));
                
                if (!sizeof($rows)) $this->_error('The specified pdb doesnt exist');
                
                $this->db->pq("INSERT INTO protein_has_pdb (proteinhaspdbid,proteinid,pdbid) VALUES (s_protein_has_pdb.nextval,:1,:2)", array($this->arg('PROTEINID'),$this->arg('existing_pdb')));
            }
                
            $this->_output(1);

        }
                
        # Duplication :(
        function _associate_pdb($name,$contents,$code,$pid) { 
            $this->db->pq("INSERT INTO pdb (pdbid,name,contents,code) VALUES(s_pdb.nextval,:1,:2,:3) RETURNING pdbid INTO :id", array($name,$contents,$code));
            $pdbid = $this->db->id();
            
            $this->db->pq("INSERT INTO protein_has_pdb (proteinhaspdbid,proteinid,pdbid) VALUES (s_protein_has_pdb.nextval,:1,:2)", array($pid,$pdbid));
        }
        
        # ------------------------------------------------------------------------
        # Remove a pdb
        function _remove_pdb() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            #if (!$this->has_arg('pid')) $this->_error('No protein specified');
            if (!$this->has_arg('pdbid')) $this->_error('No pdb specified');
            
            $pdb = $this->db->pq("SELECT pd.pdbid 
              FROM pdb pd 
              INNER JOIN protein_has_pdb hp ON hp.pdbid=pd.pdbid 
              INNER JOIN protein p ON p.proteinid = hp.proteinid 
              WHERE p.proposalid=:1 AND hp.proteinhaspdbid=:2", array($this->proposalid, $this->arg('pdbid')));
            
            if (!sizeof($pdb)) $this->_error('No such pdb');
            else $pdb = $pdb[0];
            
            # Remove association
            $this->db->pq("DELETE FROM protein_has_pdb WHERE proteinhaspdbid=:1", array($this->arg('pdbid')));
            
            # Remove entry if its the last one
            $count = $this->db->pq("SELECT pdbid FROM protein_has_pdb WHERE pdbid=:1", array($pdb['PDBID']));
            if (!sizeof($count)) $this->db->pq("DELETE FROM pdb WHERE pdbid=:1", array($pdb['PDBID']));
            
            $this->_output(1);
        }
        
        
        
        function _add_protein() {
            global $valid_components;

            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('ACRONYM')) $this->_error('No protein acronym');
            
            $name = $this->has_arg('NAME') ? $this->arg('NAME') : '';
            $seq = $this->has_arg('SEQUENCE') ? $this->arg('SEQUENCE') : '';
            $mass = $this->has_arg('MOLECULARMASS') ? $this->arg('MOLECULARMASS') : null;
            $ct = $this->has_arg('CONCENTRATIONTYPEID') ? $this->arg('CONCENTRATIONTYPEID') : null;
            $cmt = $this->has_arg('COMPONENTTYPEID') ? $this->arg('COMPONENTTYPEID') : null;
            $global = $this->has_arg('GLOBAL') ? $this->arg('GLOBAL') : null;
            $density = $this->has_arg('DENSITY') ? $this->arg('DENSITY') : null;
            $externalid = $this->has_arg('EXTERNALID') ? $this->arg('EXTERNALID') : null;
            $safetyLevel = $this->has_arg('SAFETYLEVEL') ? $this->arg('SAFETYLEVEL') : null;

            // Only staff should be able to create Proteins that are not approved (i.e. no EXTERNALID) in User System
            if ($valid_components) {
                if (!$externalid && !$this->staff) $this->_error('Only staff can create proteins that are not approved in ISPyB', 401);

                if (!$this->staff) {
                    $chkext = $this->db->pq("SELECT proteinid FROM protein
                        WHERE proposalid=:1 AND externalid=:2", array($this->proposalid, $externalid));
                    if (sizeof($chkext)) $this->_error('No such protein to clone from');
                }
            }
            
            $chk = $this->db->pq("SELECT proteinid FROM protein
              WHERE proposalid=:1 AND acronym=:2", array($this->proposalid, $this->arg('ACRONYM')));
            if (sizeof($chk)) $this->_error('That protein acronym already exists in this proposal');

            $this->db->pq('INSERT INTO protein (proteinid,proposalid,name,acronym,sequence,molecularmass,bltimestamp,concentrationtypeid,componenttypeid,global,density,externalid,safetylevel)
              VALUES (s_protein.nextval,:1,:2,:3,:4,:5,CURRENT_TIMESTAMP,:6,:7,:8,:9,UNHEX(:10),:11) RETURNING proteinid INTO :id',
              array($this->proposalid, $name, $this->arg('ACRONYM'), $seq, $mass, $ct, $cmt, $global, $density, $externalid, $safetyLevel));

            $pid = $this->db->id();

            if ($seq) {
                $this->_on_add_protein_sequence($pid);
            }

            $this->_output(array('PROTEINID' => $pid));
        }


        function _on_add_protein_sequence($pid) {
            global $zocalo_recipes_on_add_protein_sequence;
            if (!empty($zocalo_recipes_on_add_protein_sequence)) {
                $parameters = array('ispyb_protein_id' => $pid);
                foreach($zocalo_recipes_on_add_protein_sequence as $recipe){
                    $this->_submit_zocalo_recipe($recipe, $parameters, 500);
                }
            }
        }


        # TODO: Consolidate this into clas.exp.php
        # - Lazy workaround...
        function _get_diffraction_plans() {
            global $preset_proposal;
            $where = 'dp.presetforproposalid=:1 OR (dp.presetforproposalid=:2)';

            $preset = $this->db->pq("SELECT p.proposalid
              FROM proposal p
              WHERE CONCAT(p.proposalcode,p.proposalnumber) LIKE :1", array($preset_proposal));

            if (sizeof($preset)) $presetid = $preset[0]['PROPOSALID'];
            else $presetid = 0;

            $args = array($this->proposalid, $presetid);

            if ($this->has_arg('did')) {
                $where .= ' AND dp.diffractionplanid = :'.(sizeof($args)+1);
                array_push($args, $this->arg('did'));
            }

            if ($this->has_arg('BEAMLINENAME')) {
                $where .= ' AND dp.beamlinename=:'.(sizeof($args)+1);
                array_push($args, $this->arg('BEAMLINENAME'));
            }

            $dps = $this->db->pq("SELECT dp.diffractionplanid, dp.comments, dp.experimentkind, dp.preferredbeamsizex, dp.preferredbeamsizey, ROUND(dp.exposuretime, 6) as exposuretime, ROUND(dp.requiredresolution, 2) as requiredresolution, boxsizex, boxsizey, axisstart, axisrange, numberofimages, transmission, energy as energy, monochromator, beamlinename
              FROM diffractionplan dp
              WHERE $where
            ", $args);

            if ($this->has_arg('did')) {
                if (sizeof($dps)) $this->_output($dps[0]);
                else $this->_error('No such diffraction plan');

            } else $this->_output($dps);
        }


        function _add_diffraction_plan() {
            if (!$this->has_arg('COMMENTS')) $this->_error('No name specified');

            $args = array($this->arg('COMMENTS'), $this->proposalid);
            foreach(array('EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR', 'BEAMLINENAME') as $f) {
                array_push($args, $this->has_arg($f) ? $this->arg($f) : null);
            } 

            $this->db->pq("INSERT INTO diffractionplan (diffractionplanid, comments, presetforproposalid, experimentkind, requiredresolution, preferredbeamsizex, preferredbeamsizey, exposuretime, boxsizex, boxsizey, axisstart, axisrange, numberofimages, transmission, energy, monochromator, beamlinename)
              VALUES (s_diffractionplan.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15, :16) RETURNING diffractionplanid INTO :id", $args);

            $this->_output(array('DIFFRACTIONPLANID' => $this->db->id()));
        }


        function _update_diffraction_plan() {
            $dp = $this->db->pq("SELECT dp.diffractionplanid 
              FROM diffractionplan dp
              WHERE dp.diffractionplanid=:1 AND dp.presetforproposalid=:2", array($this->arg('pid'), $this->proposalid));

            if (!sizeof($dp)) $this->_error('No such diffraction plan');
            $dp = $dp[0];

            $sfields = array('EXPERIMENTKIND', 'REQUIREDRESOLUTION', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'BOXSIZEX', 'BOXSIZEY', 'AXISSTART', 'AXISRANGE', 'NUMBEROFIMAGES', 'TRANSMISSION', 'ENERGY', 'MONOCHROMATOR', 'COMMENTS', 'BEAMLINENAME');
            foreach ($sfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE diffractionplan SET $f=:1 WHERE diffractionplanid=:2", array($this->arg($f), $dp['DIFFRACTIONPLANID']));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }


        function _delete_diffraction_plan() {

        }



        function _crystals() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $args = array($this->proposalid);
            $where = 'pr.proposalid=:1';
            $join = '';
            
            # For a specific protein
            if ($this->has_arg('pid')) {
                $where .= ' AND (pr.proteinid=:'.(sizeof($args)+1).' OR chc2.componentid=:'.(sizeof($args)+2).')';
                $join .= ' LEFT OUTER JOIN blsampletype_has_component chc2 ON chc2.blsampletypeid=cr.crystalid';
                array_push($args, $this->arg('pid'));
                array_push($args, $this->arg('pid'));
            }
            
            # For a particular crystal
            if ($this->has_arg('CRYSTALID')) {
                $where .= ' AND cr.crystalid=:'.(sizeof($args)+1);
                array_push($args, $this->arg('CRYSTALID'));                
            }

            $cseq = '';
            if ($this->has_arg('seq')) {
                $cseq = 'string_agg(cpr.sequence) as componentsequences,';
            }
            
            
            // Search
            if ($this->has_arg('s')) {
                $st = sizeof($args) + 1;
                $where .= " AND (lower(cr.name) LIKE lower(CONCAT(CONCAT('%',:".$st."),'%')) OR lower(pr.acronym) LIKE lower(CONCAT(CONCAT('%',:".($st+1)."), '%')) OR lower(cr.comments) LIKE lower(CONCAT(CONCAT('%',:".($st+2)."), '%')))";
                for ($i = 0; $i < 3; $i++) array_push($args, $this->arg('s'));
            }
            
            $tot = $this->db->pq("SELECT count(distinct cr.crystalid) as tot 
              FROM crystal cr
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN blsampletype_has_component chc ON cr.crystalid = chc.blsampletypeid
              INNER JOIN proposal p ON p.proposalid = pr.proposalid 
              $join WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            
            
            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);
            
            $order = 'cr.crystalid DESC';
            
            
            if ($this->has_arg('sort_by')) {
                $cols = array('CRYSTALID' => 'cr.crystalid', 'NAME' => 'cr.name', 'ACRONYM' => 'pr.acronym', 'SPACEGROUP' => 'cr.spacegroup', 'COMMENTS' => 'cr.comments');
                $dir = $this->has_arg('order') ? ($this->arg('order') == 'asc' ? 'ASC' : 'DESC') : 'ASC';
                if (array_key_exists($this->arg('sort_by'), $cols)) $order = $cols[$this->arg('sort_by')].' '.$dir;
            }
            
            $rows = $this->db->paginate("SELECT distinct cr.crystalid, cr.name, CONCAT(p.proposalcode,p.proposalnumber) as prop, pr.acronym, pr.name as protein, pr.sequence, pr.proteinid, cr.spacegroup,cr.comments,cr.name,cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma, cr.comments, cr.theoreticaldensity, pr.density
                                  ,string_agg(cpr.proteinid) as componentids, string_agg(cpr.name) as componentnames, string_agg(cpr.acronym) as componentacronyms, string_agg(cpr.density) as componentdensities, $cseq string_agg(cpr.global) as componentglobals, string_agg(chc.abundance) as componentamounts, string_agg(ct.symbol) as componenttypesymbols, pct.symbol,ROUND(cr.abundance,3) as abundance
                                  
                                  FROM crystal cr
                                  INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                                  LEFT OUTER JOIN concentrationtype pct ON pr.concentrationtypeid = pct.concentrationtypeid

                                  LEFT OUTER JOIN blsampletype_has_component chc ON cr.crystalid = chc.blsampletypeid
                                  LEFT OUTER JOIN protein cpr ON cpr.proteinid = chc.componentid
                                  LEFT OUTER JOIN concentrationtype ct ON cpr.concentrationtypeid = ct.concentrationtypeid

                                  INNER JOIN proposal p ON p.proposalid = pr.proposalid
                                  $join

                                  WHERE $where
                                  
                                  GROUP BY cr.crystalid, pr.acronym, pr.proteinid, cr.spacegroup, CONCAT(p.proposalcode,p.proposalnumber), cr.cell_a, cr.cell_b, cr.cell_c, cr.cell_alpha, cr.cell_beta, cr.cell_gamma
                                  
                                  ORDER BY $order", $args);
            
            foreach ($rows as &$r) {
                foreach (array('COMPONENTIDS', 'COMPONENTAMOUNTS', 'COMPONENTDENSITIES', 'COMPONENTNAMES', 'COMPONENTSEQUENCES', 'COMPONENTACRONYMS', 'COMPONENTTYPESYMBOLS', 'COMPONENTGLOBALS') as $k) {
                    if (array_key_exists($k, $r)) {
                      if ($r[$k]) $r[$k] = explode(',', $r[$k]);
                    }
                }
            }


            if ($this->has_arg('CRYSTALID')) {
                if (sizeof($rows))$this->_output($rows[0]);
                else $this->_error('No such crystal');
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));   
        }


        function _add_crystal() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('PROTEINID')) $this->_error('No protein specified');
            if (!$this->has_arg('NAME')) $this->_error('No name specified');

            $chk = $this->db->pq("SELECT proteinid FROM protein WHERE proteinid=:1 AND proposalid=:2", array($this->arg('PROTEINID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such protein');

            $a = array();
            foreach (array('SPACEGROUP', 'COMMENTS', 'NAME') as $f) $a[$f] = $this->has_arg($f) ? $this->arg($f) : '';
            foreach (array('CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'ABUNDANCE', 'THEORETICALDENSITY') as $f) $a[$f] = $this->has_arg($f) ? $this->arg($f) : null;

            $this->db->pq("INSERT INTO crystal (crystalid,proteinid,spacegroup,cell_a,cell_b,cell_c,cell_alpha,cell_beta,cell_gamma,abundance,comments,name,theoreticaldensity) VALUES (s_crystal.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12) RETURNING crystalid INTO :id", 
                array($this->arg('PROTEINID'), $a['SPACEGROUP'], $a['CELL_A'], $a['CELL_B'], $a['CELL_C'], $a['CELL_ALPHA'], $a['CELL_BETA'], $a['CELL_GAMMA'], $a['ABUNDANCE'], $a['COMMENTS'], $a['NAME'], $a['THEORETICALDENSITY']));
            $crysid = $this->db->id();

            if ($this->has_arg('COMPONENTIDS')) $this->_update_sample_components(array(), $this->arg('COMPONENTIDS'), $this->arg('COMPONENTAMOUNTS'), $crysid);
            
            $this->_output(array('CRYSTALID' => $crysid));
        }


        function _update_crystal() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('CRYSTALID')) $this->_error('No crystal specified');

            $chk = $this->db->pq("SELECT pr.proteinid, string_agg(chc.componentid) as componentids
              FROM crystal cr 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid
              LEFT OUTER JOIN blsampletype_has_component chc ON cr.crystalid = chc.blsampletypeid
              WHERE cr.crystalid=:1 AND pr.proposalid=:2", array($this->arg('CRYSTALID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such crystal');
            $chk = $chk[0];

            $cfields = array('PROTEINID', 'SPACEGROUP', 'CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'ABUNDANCE', 'COMMENTS', 'NAME', 'THEORETICALDENSITY');
            foreach ($cfields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE crystal SET $f=:1 WHERE crystalid=:2", array($this->arg($f), $this->arg('CRYSTALID')));
                    
                    if ($f == 'PROTEINID') {
                        $name = $this->db->pq('SELECT acronym FROM protein WHERE proteinid=:1', array($chk['PROTEINID']));
                        if (sizeof($name)) {
                            $this->_output(array('ACRONYM' => $name[0]['ACRONYM']));
                        }
                    } else $this->_output(array($f => $this->arg($f)));
                }
            }

            if ($this->has_arg('COMPONENTIDS') && $this->has_arg('COMPONENTAMOUNTS')) { 
                $init_comps = explode(',', $chk['COMPONENTIDS']);
                $this->_update_sample_components($init_comps, $this->arg('COMPONENTIDS'), $this->arg('COMPONENTAMOUNTS'), $this->arg('CRYSTALID'));
            }
        }



        function _protein_lattices() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            
            $where = 'pr.proposalid=:1';
            $args = array($this->proposalid);

            if ($this->has_arg('lid')) {
                $where .= ' AND l.proteinhaslatticeid=:2';
                array_push($args, $this->arg('lid'));
            }
            
            if ($this->has_arg('pid')) {
                $where .= ' AND pr.proteinid=:2';
                array_push($args, $this->arg('pid'));
            }

            $tot = $this->db->pq("SELECT count(distinct l.componentlatticeid) as tot 
              FROM componentlattice l
              INNER JOIN protein pr ON pr.proteinid = l.componentid
              WHERE $where", $args);
            $tot = intval($tot[0]['TOT']);

            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;
            
            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }
            
            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT l.componentlatticeid, pr.proteinid, l.spacegroup, l.cell_a, l.cell_b, l.cell_c, l.cell_alpha, l.cell_beta, l.cell_gamma
              FROM componentlattice l
              INNER JOIN protein pr ON pr.proteinid = l.componentid
              WHERE $where", $args);
            
            if ($this->has_arg('pid')) {
                if (!sizeof($rows)) $this->_error('No such lattice');
                else $this->_output($rows[0]);
            } else $this->_output(array('total' => $tot,
                                 'data' => $rows,
                           ));
        }

        function _add_protein_lattice() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('PROTEINID')) $this->_error('No protein specified');

            $chk = $this->db->pq("SELECT proteinid FROM protein WHERE proteinid=:1 AND proposalid=:2", array($this->arg('PROTEINID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such protein');


        }

        function _update_protein_lattice() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');
            if (!$this->has_arg('CRYSTALID')) $this->_error('No crystal specified');

            $chk = $this->db->pq("SELECT pr.proteinid FROM componentlattice l INNER JOIN protein pr ON l.proteinid = cr.proteinid
              WHERE l.componentlatticeid=:1 AND pr.proposalid=:2", array($this->arg('COMPONENTLATTICEID'), $this->proposalid));
            if (!sizeof($chk)) $this->_error('No such lattice');
        }




        function _concentration_types() {
            $rows = $this->db->pq("SELECT concentrationtypeid, symbol, name FROM concentrationtype");
            $this->_output($rows);
        }


        function _component_types() {
            $rows = $this->db->pq("SELECT componenttypeid, name FROM componenttype");
            $this->_output($rows);
        }


        function _component_sub_types() {
            $rows = $this->db->pq("SELECT componentsubtypeid, name FROM componentsubtype");
            $this->_output($rows);
        }



        # Sample Groups
        function _build_sample_groups_query($where, $fields, $from_table, $joins, $group = '')
        {
            return "SELECT $fields $from_table $joins WHERE $where $group";
        }

        function _sample_groups() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'bsg.proposalid = :1';
            $args = array($this->proposalid);
            $total_select_field = 'count(*) as total';
            $joins = '';
            $from_table = '';
            $group_by = '';

            // Check if we are grouping the result by BlSAMPLEID or BLSAMPLEGROUPID.
            // This is currently being used by xpdf when fetching the list of sample group samples.
            if ($this->has_arg('groupSamplesType') &&  $this->arg('groupSamplesType') === 'BLSAMPLEGROUPID') {
                $select_fields = 'bsg.blsamplegroupid, bsg.name, count(bshg.blsampleid) as samplegroupsamples';
                $from_table = 'FROM blsamplegroup bsg';
                $joins = 'LEFT JOIN blsamplegroup_has_blsample bshg ON bshg.blsamplegroupid = bsg.blsamplegroupid';
                $group_by .= 'GROUP BY bsg.blsamplegroupid';

                $total_sub_query = $this->_build_sample_groups_query($where, $total_select_field, $from_table, $joins, $group_by);
                $total_query = "SELECT count(*) as total FROM ($total_sub_query) as total";
            } else {
                $select_fields = 'bsg.blSampleGroupId, bsg.name, bshg.blSampleId, bshg.type, b.name as sample, cr.crystalId, cr.name as crystal';
                $from_table = 'FROM blsample b';
                $joins = '
                    INNER JOIN blsamplegroup_has_blsample bshg ON bshg.blsampleid = b.blsampleid
                    INNER JOIN blsamplegroup bsg ON bshg.blsamplegroupid = bsg.blsamplegroupid
                    INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                ';

                $total_query = $this->_build_sample_groups_query($where, $total_select_field, $from_table, $joins, $group_by);
            }

            $tot = $this->db->pq($total_query, $args);

            $tot = intval($tot[0]['TOTAL']);

            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;

            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }

            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows_query = $this->_build_sample_groups_query($where, $select_fields, $from_table, $joins, $group_by);
            $rows = $this->db->paginate($rows_query, $args);

            $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }

        function _add_new_sample_group() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $sgid = $this->_create_sample_group();

            $this->_output($sgid);

            $this->_output(array(
                'BLSAMPLEGROUPID' => $sgid,
                'NAME' => $this->has_arg('NAME') ? $this->arg('NAME') : NULL,
                'SAMPLEGROUPSAMPLES' => 0
            ));
        }

        function _create_sample_group() {
            $name = $this->has_arg('NAME') ? $this->arg('NAME') : NULL;
            $this->db->pq("INSERT INTO blsamplegroup (blsamplegroupid, name, proposalid) VALUES(NULL, :1, :2)", array($name, $this->proposalid));
            return $this->db->id();
        }

        function _get_sample_groups_by_sample() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            $where = 'bsg.proposalid = :1';
            $args = array($this->proposalid);

            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');

            $where .= ' AND b.blsampleid = :2';
            array_push($args, $this->arg('BLSAMPLEID'));

            $tot = $this->db->pq("SELECT count(*) as total
                FROM blsamplegroup bsg
                INNER JOIN blsamplegroup_has_blsample bshg on bsg.blsamplegroupId = bshg.blsamplegroupid
                INNER JOIN blsample b on bshg.blsampleId = b.blsampleid
                WHERE $where", $args);

            $tot = intval($tot[0]['TOTAL']);

            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;

            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }

            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT bsg.blsamplegroupid, bsg.name
                FROM blsamplegroup bsg
                INNER JOIN blsamplegroup_has_blsample bshg on bsg.blsamplegroupid = bshg.blsamplegroupid
                INNER JOIN blsample b on bshg.blsampleid = b.blsampleid
                WHERE $where", $args);

            $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }

        function _get_sample_group_samples() {
            if (!$this->has_arg('prop')) $this->_error('No proposal specified');

            if (!$this->has_arg('BLSAMPLEGROUPID')) $this->error('No sample group specified');

            $where = 'bsg.proposalid = :1';
            $args = array($this->proposalid);

            $where .= ' AND bsg.blsamplegroupid = :2';
            array_push($args, $this->arg('BLSAMPLEGROUPID'));

            $tot = $this->db->pq("SELECT count(*) as total
                FROM blsample b
                INNER JOIN blsamplegroup_has_blsample bshg ON bshg.blsampleid = b.blsampleid
                INNER JOIN blsamplegroup bsg ON bsg.blsamplegroupid = bshg.blsamplegroupid
                WHERE $where", $args);

            $tot = intval($tot[0]['TOTAL']);

            $start = 0;
            $pp = $this->has_arg('per_page') ? $this->arg('per_page') : 15;
            $end = $pp;

            if ($this->has_arg('page')) {
                $pg = $this->arg('page') - 1;
                $start = $pg*$pp;
                $end = $pg*$pp+$pp;
            }

            $st = sizeof($args)+1;
            $en = $st + 1;
            array_push($args, $start);
            array_push($args, $end);

            $rows = $this->db->paginate("SELECT b.blsampleid, bshg.blsamplegroupid, bshg.grouporder, bshg.type, CONCAT(bshg.blsamplegroupid, '-', b.blsampleid) as blsamplegroupsampleid, b.name as sample, b.dimension1, b.dimension2, b.dimension3, b.shape, b.packingfraction, cr.theoreticaldensity, b.blsampleid, cr.crystalid, cr.name as crystal, c.code as container, pr.name as protein, bsg.name, pr.proteinid
                FROM blsample b
                INNER JOIN blsamplegroup_has_blsample bshg ON bshg.blsampleid = b.blsampleid
                INNER JOIN blsamplegroup bsg ON bshg.blsamplegroupid = bsg.blsamplegroupid
                INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                INNER JOIN container c ON c.containerid = b.containerid
                WHERE $where
            ", $args);

            $this->_output(array(
                'total' => $tot,
                'data' => $rows,
            ));
        }

        function _add_sample_to_group() {
            if (!$this->has_arg('BLSAMPLEID')) $this->_error('No sample specified');
            if (!$this->has_arg('BLSAMPLEGROUPID')) $this->_error('No sample group specified');

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid,$this->arg('BLSAMPLEID')));

            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $sgid = $this->arg('BLSAMPLEGROUPID');

            $sample_group_exists = $this->db->pq("SELECT bsg.blsamplegroupid
                FROM blsamplegroup bsg
                WHERE bsg.blsamplegroupid = :1 AND bsg.proposalid = :2", array($sgid, $this->proposalid));
            if (!sizeof($sample_group_exists)) $this->_error('No such sample group');

            $order = $this->has_arg('GROUPORDER') ? $this->arg('GROUPORDER') : 1;
            $type = $this->has_arg('TYPE') ? $this->arg('TYPE') : null;

            $this->db->pq("INSERT INTO blsamplegroup_has_blsample (blsampleid, blsamplegroupid, grouporder, type) 
                VALUES (:1,:2, :3, :4)", array($this->arg('BLSAMPLEID'), $sgid, $order, $type));

            $this->_output(array('BLSAMPLEGROUPSAMPLEID' => $sgid.'-'.$this->arg('BLSAMPLEID'), 'BLSAMPLEID' => $this->arg('BLSAMPLEID'), 'BLSAMPLEGROUPID' => $sgid));
        }

        function _save_sample_to_group($blSampleId, $blSampleGroupId, $groupOrder, $type) {
            if (!isset($blSampleId)) return 'No sample specified';

            if (!isset($blSampleGroupId)) return 'No sample group specified. Create one before adding samples to group.';

            $sgid = $blSampleGroupId;

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid
                  FROM blsample b
                  INNER JOIN crystal cr ON cr.crystalid = b.crystalid
                  INNER JOIN protein pr ON pr.proteinid = cr.proteinid
                  LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid
                  WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid, $blSampleId));

            if (!sizeof($samp)) return 'No such sample';
            else $samp = $samp[0];

            $sample_exists = $this->db->pq("SELECT blsampleid FROM blsamplegroup_has_blsample WHERE blsampleid = :1 AND blsamplegroupid = :2", array($blSampleId, $sgid));

            if (count($sample_exists) > 0) {
                return array('BLSAMPLEGROUPSAMPLEID' => $sgid.'-'.$blSampleId, 'BLSAMPLEID' => $blSampleId, 'BLSAMPLEGROUPID' => $sgid);
            }

            $order = isset($groupOrder) ? $groupOrder: 1;
            $type = isset($type) ? $type : null;

            $this->db->pq("INSERT INTO blsamplegroup_has_blsample (blsampleid, blsamplegroupid, grouporder, type)
                    VALUES (:1,:2, :3, :4)", array($blSampleId, $sgid, $order, $type));

            return array('BLSAMPLEGROUPSAMPLEID' => $sgid.'-'.$blSampleId, 'BLSAMPLEID' => $blSampleId, 'BLSAMPLEGROUPID' => $sgid);
        }

        function _update_sample_in_group() {
            if (!$this->has_arg('BLSAMPLEGROUPID')) $this->_error('No sample group specified');
            if (!$this->has_arg('BLSAMPLEGROUPSAMPLEID')) $this->_error('No group sample id specified');

            $gid = $this->arg('BLSAMPLEGROUPID');
            $arr = explode('-', $this->arg('BLSAMPLEGROUPSAMPLEID'));
            $sid = end($arr);

            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid, $sid));
            
            if (!sizeof($samp)) $this->_error('No such sample');
            else $samp = $samp[0];

            $types = array('sample', 'container', 'background', 'calibrant');
            $fields = array('GROUPORDER', 'TYPE');
            foreach ($fields as $f) {
                if ($this->has_arg($f)) {
                    $this->db->pq("UPDATE blsamplegroup_has_blsample SET $f=:1 WHERE blsampleid=:2 AND blsamplegroupid=:3", array($this->arg($f), $sid, $gid));
                    $this->_output(array($f => $this->arg($f)));
                }
            }
        }

        function _remove_sample_from_group() {
            if (!$this->has_arg('BLSAMPLEGROUPID')) $this->_error('No sample group specified');
            if (!$this->has_arg('BLSAMPLEGROUPSAMPLEID')) $this->_error('No group sample id specified');

            $gid = $this->arg('BLSAMPLEGROUPID');
            $arr = explode('-', $this->arg('BLSAMPLEGROUPSAMPLEID'));
            $sid = end($arr);

            $this->_delete_sample_from_group($gid, $sid);

            $this->_output(new \stdClass);
        }

        function _delete_sample_from_group($blSampleGroupId, $blSampleGroupSampleId) {
            $samp = $this->db->pq("SELECT b.blsampleid, pr.proteinid,cr.crystalid,dp.diffractionplanid 
              FROM blsample b 
              INNER JOIN crystal cr ON cr.crystalid = b.crystalid 
              INNER JOIN protein pr ON pr.proteinid = cr.proteinid 
              LEFT OUTER JOIN diffractionplan dp on dp.diffractionplanid = b.diffractionplanid 
              WHERE pr.proposalid = :1 AND b.blsampleid = :2", array($this->proposalid, $blSampleGroupSampleId));

            if (!sizeof($samp)) $this->_error('No such sample');

            $this->db->pq("DELETE FROM blsamplegroup_has_blsample WHERE blsampleid = :1 AND blsamplegroupid = :2", array($blSampleGroupSampleId, $blSampleGroupId));
        }

        // Get spacegroups from database
        // Could extend this to filter on spacegroupshortname (also unique)
        // Also extend to take mx used flag to return a filtered list
        function _get_spacegroups() {
            // Store the spacegroup id if we have one
            $sid = $this->has_arg('SPACEGROUPID') ? $this->arg('SPACEGROUPID') : null;
            // Reusing ty as a parameter. Set this to mx to only get those items in MX_used column
            $mx = $this->has_arg('ty') ? $this->arg('ty') == 'mx' : null;
            $where = "WHERE 1=1";
            $args = array();

            // Are we looking for a specific id or subset of entries?
            // Presence of id takes precedence over mx flag
            if ($sid) {
                $where .= ' AND spacegroupid = :'.(sizeof($args)+1);
                array_push($args, $sid);
            } else if ($mx) {
                $where .= ' AND mx_used = :'.(sizeof($args)+1);
                array_push($args, 1);
            }

            $rows = $this->db->pq("SELECT spacegroupid, spacegroupnumber, spacegroupshortname, spacegroupname, bravaisLattice FROM spacegroup $where", $args);

            if (!sizeof($rows)) {
                if ($this->has_arg('SPACEGROUPID')) $this->_error('Spacegroup id not found');
                else $this->_error('No spacegroup types found');
            }

            if ($this->has_arg('SPACEGROUPID')) $this->_output($rows[0]);
            else $this->_output(array('total' => count($rows), 'data' => $rows));
          }
}

