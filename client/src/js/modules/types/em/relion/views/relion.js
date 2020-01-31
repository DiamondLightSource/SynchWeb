define([
    'backbone',
    'vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'moment',
    'modules/types/em/relion/models/relion',
    'models/visit',
    'templates/vue/types/em/process/relion.html',
], function (
    Backbone,
    Vue,
    VeeValidate,
    Promise,
    VueWrapper,
    moment,
    RelionModel,
    SessionModel,
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
                    isSessionLoaded: false,
                    isSessionActive: false,
                    isFormReadOnly: true,
                    isJobStarted: false,
                    isJobStopped: false,
                    isLogVisible: false,
                    sessionEvents: [],

                    // Session
                    session: {},

                    // Form fields
                    projectAcquisitionSoftware: null,
                    projectMovieFileNameExtension: null,
                    projectGainReferenceFile: null,
                    projectGainReferenceFileName: null,

                    voltage: null,
                    sphericalAberration: null,
                    findPhaseShift: null,
                    pixelSize: null,
                    motionCorrectionBinning: null,
                    dosePerFrame: null,

                    pipelineDo1stPass: null,
                    pipelineDo1stPassClassification2d: null,
                    pipelineDo1stPassClassification3d: null,

                    particleUseCryolo: null,
                    particleDiameterMin: null,
                    particleDiameterMax: null,
                    particleMaskDiameter: null,
                    particleBoxSize: null,
                    particleBoxSizeSmall: null,
                    particleCalculateForMe: null,

                    pipelineDo2ndPass: null,
                    pipelineDo2ndPassClassification2d: null,
                    pipelineDo2ndPassClassification3d: null,
                }
            },
            created: function () {
                this.showSpinner = true;

                let sessionModel = new SessionModel({
                    VISIT: this.$getOption('session_str')
                });

                let self = this;

                sessionModel.fetch({
                    success: function (model, response, options) {
                        self.session = sessionModel.attributes;

                        self.isSessionLoaded = true;
                        self.isSessionActive = !!+self.session['ACTIVE']; // ACTIVE represented by string value "0" or "1" in JSON

                        if (self.isSessionActive) {
                            self.resetForm();
                        } else {
                            self.sessionEndDateAsString = moment(self.session['ENISO']).format('HH:mm on Do MMMM');
                        }

                        app.bc.reset([
                            {title: 'Data Collections', url: '/dc'},
                            {title: self.session['BL']},
                            {title: self.session['VISIT'], url: '/dc/visit/' + self.session['VISIT']},
                            {title: 'Relion Processing'}
                        ]);

                        self.sessionEvents = [];

                        self.showSpinner = false;
                    },
                    error: function (model, response, options) {
                        self.showSpinner = false;

                        app.bc.reset([{title: 'Error'}]);
                        app.message({title: 'No such session', message: 'The specified session does not exist'})
                    }
                });
            },
            methods: {
                // With new build and (IE polyfill) we could use
                // Object.assign() to reset all data to initial state
                // Using the method below is simple alternative that
                // allows us to clear form data after submission
                resetForm: function () {
                    this.isJobStarted = false;
                    this.isJobStopped = false;
                    this.processingIsActive = false;
                    this.processingTimestamp = false;

                    this.projectAcquisitionSoftware = 'EPU';
                    this.projectMovieFileNameExtension = '.tiff';
                    this.projectGainReferenceFile = false;
                    this.projectGainReferenceFileName = 'gain.mrc';

                    this.voltage = 300;
                    this.sphericalAberration = 2.7;
                    this.findPhaseShift = null;
                    this.pixelSize = null;
                    this.motionCorrectionBinning = 1;
                    this.dosePerFrame = 0.5;

                    this.pipelineDo1stPass = false;
                    this.pipelineDo1stPassClassification2d = true;
                    this.pipelineDo1stPassClassification3d = false;

                    this.particleUseCryolo = false;
                    this.particleDiameterMin = null;
                    this.particleDiameterMax = null;
                    this.particleMaskDiameter = null;
                    this.particleBoxSize = null;
                    this.particleBoxSizeSmall = null;
                    this.particleCalculateForMe = true;

                    this.pipelineDo2ndPass = false;
                    this.pipelineDo2ndPassClassification2d = false;
                    this.pipelineDo2ndPassClassification3d = false;

                    this.isLogVisible = false;
                    this.sessionEvents = [];

                    this.checkStatus();

                    // To reset form validation, we should wait for next tick
                    // Vue reactivity means the DOM will not be updated immediately
                    this.$nextTick(function () {
                        this.$validator.reset()
                    })
                },

                onCalculateForMe: function () {
                    if (this.pipelineDo1stPass && this.particleCalculateForMe) {
                        if (
                            !this.pixelSize ||
                            isNaN(this.pixelSize) ||
                            this.errors.has('pixelSize') ||

                            !this.particleDiameterMax ||
                            isNaN(this.particleDiameterMax) ||
                            this.errors.has('particleDiameterMax')
                        ) {
                            this.particleMaskDiameter = null;
                            this.particleBoxSize = null;
                            this.particleBoxSizeSmall = null;
                        } else {
                            let particleSizePixels = this.particleDiameterMax / this.pixelSize;

                            this.particleMaskDiameter = Math.round(this.particleDiameterMax * 1.1);
                            this.particleBoxSize = calculateBoxSize(particleSizePixels, this.motionCorrectionBinning);
                            this.particleBoxSizeSmall = calculateBoxSizeSmall(this.particleBoxSize, this.pixelSize, this.motionCorrectionBinning);
                        }
                    }

                    function calculateBoxSize(particleSizePixels, motionCorrectionBinning) {
                        let boxSizeExact = particleSizePixels * 1.2;
                        let boxSizeInt = Math.ceil(boxSizeExact);
                        return boxSizeInt + (boxSizeInt % 2);
                    }                    

                    function calculateBoxSizeSmall(particleBoxSize, pixelSize, motionCorrectionBinning) {
                        let boxSizes = [48, 64, 96, 128, 160, 192, 256, 288, 300, 320, 360, 384, 400, 420, 450, 480, 512, 640, 768, 896, 1024];

                        for (let i = 0; i < boxSizes.length; i++) {
                            let boxSize = boxSizes[i];

                            if (boxSize > particleBoxSize) return particleBoxSize;

                            if (((pixelSize * particleBoxSize) / boxSize) < 4.25) return boxSize;
                        }

                        return "Box size is too large!";
                    }
                },

                onStart: function () {
                    let self = this;

                    this.$validator.validateAll().then(function (result) {
                        if (result) {
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
                            this.motionCorrectionBinning = parseInt(this.motionCorrectionBinning);
                            this.dosePerFrame = parseFloat(this.dosePerFrame);

                            this.pipelineDo1stPass = this.pipelineDo1stPass === true;
                            this.pipelineDo1stPassClassification2d = this.pipelineDo1stPassClassification2d === true;
                            this.pipelineDo1stPassClassification3d = this.pipelineDo1stPassClassification3d === true;

                            if (this.pipelineDo1stPass) {
                                this.particleUseCryolo = this.particleUseCryolo === true;
                                // TODO Ensure particleDiameterMin < particleDiameterMax. (JPH)
                                this.particleDiameterMin = parseFloat(this.particleDiameterMin);
                                this.particleDiameterMax = parseFloat(this.particleDiameterMax);
                                this.particleMaskDiameter = parseInt(this.particleMaskDiameter);
                                this.particleBoxSize = parseInt(this.particleBoxSize);
                                this.particleBoxSizeSmall = parseInt(this.particleBoxSizeSmall);
                                this.particleCalculateForMe = this.particleCalculateForMe === true;
                            }

                            this.pipelineDo2ndPass = this.pipelineDo2ndPass === true;
                            this.pipelineDo2ndPassClassification2d = this.pipelineDo2ndPassClassification2d === true;
                            this.pipelineDo2ndPassClassification3d = this.pipelineDo2ndPassClassification3d === true;

                            let model = new RelionModel({
                                id: self.session['VISIT'],

                                projectAcquisitionSoftware: self.projectAcquisitionSoftware,
                                projectMovieFileNameExtension: self.projectMovieFileNameExtension.substr(1),
                                projectGainReferenceFile: self.projectGainReferenceFile,
                                projectGainReferenceFileName: (self.projectGainReferenceFile ? self.projectGainReferenceFileName : null),

                                voltage: self.voltage,
                                sphericalAberration: self.sphericalAberration,
                                findPhaseShift: self.findPhaseShift,
                                pixelSize: self.pixelSize,
                                motionCorrectionBinning: self.motionCorrectionBinning,
                                dosePerFrame: self.dosePerFrame,

                                pipelineDo1stPass: self.pipelineDo1stPass,
                                pipelineDo1stPassClassification2d: (self.pipelineDo1stPass ? self.pipelineDo1stPassClassification2d : false),
                                pipelineDo1stPassClassification3d: (self.pipelineDo1stPass ? self.pipelineDo1stPassClassification3d : false),

                                particleUseCryolo: (self.pipelineDo1stPass ? self.particleUseCryolo : false),
                                particleDiameterMin: (self.pipelineDo1stPass ? self.particleDiameterMin : null),
                                particleDiameterMax: (self.pipelineDo1stPass ? self.particleDiameterMax : null),
                                particleMaskDiameter: self.particleMaskDiameter,
                                particleBoxSize: self.particleBoxSize,
                                particleBoxSizeSmall: self.particleBoxSizeSmall,
                                particleCalculateForMe: self.particleCalculateForMe,

                                pipelineDo2ndPass: self.pipelineDo2ndPass,
                                pipelineDo2ndPassClassification2d: (self.pipelineDo2ndPass ? self.pipelineDo2ndPassClassification2d : false),
                                pipelineDo2ndPassClassification3d: (self.pipelineDo2ndPass ? self.pipelineDo2ndPassClassification3d : false),
                            });

                            self.isLogVisible = true;

                            model.save({}, {
                                type: 'POST',
                                success: function (model, response, options) {
                                    self.isFormReadOnly = true;
                                    self.isJobStarted = true;
                                    self.isJobStopped = false;
                                    self.showSpinner = false;

                                    if ('timestamp' in response) {
                                        self.sessionEvents.unshift({
                                            timestamp_str: moment(response.timestamp).format('HH:mm:ss'),
                                            message: 'Start processing.'
                                        });
                                    }
                                },
                                error: function (model, response, options) {
                                    self.showSpinner = false;

                                    let alertMessage = 'There was a problem starting this request.';

                                    if ('message' in response.responseJSON) {
                                        alertMessage = response.responseJSON.message;
                                    }

                                    app.alert({message: alertMessage});
                                }
                            })
                        } else {
                            console.log('Form submission prevented, validation failed.');
                        }
                    });
                },

                onStop: function () {
                    let self = this;

                    Backbone.ajax({
                        type: 'PATCH',
                        url: app.apiurl + '/em/process/relion/session/' + this.session['VISIT'],
                        success: function (xhr) {
                            self.isJobStopped = true;

                            if ('timestamp' in xhr) {
                                self.sessionEvents.unshift({
                                    timestamp_str: moment(xhr.timestamp).format('HH:mm:ss'),
                                    message: 'Stop processing.'
                                });
                            }
                        },
                        error: function (model, response, options) {
                            self.showSpinner = false;

                            let alertMessage = 'There was a problem stopping this job.';

                            if ('message' in response.responseJSON) {
                                alertMessage = response.responseJSON.message;
                            }

                            app.alert({message: alertMessage});
                        }
                    })
                },

                checkStatus: function () {
                    let self = this;

                    Backbone.ajax({
                        type: 'GET',
                        url: app.apiurl + '/em/process/relion/session/' + this.session['VISIT'],
                        success: function (xhr) {
                            if ('processingIsActive' in xhr) {
                                self.processingIsActive = xhr.processingIsActive;
                            }

                            if ('processingTimestamp' in xhr) {
                                self.processingTimestamp = xhr.processingTimestamp;
                            }

                            if (self.processingIsActive === true) {
                                self.isFormReadOnly = true;
                                self.isJobStarted = true;
                                // self.isJobStopped = false;
                            } else {
                                self.isFormReadOnly = false;
                            }
                        },
                        error: function (model, response, options) {
                            self.showSpinner = false;

                            let alertMessage = 'There was a problem checking this job.';

                            if ('message' in response.responseJSON) {
                                alertMessage = response.responseJSON.message;
                            }

                            app.alert({message: alertMessage});
                        }
                    })
                },

                onReset: function () {
                    let self = this;

                    Backbone.ajax({
                        type: 'DELETE',
                        url: app.apiurl + '/em/process/relion/session/' + this.session['VISIT'],
                        success: function (xhr) {
                            self.resetForm();
                        },
                        error: function (model, response, options) {
                            self.showSpinner = false;

                            let alertMessage = 'There was a problem resetting this job.';

                            if ('message' in response.responseJSON) {
                                alertMessage = response.responseJSON.message;
                            }

                            app.alert({message: alertMessage});
                        }
                    })
                },
            }
        })
    })
});
