define([
    'vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'moment',
    'modules/types/em/scipion/models/scipion',
    'models/visit',
    'templates/vue/types/em/process/scipion.html',
], function (
    Vue,
    VeeValidate,
    Promise,
    VueWrapper,
    moment,
    ScipionModel,
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
                    numberOfIndividualFrames: null,
                    patchX: null,
                    patchY: null,
                    samplingRate: null,
                    particleSize: null,
                    minDist: null,
                    windowSize: null,
                    findPhaseShift: false,
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
                            {title: 'Scipion Processing'}
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
                    this.numberOfIndividualFrames = null;
                    this.patchX = 5;
                    this.patchY = 5;
                    this.samplingRate = null;
                    this.particleSize = null;
                    this.minDist = 100;
                    this.windowSize = 512;
                    this.findPhaseShift = false;

                    // To reset form validation, we should wait for next tick
                    // Vue reactivity means the DOM will not be updated immediately
                    this.$nextTick(function () {
                        this.$validator.reset()
                    })
                },
                onSubmit: function () {
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

                    this.dosePerFrame = parseFloat(this.dosePerFrame);
                    this.numberOfIndividualFrames = parseInt(this.numberOfIndividualFrames);
                    this.patchX = parseInt(this.patchX);
                    this.patchY = parseInt(this.patchY);
                    this.samplingRate = parseFloat(this.samplingRate);
                    this.particleSize = parseInt(this.particleSize);
                    this.minDist = parseInt(this.minDist);
                    this.windowSize = parseInt(this.windowSize);
                    this.findPhaseShift = this.findPhaseShift === true;

                    let model = new ScipionModel({
                        id: this.visit['VISIT'],

                        dosePerFrame: this.dosePerFrame,
                        numberOfIndividualFrames: this.numberOfIndividualFrames,
                        patchX: this.patchX,
                        patchY: this.patchY,
                        samplingRate: this.samplingRate,
                        particleSize: this.particleSize,
                        minDist: this.minDist,
                        windowSize: this.windowSize,
                        findPhaseShift: this.findPhaseShift
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
                onContinue: function () {
                    app.navigate('dc/visit/' + this.visit['VISIT'], {trigger: true});
                }
            }
        })
    })
});
