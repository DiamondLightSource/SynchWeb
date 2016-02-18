define(['marionette', 'backbone', 'vendor/backbone/backbone.syphon'], function(Marionette, Backbone) {

    // A Validated Grid Row
    return ValidatedRow = Backbone.Marionette.ItemView.extend({
        tagName: 'tr',
            
        _baseEvents: {
            'change td > input':  'validateField',
            'change td > select':  'validateField',
            'change td > textarea': 'validateField',
            'blur td > input':  'validateField',
            'blur td > select':  'validateField',
            'blur td > textarea':   'validateField',
            'keyup td > input':  'validateField',
            'keyup td > select':  'validateField',
            'keyup td > textarea':  'validateField',
            'click a.save': 'onSubmit'
            },
            
        delegateEvents: function(events) {
            this.events = _.extend(this._baseEvents, this.events);
            return ValidatedRow.__super__.delegateEvents.call(this, events);
        },
            
        validateField: function(e) {
            // Dont validate if we're in editable mode
            if ($(e.target).closest('.editable').length) return
                
            var attr = $(e.target).attr('name')
            var val = $(e.target).val()
            
            this.model.set(attr,val)
            var error = this.model.preValidate(attr, val)
            if (error) $(e.target).addClass('ferror')
            else $(e.target).removeClass('ferror')
        },
            
        initialize: function(options) {
            Backbone.Validation.bind(this, {
                selector: 'name',
                valid: function(view, attr) {
                    view.$el.find('[name='+attr+']').removeClass('ferror')
                },
                invalid: function(view, attr, error) {
                    view.$el.find('[name='+attr+']').addClass('ferror')
                }
            })
        },
        
        setData: function() {
            throw new Error('implement #setData in your ValidatedRow subclass')
        },
        
        onSubmit: function(e) {
            e.preventDefault()
            this.setData()
            var valid = this.model.isValid(true);
            app.log('submitted', valid, this.model)
            
            if (valid) {
                var self = this
                this.$el.addClass('loading')
                this.model.save({}, {
                    success: function(model, response, options) {
                        self.$el.removeClass('loading')
                        self.success(model, response, options)
                    },
                    error: function(model, response, options) {
                        self.$el.removeClass('loading')
                        self.failure(model, response, options)
                    }
                })
            }
        },
    })

})