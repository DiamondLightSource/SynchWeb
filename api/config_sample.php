<?php

    # SynchWeb API Configuration Sample
    # - Many of the parameters in this file will in due course move into the
    #   database


    # Production / Dev Mode Switch
    # - Dev mode enabled debugging to stdout in addition to httpd error_log
    #   Values: dev | production
    $mode = 'dev';

    # Database credentials, db = hostname/database
    $isb  = array('user' => 'user', 'pass' => 'pass', 'db' => 'localhost/ispyb');
    $dbtype = 'mysql';


    # Encoded JWT key, used to sign and check validaty of jwt tokens
    # - Create one of these using /api/authenticate/key
    #   This can be changed to invalidate all currently active tokens
    $jwt_key = '';


    # Auth type
    # Can be cas, ldap
    $authentication_type = 'cas';


    # CAS url (if using cas, assume https)
    $cas_url = 'cas.server.ac.uk';

    # Follow CAS SSO
    $cas_sso = true;

    # CAS CA Cert (for SSO)
    $cacert = '/etc/certs/ca-bundle.crt';


    # ldap server, used for lookup and authentication (if using)
    # Update the ldap(s) prefix, hostname and search settings as required
    $ldap_server = 'ldaps://ldap.example.com';
    $ldap_search = 'ou=people,dc=example,dc=com';

    # Upload directory
    # - used for user image uploads
    $upload_directory = '/path/to/ispyb2/uploads';

    # MOTD
    # - Show at the top of every page on first load
    $motd = 'This is the message of the day.';

    # Maintainance Mode
    # - Disables site access, showing a message
    # - This is defined in client/js/config.json


    # String replacements for autoprocessing types
    # First part is searched for in the processing command line
    $ap_types = array(
        '_reproc' => 'XIA2 Reprocess',
        'fast_dp' => 'Fast DP',
        'autoPROC' => 'autoPROC',
        '-3da ' => 'XIA2 3da',
        '-2d ' => 'XIA2 2d',
        '-2dr ' => 'XIA2 2dr',
        '-2da ' => 'XIA2 3da',
        '-3d ' => 'XIA2 3d',
        '-3dr ' => 'XIA2 3dr',
        '-3dii ' => 'XIA2 3dii',
        '-3daii ' => 'XIA2 3daii',
        '-3diir ' => 'XIA2 3diir',
        '-dials ' => 'DIALS',
        'pipeline=3da ' => 'XIA2 3da',
        'pipeline=2d ' => 'XIA2 2d',
        'pipeline=2dr ' => 'XIA2 2dr',
        'pipeline=2da ' => 'XIA2 3da',
        'pipeline=3d ' => 'XIA2 3d',
        'pipeline=3dr ' => 'XIA2 3dr',
        'pipeline=3dii ' => 'XIA2 3dii',
        'pipeline=3daii ' => 'XIA2 3daii',
        'pipeline=3diir ' => 'XIA2 3diir',
        'pipeline=dials ' => 'DIALS',
    );

    # Crystal alignment programs
    $strat_align = array('XOalign', 'dials.align_crystal');

    # Places to search for autoprocessing and screening statuses. File scraping is done if no database value is available.
    $ap_statuses = array(
        'locations' => array('/processed', '/tmp'),

        'types' => array(
            'screening' => array(
                # Name on datacollectionpage => (folder, log file, grep for success, database name for matching)
                "Mosflm" => array('simple_strategy/', 'strategy_native.log', 'Phi start'),
                "EDNA" => array('edna/', 'summary.html', 'Selected spacegroup'),
            ),
            'autoproc' => array(
                "Fast DP" => array('fast_dp/', 'fast_dp.log', 'I/sigma', 'fast_dp'),
                
                "Xia2/3dii" => array('xia2/3dii-run/', 'xia2.txt' , 'I/sigma', 'xia2 3dii'),
                "DIALS" => array('xia2/dials-run/', 'xia2.txt' , 'I/sigma', 'xia2 dials'),
                
                "Xia2/Multiplex" => array('xia2.multiplex/', 'xia2.multiplex.log' , 'clustering summary', 'xia2.multiplex'),
                
                "autoPROC" => array('autoPROC/ap-run/', 'autoPROC.log', 'Normal termination', 'autoPROC'),            
            ),
            'downstream' => array(
                "Fast EP" => array('fast_ep/', 'fast_ep.log', 'Best hand:'),
                "Dimple" => array('fast_dp/dimple/', 'refmac5_restr.log', 'DPI'),
                "MrBUMP" => array('auto_mrbump/', 'MRBUMP.log', 'Looks like MrBUMP succeeded'),
                "Big EP/XDS" => array('big_ep/', '/xia2/3dii-run/big_ep*.log', 'Results for', ''),
                "Big EP/DIALS" => array('big_ep/', '/xia2/dials-run/big_ep_*.log', 'Results for', 'Residues'),
            )
        )
    );

    # List of enabled container types, all if empty 
    $enabled_container_types = array();

    # Active MQ - Set to empty string to disable
    $activemq_server = 'tcp://activemq.server.ac.uk';
    $activemq_rp_queue = '/queue/zocolo.name';

    # Paths
    # - These map files to physical locations on disk
    #   For diffraction images, snapshots, and thumbnails

    # Visit directory on disk
    $visit_directory = '/dls/<%=BEAMLINENAME%>/data/<%=YEAR%>/<%=VISIT%>';

    # Diffraction image snapshots
    $jpeg_location = '<%=VISITDIR%>/jpegs/<%=IMDIRECTORY%>/<%=IMFILE%>.jpeg';
    $jpeg_thumb_location = '<%=VISITDIR%>/jpegs/<%=IMDIRECTORY%>/<%=IMFILE%>.thumb.jpeg';

    # Server log location
    $server_log = '/dls_sw/<%=BEAMLINENAME%>/logs/gda-server.log';

    # Email addresses, comma separate for multiple recepients
    # - Email templates in assets/emails in plain and html/ format

    # From field for emails
    $email_from  = 'no-reply@server.ac.uk';

    # Site admin
    # - The feedback form uses this address
    $email_admin = 'webmaster@server.ac.uk';

    # Recepients for dewar Dispatch / Transfers Emails when users request dispatch or tranfser from the shipping page
    $dispatch_email = 'ehc@server.ac.uk, goods@server.ac.uk';
    $transfer_email = 'ehc@server.ac.uk';

    # and for RED experiments, 
    # email will be sent for shipments containing red level samples when "send to facility" is clicked
    $cl3_email = 'cl3team@server.ac.uk, goods@server.ac.uk';

    # and for shipment booked,
    $shipbooked_email = 'goods@server.ac.uk';

    # Industrial Contacts
    # - Industrial users get a personalised email with in contact details,
    #   template in assets/emails/dewar-stores-in-in.html
    $in_contacts = array('Ind Contact' => 'in@server.ac.uk'
                        );


    # Array of container histories to trigger a new data notification email
    $new_data = array(
        array('processing', 'in_transit_unloading', 'in_local_storage')
    );


    # Beamline Sample Registration Machines
    # - Used for touchscreen application (unauthenticated)
    $blsr = array('1.2.3.4', # my touchscreen computer
                  );

    # Beamline Sample Registration IP -> Beamline mapping
    # - Third part of ip is used to identify beamline
    #   x.x.103.x => i03
    $ip2bl = array(103 => 'i03',
                   );

    # Barcode readers
    # - These clients use the android app (unauthenticated)
    $bcr = array('1.2.3.4', # my android device
                 );


    # Imaging API Machines
    #  - The have free access to imaging/inspections
    $img = array('1.2.3.4'
                );


    # Facility Name for statuses, emails, etc
    # - Used throughout the app for labels
    $facility_name = 'Diamond Light Source';
    $facility_short = 'DLS';

    # These idents are used when searching the RCSB for PDBs to generate PDB stats
    $facility_pdb_ident = array('DIAMOND BEAMLINE', 'DIAMOND LIGHT SOURCE BEAMLINE');


    # Shipping Address for Labels
    # - This is added to all shipment label PDFs
    $facility_fao = "The Experimental Hall Coordinators";
    $facility_company = "Diamond Light Source";
    $facility_address = "Fermi Avenue";
    $facility_city = "Didcot";
    $facility_postcode = "OX11 0DE";
    $facility_country = "United Kingdom";
    $facility_contact = "A person";
    $facility_phone = "01234 567890";
    $facility_email = "stores@facility.co.uk";

    // List of domestic free countries
    $facility_courier_countries = array('United Kingdom');
    // List of non dom eu free countries
    $facility_courier_countries_nde = array('France', 'Italy', 'Spain');
    $package_description = 'Dry shipper containing frozen crystals';
    $dewar_weight = 18;


    # DHL API Details
    $dhl_enable = true;
    $dhl_user = 'user';
    $dhl_pass = 'password';
    $dhl_env = 'staging';

    // Domestic acc number
    $dhl_acc = '12345678';
    // Import acc number
    $dhl_acc_import = '12345678';

    $dhl_terms = '/path/to/terms.html';
    $dhl_link = 'http://link/to/dhl/instructions';
    // N = Domestic Express, P = Worldwide Express
    $dhl_service = 'N';
    // Non dom service (eu)
    $dhl_service_eu = 'U';


    # VMXi
    $vmxi_user = 'vmxi';
    $vmxi_pass = 'pass';
    $uas_url = 'http://path.to.uas';

    # Risk statements
    $sample_hazard = 'Samples will be handled following the beamline risk assessment';
    $exp_hazard = 'VMXi will be operated following the beamline risk assessment';


    # Autocollect
    $auto_user = 'auto_user';
    $auto_pass = 'auto_pass';

    # Risk statements
    $auto_sample_hazard = 'Samples will be handled following the beamline risk assessment';
    $auto_exp_hazard = 'The beamline will be operated following the beamline risk assessment';

    # Session Type
    $auto_session_type = 'Auto Collect';

    # Whitelist + beamlines
    $auto = array('123.456.789.1');
    $auto_bls = array('i03', 'i04');



    # Proposal to store beamline presets in
    $preset_proposal = 'cm12345';


    # Beamlines on which to scale the gridplot to 1024
    $scale_grid = array('i24');

    # Proposal codes to list
    $prop_codes = array('lb', 'cm', 'mx', 'nt', 'nr', 'sw', 'in', 'mt', 'ee', 'em', 'sm');


    # These map proposal types to their proposalcode
    # - If these are not defined for a proposal type, the api then uses bl_types below
    $prop_types = array('mx', 'em');

    # This maps beamlinename in blsession to a proposal type
    # - Internal maps a beamline to an api "type", there are currently:
    #     mx, gen, em
    $bl_types = array('mx' => array('i02', 'i03', 'i04'),
                      'gen' => array('i11'),
                      );


    # Webcam IPs
    # - These are show on the beamline status and active datacollection lists
    $webcams = array('i03' => array('1.2.3.4'),
                     );

    # On-axis viewing (OAV) camera addresses
    # - Shown on beamline status page for staff, for remote debugging
    #   Diamond uses mostly axis cameras which provide an mjpeg stream
    $oavs = array('i03' => 'http://1.2.3.4:8080/OAV.MJPG.mjpg',
                 );


    # Beamline Parameter Type
    # - Defines what type of system the beamline parameters use
    #   For future implementation of Tango, currently only support EPICS
    $bl_pv_type = 'EPICS';
    $bl_pv_prog = '/path/to/caget';
    $bl_pv_env = 'EPICS_CA_ADDR_LIST=123.45.678.9';

    # PVs for beamline status
    # - These are displayed on an active visit so remote users can see beamline status
    #   In future these could be Tango variables
    $bl_pvs = array(
                            'i02' => array('Hutch' => 'BL02I-PS-IOC-01:M14:LOP',
                                           'Port Shutter' => 'FE02I-PS-SHTR-01:STA',
                                           'Expt Shutter' => 'BL02I-PS-SHTR-01:STA',
                                           'Fast Shutter' => 'BL02I-EA-SHTR-01:SHUTTER_STATE',
                                           'Wavelength' => 'BL02I-OP-DCM-01:WLRB',
                                           'Transmission' => 'BL02I-EA-ATTN-01:CONV_TRANS_RBV',
                                           ),
    );

    # Map of beamlinename to pv prefix
    $bl_pv_map = array(
        'i02' => 'BL02I',
        'i03' => 'BL03I',
    );


?>
