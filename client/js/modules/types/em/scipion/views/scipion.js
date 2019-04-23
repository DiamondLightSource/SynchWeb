define([
    'vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'moment',
    'modules/types/em/scipion/models/scipion',
    'text!templates/types/em/process/scipion.html',
], function (
    Vue,
    VeeValidate,
    Promise,
    VueWrapper,
    moment,
    ScipionModel,
    template
) {
    // Promise is not used, but required for IE if we want to use vee-validate
    Vue.use(VeeValidate);

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: template,

            data: function () {
                return {
                    visit: null,

                    dosePerFrame: null,
                    numberOfIndividualFrames: null,
                    patchX: null,
                    patchY: null,
                    samplingRate: null,
                    particleSize: null,
                    minDist: null,
                    windowSize: null,
                    findPhaseShift: false,

                    isLoading: false,
                    isQueued: false
                }
            },
            created: function () {
                // Set default values
                this.resetForm();

                this.visit = this.$getOption('model');
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
                    this.isLoading = true;

                    let model = new ScipionModel({
                        id: this.visit.get('VISIT'),

                        dosePerFrame: this.dosePerFrame,
                        numberOfIndividualFrames: this.numberOfIndividualFrames,
                        patchX: this.patchX,
                        patchY: this.patchY,
                        samplingRate: this.samplingRate,
                        particleSize: this.particleSize,
                        minDist: this.minDist,
                        windowSize: this.windowSize,
                        findPhaseShift: this.findPhaseShift,
                    });

                    let self = this;

                    model.save({}, {
                        type: 'POST',
                        success: function (model, response, options) {
                            let alertMessage = 'Job successfully submitted.';

                            if ('timestamp_iso8601' in response) {
                                alertMessage = alertMessage + ' Queued at ' + moment(response.timestamp_iso8601).format('HH:mm:ss') + '.';
                            }

                            app.alert({className: 'message notify', message: alertMessage});

                            self.isQueued = true;
                            self.isLoading = false;
                        },
                        error: function (model, response, options) {
                            let alertMessage = 'Something went wrong submitting this job.';

                            let responseObj = JSON.parse(response.responseText);

                            if ('message' in responseObj) {
                                alertMessage = alertMessage + ' ' + responseObj.message;
                            }

                            app.alert({message: alertMessage});

                            self.isLoading = false;
                        }
                    })
                },
                onContinue: function () {
                    app.navigate('dc/visit/' + this.visit.get('VISIT'), {trigger: true});
                }
            }
        })
    })
});