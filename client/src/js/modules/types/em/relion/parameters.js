import unitsHtml from 'modules/types/em/components/units-html'

export default  {
    /* TODO: it would be great to have the validation rules in here
       But I can't persuade Vee Validate to agree with that */

    /* TODO:
    * If we used the parameter names from $workflow_parameters in
    * /api/src/Page/EM.php:_relion_start
    * Then we could use some kind of mapping back to the lables used in
    * modules/types/em/relion/form-classification.vue, etc.
    * To provide more human readable labels for
    * modules/types/em/job-parameters/job-parameters.vue
    */
    'projectAcquisitionSoftware': { // acquisition_software
        'value': '',
        'default': 'EPU',
        'label': 'Acquisition Software',
        'options': ['EPU', 'SerialEM'],
        'transform': 'none',
    },
    'projectMovieRawFolder': { // import_images
        'value': '',
        'default': 'raw',
        'label': 'Raw Folder',
        'options': [
            'raw', 'raw2', 'raw3', 'raw4', 'raw5',
            'raw6', 'raw7', 'raw8', 'raw9'
        ],
        'transform': 'none',
    },
    'projectMovieFileNameExtension': { // import_images
        'value': '',
        'default': '.tiff',
        'label': 'Movie File Name Extension',
        'options': ['.tif', '.tiff', '.mrc', '.eer'],
        'transform': 'fileExtension',
    },
    'projectGainReferenceFile': {
        'value': false,
        'default': false,
        'label': 'Gain Reference File',
        'transform': 'boolean',
    },
    'projectGainReferenceFileName': { // motioncor_gainreference
        'value': '',
        'default': 'gain.mrc',
        'label': "Gain Reference File Name",
        'conditional': 'projectGainReferenceFile',
        'transform': 'none',
    },
    'voltage': { // voltage
        'value': '',
        'default': '300',
        'label': "Voltage (kV)",
        'options': ['200', '300'],
        'transform': 'integer',
    },
    'sphericalAberration': { // Cs
        'value': '',
        'default': '2.7',
        'label': 'Spherical Aberration (mm)',
        'options': [
            { 'value': '2.7', 'display': '2.7 (Talos/Krios)' },
        ],
        'transform': 'float',
    },
    'findPhaseShift': { // ctffind_do_phaseshift
        'value': false,
        'default': false,
        'label': "Phase Plate Used",
        'transform': 'boolean',
    },
    'pixelSize': { // angpix
        'value': '',
        'default': '',
        'label': 'Pixel Size (Å/pixel)',
        'transform': 'float',
    },
    'eerGrouping': { // eer_grouping
        'value': '',
        'default': '20',
        'label': 'EER fractionation',
        'transform': 'integer',
    },
    'motionCorrectionBinning': { // motioncor_binning
        'value': '',
        'default': '1',
        'label': 'Motion Correction Binning',
        'options': ['1', '2'],
        'transform': 'integer',
    },
    'dosePerFrame': { // motioncor_doseperframe
        'value': '',
        'default': '0.5',
        'label': 'Dose per frame (' +
            unitsHtml.electron + '/' + unitsHtml.angstromSquared + ')',
        'transform': 'float',
    },
    'pipelineDo1stPass': { // stop_after_ctf_estimation (inverted)
        'value': true,
        'default': true,
        'label': 'Continue after CTF estimation',
        'transform': 'boolean',
    },
    'pipelineDo1stPassClassification2d': { // pipelineDo1stPassClassification2d
        'value': true,
        'default': true,
        'label': 'Do 2D Classification',
        'transform': 'boolean',
        'conditional': 'pipelineDo1stPass',
    },
    'pipelineDo1stPassClassification3d': { // pipelineDo1stPassClassification2d
        'value': true,
        'default': true,
        'label': 'Do 3D Classification',
        'transform': 'boolean',
        'conditional': 'pipelineDo1stPass',
    },
    'useFscCriterion': {
        'value': false,
        'default': false,
        'label': 'Best initial model from FSC',
        'transform': 'boolean',
        'conditional': 'pipelineDo1stPassClassification3d'
    },
    'particleUseCryolo': { // autopick_do_cryolo
        'value': false,
        'default': false,
        'label': 'Use crYOLO',
        'transform': 'boolean',
        'conditional': 'pipelineDo1stPass',
    },
    'particleDiameterMin': { // autopick_LoG_diam_min
        'value': '',
        'default': '',
        'label': 'Minimum Diameter (Å)',
        'transform': 'float',
        'conditional': 'pipelineDo1stPass',
    },
    'extract_downscale': {
        // Always true - has no input - is never posted
        'label': 'Extract Downscale'
    },
    'particleDiameterMax': { // autopick_LoG_diam_max
        'value': '',
        'default': '',
        'label': 'Maximum Diameter (Å)',
        'transform': 'float',
        'conditional': 'pipelineDo1stPass',
    },
    'particleMaskDiameter': { // mask_diameter
        'value': '',
        'default': '',
        'label': 'Mask Diameter (Å)',
        'transform': 'integer',
        'conditional': 'pipelineDo1stPass',
    },
    'particleBoxSize': { // extract_boxsize
        'value': '',
        'default': '',
        'label': 'Box Size (pixels)',
        'transform': 'integer',
        'conditional': 'pipelineDo1stPass',
    },
    'particleBoxSizeSmall': { // extract_small_boxsize
        'value': '',
        'default': '',
        'label': 'Downsample Box Size (pixels)',
        'transform': 'integer',
        'conditional': 'pipelineDo1stPass',
    },
    'pipelineDo2ndPass': {
        'value': false,
        'default': false,
        'label': 'Do Second Pass',
        'transform': 'boolean',
    },
    'pipelineDo2ndPassClassification2d': { // pipelineDo1stPassClassification2d_pass2
        'value': true,
        'default': true,
        'label': 'Do 2D Classification',
        'transform': 'boolean',
        'conditional': 'pipelineDo2ndPass',
    },
    'pipelineDo2ndPassClassification3d': { // pipelineDo1stPassClassification3d_pass2
        'value': false,
        'default': false,
        'label': 'Do 3D Classification',
        'transform': 'boolean',
        'conditional': 'pipelineDo2ndPass',
    },
    'particleCalculateForMe': { // doesn't get posted
        // TODO: Should be default true for forms with default data
        // TODO: Should be default false for forms with "recovered" data
        'value': true,
        'default': false,
        'label': 'Calculate For Me'
    },
}
