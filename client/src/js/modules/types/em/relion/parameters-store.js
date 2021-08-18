import { ErrorBag } from 'vee-validate'
import Backbone from 'backbone'
import boxCalculator from 'modules/types/em/relion/box-calculator'

export default {
    'namespaced': true,
    'state': {
        'formErrors': new ErrorBag(),
        'params': {
            /* TODO:
            * If we used the parameter names from $workflow_parameters in
            * /api/src/Page/EM.php:_relion_start
            * Then we could use some kind of mapping back to the lables used in
            * modules/types/em/relion/form-classification.vue, etc.
            * To provide more human readable labels for
            * modules/types/em/job-parameters/job-parameters.vue
            */
            'projectAcquisitionSoftware': '',      // acquisition_software
            'projectMovieRawFolder': '',           // import_images
            'projectMovieFileNameExtension': '',   // import_images
            'projectGainReferenceFile': false,
            'projectGainReferenceFileName': '',    // motioncor_gainreference
            'voltage': '',                         // voltage
            'sphericalAberration': '2.7',          // Cs
            'findPhaseShift': false,               // ctffind_do_phaseshift
            'pixelSize': '',                       // angpix
            'eerGrouping': '',                     // eer_grouping
            'motionCorrectionBinning': '1',        // motioncor_binning
            'dosePerFrame': '',                    // motioncor_doseperframe
            'pipelineDo1stPass': true,             // stop_after_ctf_estimation (inverted)
            'pipelineDo1stPassClassification2d': true, // pipelineDo1stPassClassification2d
            'pipelineDo1stPassClassification3d': true, // pipelineDo1stPassClassification2d
            'particleUseCryolo': false,            // autopick_do_cryolo
            'particleDiameterMin': '',             // autopick_LoG_diam_min
            'particleDiameterMax': '',             // autopick_LoG_diam_max
            'particleMaskDiameter': '',            // mask_diameter
            //                                        extract_downscale - always true
            'particleBoxSize': '',                 // extract_boxsize
            'particleBoxSizeSmall': '',            // extract_small_boxsize
            'pipelineDo2ndPass': false,
            'pipelineDo2ndPassClassification2d': true,  // pipelineDo1stPassClassification2d_pass2
            'pipelineDo2ndPassClassification3d': false, // pipelineDo1stPassClassification3d_pass2
            'particleCalculateForMe': true,        // UI option only
        },
    },
    // These end up getting stuck in an endless loop
    // when you try to build the JSON to post
    'getters': {
        'hasFormError': function(state) {
            return function(parameter) {
                return state.errors.has(parameter)
            }
        },
        'projectGainReferenceFile': function(state) {
            return state.params.projectGainReferenceFile === true
        },
        'pipelineDo1stPass': function(state) {
            return state.params.pipelineDo1stPass === true
        },
        'pipelineDo2ndPass': function(state) {
            return state.params.pipelineDo2ndPass === true
        },
        'movieFileEer': function(state) {
            return state.params.projectMovieFileNameExtension == '.eer'
        },
        'calculateForMe': function(state) {
            return state.params.particleCalculateForMe === true
        },
        'postData': function(state, getters) {
            const params = state.params
            // Convert form inputs from string to float, integer, or boolean
            // Ensures values are correctly encoded in JSON, not as strings
            // parseInt() and parseFloat() trim whitespace characters.
            // parseInt() removes fractional-part of numeric input.
            var postData = {
                'projectGainReferenceFile':
                    getters.projectGainReferenceFile,
                'pipelineDo1stPass':
                    getters.pipelineDo1stPass,
                'pipelineDo2ndPass':
                    getters.pipelineDo2ndPass,
                'projectAcquisitionSoftware':
                    params.projectAcquisitionSoftware,
                'projectMovieRawFolder':
                    params.projectMovieRawFolder,
                'projectMovieFileNameExtension':
                    params.projectMovieFileNameExtension.substr(1),
                'projectGainReferenceFileName':
                    params.projectGainReferenceFile ?
                        params.projectGainReferenceFileName : null,
                'voltage':
                    parseInt(params.voltage),
                'sphericalAberration':
                    parseFloat(params.sphericalAberration),
                'findPhaseShift':
                    params.findPhaseShift === true,
                'pixelSize':
                    parseFloat(params.pixelSize),
                'motionCorrectionBinning':
                    parseInt(params.motionCorrectionBinning),
                'dosePerFrame':
                    parseFloat(params.dosePerFrame),
            }
            if (getters.pipelineDo1stPass) {
                Object.assign(postData, {
                    'pipelineDo1stPassClassification2d':
                        params.pipelineDo1stPassClassification2d === true,
                    'pipelineDo1stPassClassification3d':
                        params.pipelineDo1stPassClassification3d === true,
                    'particleUseCryolo':
                        params.particleUseCryolo === true,
                    'particleDiameterMin':
                        parseFloat(params.particleDiameterMin),
                    'particleDiameterMax':
                        parseFloat(params.particleDiameterMax),
                    'particleMaskDiameter':
                        parseInt(params.particleMaskDiameter),
                    'particleBoxSize':
                        parseInt(params.particleBoxSize),
                    'particleBoxSizeSmall':
                        parseInt(params.particleBoxSizeSmall),
                })
            }
            if (getters.pipelineDo2ndPass) {
                Object.assign(postData, {
                    'pipelineDo2ndPassClassification2d':
                        params.pipelineDo2ndPassClassification2d === true,
                    'pipelineDo2ndPassClassification3d':
                        params.pipelineDo2ndPassClassification3d === true,
                });
            }
            return postData
        },
    },
    'mutations': {
        'formErrors': function(state, payload) {
            state.formErrors = payload
        },
        'updateParam': function(state, payload) {
            const name = payload.name
            const value = payload.value
            if (typeof state.params[name] == 'undefined') {
                throw new Error('illegal attempt to update state of' + name)
            }
            state.params[name] = value
            boxCalculator(name, this, state.params)
        },
    },
    'actions': {
        'start': function(context) {
            context.commit('loading', true, { 'root': true })
            Backbone.ajax({
                'url': context.rootGetters['apiUrl'] +
                    '/em/process/relion/session/' +
                    context.rootGetters['proposal/currentVisit'],
                'type': 'POST',
                'contentType': 'application/json',
                'data': JSON.stringify(context.getters.postData),
                'success': function (
                    response, // eslint-disable-line no-unused-vars
                    status, // eslint-disable-line no-unused-vars
                    xhr // eslint-disable-line no-unused-vars
                ) {
                    context.commit(
                        'loading', false, { 'root': true }
                    )
                    context.commit(
                        'em/cancelProcessingDialog', null, { 'root': true }
                    )
                    context.commit(
                        'notifications/addNotification', {
                            'title': 'Job submitted',
                            'message': 'Processing Job submitted OK.',
                            'level': 'success'
                        }, { 'root': true }
                    )
                },
                'error': function (
                    model,
                    response, // eslint-disable-line no-unused-vars
                    options // eslint-disable-line no-unused-vars
                ) {
                    context.commit(
                        'loading', false, { 'root': true }
                    )
                    context.commit(
                        'notifications/addNotification', {
                            'title': 'Failed',
                            'message': 'There was a problem processing this request.',
                            'level': 'error'
                        }, { 'root': true }
                    )
                    console.log('Relion start failed', model)
                },
            })

        },
    },
}
