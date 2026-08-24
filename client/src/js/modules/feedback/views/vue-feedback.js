define(['vue',
    'utils/vuewrapper',
    'modules/feedback/models/feedback',
    'templates/vue/feedback/feedback.html',
    ], function(Vue, VueWrapper, FeedbackModel, template) {

    return VueWrapper.extend({
        vueView: Vue.extend({

            data: function() {
                return {
                    name: '',
                    email: '',
                    feedback: '',
                    isLoading: false    
                }
            },
            methods: {
                resetForm: function() {
                    this.name = ''
                    this.email = ''
                    this.feedback = ''

                    // To reset form validation, we should wait for next tick
                    // Vue rectivity means the DOM will not be updated immediately
                    this.$nextTick(function() {
                        if (this.$refs.formObserver) {
                            this.$refs.formObserver.reset();
                        }
                    })
                },
                onSubmit: function() {   
                    let self = this

                    this.$refs.formObserver.validate().then(function(result) {
                        if (result) {
                            self.submitFeedback()
                        } else {
                            console.log('Form submission prevented, validation failed');
                        }
                    });
                },
                submitFeedback: function() {
                    this.isLoading = true

                    let model = new FeedbackModel({
                        name: this.name,
                        email: this.email,
                        feedback: this.feedback
                    })

                    let self = this

                    // Passing {} as first argument means send all model data
                    model.save({}, {
                        success: function(model, response, options) {
                            // Indicate success and reset form
                            app.message({message: "Feedback successfully submitted"})
                            self.isLoading = false
                            self.resetForm()
                        },
                        error: function(model, response, options) {
                            app.alert({message: "Something went wrong submitting this feedback, please try again"})
                            // If feedback failed, don't reset the form, just set loading to false
                            self.isLoading = false
                        }
                    })
                }
            },
            template: template
        })
    })
})
