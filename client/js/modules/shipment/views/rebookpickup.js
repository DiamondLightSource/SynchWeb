define(['marionette',
    'models/shipment',
    'collections/dewars',
    'views/table',
    'utils/editable',

    'tpl!templates/shipment/rebookpickup.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, 
        Shipment, Dewars,
        TableView, Editable, template, Backbone) {
    

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        ui: {
            submit: 'button[name=submit]',
            dews: '.DEWARS',
        },

        events: {
            'click @ui.submit': 'rebookPickup',
        },

        templateHelpers: function() {
            var obj = { RETURN: this.getOption('return') }
            _.each(this.shipment.attributes, function(v,k) {
                obj[k] = v
            }, this)

            return obj
        },

        initialize: function(options) {
            this.shipment = options.shipment

            this.dewars = new Dewars()
            this.dewars.queryParams.sid = this.shipment.get('SHIPPINGID')
            this.ready = [this.dewars.fetch()]

            this.shipment.__proto__.validation.DELIVERYAGENT_SHIPPINGDATE.required = true
            this.shipment.__proto__.validation.PHYSICALLOCATION.required = true
            this.shipment.__proto__.validation.READYBYTIME.required = true
            this.shipment.__proto__.validation.CLOSETIME.required = true

            this.setupValidation(this.shipment)
        },

        invalid: function(attr, error) {
            if ($(attr).prop('type') == 'text') $(attr).addClass('ferror')
            else $(attr).addClass('invalid')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            if ($(attr).prop('type') == 'text') $(attr).removeClass('ferror')
            else $(attr).removeClass('invalid')
            $(attr).siblings('span.errormessage').remove()
        },
        
        setupValidation: function(model) {
            Backbone.Validation.bind(this, {
                model: model,
                selector: 'name',
                valid: function(view, attr) {
                    if (attr == 'FCODES[]') return
                    view.valid(view.$el.find('.'+attr))
                },
                invalid: function(view, attr, error) {
                    if (attr == 'FCODES[]') return
                    view.invalid(view.$el.find('.'+attr), error)
                }
            })
        },

        
        onRender: function() {
            var sedit = new Editable({ model: this.shipment, el: this.$el })
            sedit.create('DELIVERYAGENT_SHIPPINGDATE', 'date')
            sedit.create('READYBYTIME', 'time')
            sedit.create('CLOSETIME', 'time')
            sedit.create('PHYSICALLOCATION', 'text')
                
            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            var ds = this.dewars.filter(function(d) { return d.get('DELIVERYAGENT_BARCODE') })
            this.ui.dews.text(ds.map(function(d) { return d.get('CODE') }).join(', '))

        },


        rebookPickup: function() {
            this.ui.submit.prop('disabled', true)
                
            if (!this.shipment.isValid(true)) {
                this.ui.submit.prop('disabled', false)
                return
            }

            this.$el.addClass('loading')
            app.alert({ message: 'Rebooking Pickup, Please Wait...'})

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/pickup/'+this.shipment.get('SHIPPINGID'),
                method: 'POST',
                success: function(resp) {
                    app.alert({ message: 'Pickup Successfully Booked'})
                    setTimeout(function() {
                        app.trigger('shipment:show', self.shipment.get('SHIPPINGID'))
                    }, 1000)

                    self.$el.removeClass('loading')
                },

                error: function(xhr, status, error) {
                    var json;
                    if (xhr.responseText) {
                        try {
                            json = $.parseJSON(xhr.responseText)
                        } catch(err) {

                        }
                    }
                    app.alert({ message: json.message })
                    self.ui.submit.prop('disabled', false)
                    self.$el.removeClass('loading')
                }
            })
        },
        
    })
        
})