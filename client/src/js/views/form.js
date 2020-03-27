define(['marionette', 'backbone',
        'jquery',
    
        'utils/forms',
        'utils/validation',
    
        'vendor/backbone/backbone.syphon'
    
    ], function(Marionette, Backbone, $, forms) {

    /*
     Basic handler for generating HTML Forms
     - Uses model based validation
     - Provides various form helpers
     
    */
    return FormView = Marionette.LayoutView.extend(_.extend({}, forms, {
        className: 'content',
        setupOnConstruct: true,
        
        _baseUI: function() {
            return {
                submit: '[type=submit]',
            }
        },
        
        _baseEvents: function() {
            return {
                'change form input':  'validateField',
                'change form select':  'validateField',
                'change form textarea': 'validateField',
                'blur form input':  'validateField',
                'blur form select':  'validateField',
                'blur form textarea':   'validateField',
                'keyup form input':  'validateField',
                'keyup form select':  'validateField',
                'keyup form textarea':  'validateField',
                'click @ui.submit': 'onSubmit',
            }
        },
        
        delegateEvents: function(events) {
            this.ui = _.extend(this._baseUI(), _.result(this, 'ui'));
            this.events = _.extend(this._baseEvents(), _.result(this, 'events'));
            return FormView.__super__.delegateEvents.call(this, events);
        },
        
        constructor: function(options) {
            FormView.__super__.constructor.call(this, options)
            console.log('setup validation', this)
            if (this.getOption('setupOnConstruct')) this.setupValidation()
        },
        
        validateField: function(e) {
            var attr = $(e.target).attr('name')
            // pre validate file fields
            var val = e.target.files ? e.target.files[0] : $(e.target).val()
            
            if (this.getOption('storeOnValidate')) {
                var data = {}
                data[attr] = val
                this.model.set(data, { silent: true })
            }
            
            var error = this.model.preValidate(attr, val)
            if (error) this.invalid(e.target, error)
            else this.valid(e.target)
        },
        
        
        invalid: function(attr, error) {
            $(attr).removeClass('fvalid').addClass('ferror')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            $(attr).removeClass('ferror').addClass('fvalid').siblings('span.errormessage').remove()
        },
        
        setupValidation: function() {
            console.log('setup val')
            this.createModel()
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
                selector: 'name',
                valid: function(view, attr) {
                  view.valid(view.$el.find('[name="'+attr+'"]'))
                },
                invalid: function(view, attr, error) {
                  view.invalid(view.$el.find('[name="'+attr+'"]'), error)
                }
            })
        },
        
        
        createModel: function() {
            throw new Error('implement #createModel in your FormView subclass')
        },
        
        success: function(model, response, options) {
            throw new Error('implement #success in your FormView subclass')
        },
        
        failure: function(model, response, options) {
            console.log('failure', model, response)
            throw new Error('implement #failure in your FormView subclass')
        },
        
        onSubmit: function(e) {
            if ($(e.target).closest('.editable').length) return

            e.preventDefault()
            var data = Backbone.Syphon.serialize(this)
            this.model.set(data)
            if (this.prepareModel) this.prepareModel.call(this)
            this.model.validate()
            var valid = this.model.isValid(true);
            app.log('submitted', valid, this.model)
            
            if (valid) {
                var self = this
                this.$el.find('form').addClass('loading')
                if (this.beforeSave) this.beforeSave.call(this)
                this.ui.submit.prop('disabled', true)
                this.model.save({}, {
                    success: function(model, response, options) {
                        self.$el.find('form').removeClass('loading')
                        self.ui.submit.prop('disabled', false)
                        self.success(model, response, options)
                    },
                    error: function(model, response, options) {
                        self.$el.find('form').removeClass('loading')
                        self.ui.submit.prop('disabled', false)
                        self.failure(model, response, options)
                    }
                })
            }
        },
        
    }))

})