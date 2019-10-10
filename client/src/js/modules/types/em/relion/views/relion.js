define([
    'vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'moment',
    'modules/types/em/relion/models/relion',
    'models/visit',
    'templates/vue/types/em/process/relion.html',
], function (
    Vue,
    VeeValidate,
    Promise,
    VueWrapper,
    moment,
    RelionModel,
    VisitModel,
    template
) {
    // Promise is not used, but required for IE if we want to use vee-validate
    Vue.use(VeeValidate);

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: template,

            data: function () {
                return {
                    showSpinner: false,

                    // GUI
                    isVisitLoaded: false,
                    isVisitActive: false,
                    isFormReadOnly: true,
                    isJobQueued: false,

                    // Visit
                    visit: {},

                    // Form fields
                    dosePerFrame: null,
                    voltage: null,
                    sphericalAberration: null,
                    findPhaseShift: null,
                    pixelSize: null,
                    particleDiameterMax: null,
                    particleDiameterMin: null,
                    particleReference3D: null,
                    particleMaskDiameter: null,
                    particleBoxSize: null,
                    particleDownsampleSize: null,
                    particleCalculateForMe: null,
                    projectDirectory: null,
                    projectMovieFileNameExtension: null,
                    projectGainReferenceFile: null,
                    projectGainReferenceFileName: null,
                    pipelineDo1stPass: null,
                    pipelineDo1stPassClassification2D: null,
                    pipelineDo1stPassClassification3D: null,
                    pipelineDo2ndPass: null,
                    pipelineDo2ndPassClassification2D: null,
                    pipelineDo2ndPassClassification3D: null,
                }
            },
            created: function () {
                let self = this;

                self.showSpinner = true;

                let visitModel = new VisitModel({
                    VISIT: this.$getOption('visit_str')
                });

                visitModel.fetch({
                    success: function () {
                        self.visit = visitModel.attributes;

                        self.isVisitLoaded = true;
                        self.isVisitActive = !!+self.visit['ACTIVE']; // ACTIVE represented by string value "0" or "1" in JSON

                        if (self.isVisitActive) {
                            self.isFormReadOnly = false;
                            self.resetForm();
                        } else {
                            self.visitEndDateAsString = moment(self.visit['ENISO']).format('HH:mm on Do MMMM');
                        }

                        self.showSpinner = false;

                        app.bc.reset([
                            {title: 'Data Collections', url: '/dc'},
                            {title: self.visit['BL']},
                            {title: self.visit['VISIT'], url: '/dc/visit/' + self.visit['VISIT']},
                            {title: 'Relion Processing'}
                        ]);
                    },
                    error: function () {
                        app.bc.reset([{title: 'Error'}]);
                        app.message({title: 'No such visit', message: 'The specified visit does not exist'})
                    }
                });
            },
            methods: {
                // With new build and (IE polyfill) we could use
                // Object.assign() to reset all data to initial state
                // Using the method below is simple alternative that
                // allows us to clear form data after submission
                resetForm: function () {
                    this.dosePerFrame = 0.5;
                    this.voltage = 300;
                    this.sphericalAberration = 2.7;
                    this.findPhaseShift = null;
                    this.pixelSize = null;
                    this.particleDiameterMax = null;
                    this.particleDiameterMin = null;
                    this.particleReference3D = null;
                    this.particleMaskDiameter = 190;
                    this.particleBoxSize = 256;
                    this.particleDownsampleSize = 64;
                    this.particleCalculateForMe = true;
                    this.projectMovieFileNameExtension = '.tiff';
                    this.projectGainReferenceFile = false;
                    this.projectGainReferenceFileName = 'gain.mrc'; // /dls/instrument/data/year/visit/Movies/
                    this.pipelineDo1stPass = false;
                    this.pipelineDo1stPassClassification2D = true;
                    this.pipelineDo1stPassClassification3D = true;
                    this.pipelineDo2ndPass = false;
                    this.pipelineDo2ndPassClassification2D = true;
                    this.pipelineDo2ndPassClassification3D = false;

                    // To reset form validation, we should wait for next tick
                    // Vue reactivity means the DOM will not be updated immediately
                    this.$nextTick(function () {
                        this.$validator.reset()
                    })
                },
                onStartJob: function () {
                    let self = this;

                    this.$validator.validateAll().then(function (result) {
                        if (result) {
                            self.submitProcessingJob()
                        } else {
                            console.log('Form submission prevented, validation failed.');
                        }
                    });
                },
                submitProcessingJob: function () {
                    this.showSpinner = true;

                    // Convert form inputs from string to float, integer, or boolean data type.
                    // Ensures values are correctly encoded in JSON, not as strings of text.
                    // parseInt() and parseFloat() trim whitespace characters.
                    // parseInt() removes fractional-part of numeric input.
                    // Updates form inputs with converted values.

                    this.voltage = parseInt(this.voltage);
                    this.sphericalAberration = parseFloat(this.sphericalAberration);
                    this.findPhaseShift = this.findPhaseShift === true;
                    this.pixelSize = parseFloat(this.pixelSize);
                    this.dosePerFrame = parseFloat(this.dosePerFrame);

                    this.pipelineDo1stPass = this.pipelineDo1stPass === true;
                    this.pipelineDo1stPassClassification2D = this.pipelineDo1stPassClassification2D === true;
                    this.pipelineDo1stPassClassification3D = this.pipelineDo1stPassClassification3D === true;

                    if (this.pipelineDo1stPass) {
                        this.particleDiameterMax = parseFloat(this.particleDiameterMax);
                        this.particleDiameterMin = parseFloat(this.particleDiameterMin);
                        this.particleMaskDiameter = parseInt(this.particleMaskDiameter); // TODO : CALCULATE
                        this.particleBoxSize = parseInt(this.particleBoxSize); // TODO : CALCULATE
                        this.particleDownsampleSize = parseInt(this.particleDownsampleSize); // TODO : CALCULATE
                        this.particleCalculateForMe = this.particleCalculateForMe === true;
                    }

                    this.pipelineDo2ndPass = this.pipelineDo2ndPass === true;
                    this.pipelineDo2ndPassClassification2D = this.pipelineDo2ndPassClassification2D === true;
                    this.pipelineDo2ndPassClassification3D = this.pipelineDo2ndPassClassification3D === true;

                    let model = new RelionModel({
                        id: this.visit['VISIT'],

                        projectMovieFileNameExtension: this.projectMovieFileNameExtension.substr(1),
                        projectGainReferenceFile: this.projectGainReferenceFile,
                        projectGainReferenceFileName: (this.projectGainReferenceFile ? this.projectGainReferenceFileName : ''),

                        voltage: this.voltage,
                        sphericalAberration: this.sphericalAberration,
                        findPhaseShift: this.findPhaseShift,
                        pixelSize: this.pixelSize,
                        dosePerFrame: this.dosePerFrame,

                        pipelineDo1stPass: this.pipelineDo1stPass,
                        pipelineDo1stPassClassification2D: (this.pipelineDo1stPass ? this.pipelineDo1stPassClassification2D : false),
                        pipelineDo1stPassClassification3D: (this.pipelineDo1stPass ? this.pipelineDo1stPassClassification3D : false),

                        particleDiameterMax: (this.pipelineDo1stPass ? this.particleDiameterMax : null),
                        particleDiameterMin: (this.pipelineDo1stPass ? this.particleDiameterMin : null),
                        particleReference3D: '',
                        particleMaskDiameter: 190,
                        particleBoxSize: 256,
                        particleDownsampleSize: 64,
                        particleCalculateForMe: this.particleCalculateForMe,

                        pipelineDo2ndPass: this.pipelineDo2ndPass,
                        pipelineDo2ndPassClassification2D: (this.pipelineDo1stPass ? this.pipelineDo2ndPassClassification2D : false),
                        pipelineDo2ndPassClassification3D: (this.pipelineDo1stPass ? this.pipelineDo2ndPassClassification3D : false),
                    });

                    let self = this;

                    model.save({}, {
                        type: 'POST',
                        success: function (model, response, options) {
                            self.isFormReadOnly = true;
                            self.isJobQueued = true;
                            self.showSpinner = false;

                            let alertMessage = 'Job successfully submitted.';

                            if ('timestamp_iso8601' in response) {
                                alertMessage = alertMessage + ' Queued at ' + moment(response.timestamp_iso8601).format('HH:mm:ss') + '.';
                            }

                            app.alert({className: 'message notify', message: alertMessage});
                        },
                        error: function (model, response, options) {
                            self.showSpinner = false;

                            let alertMessage = 'There was a problem submitting this job.';

                            let responseObj = JSON.parse(response.responseText);

                            if ('message' in responseObj) {
                                alertMessage = responseObj.message;
                            }

                            app.alert({message: alertMessage});
                        }
                    })
                },

                onStopJob: function () {
                    this.isFormReadOnly = false;
                    this.isJobQueued = false;
                },

                onResetJob: function () {
                    this.isFormReadOnly = false;
                    this.isJobQueued = false;

                    this.resetForm();
                },

                toggleFormReadOnly: function () {
                    this.isFormReadOnly = !this.isFormReadOnly;
                },

                // onContinue: function () {
                //     app.navigate('dc/visit/' + this.visit['VISIT'], {trigger: true});
                // },
            }
        })
    })
});
