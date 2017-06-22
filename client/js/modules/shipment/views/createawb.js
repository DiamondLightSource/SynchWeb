define(['marionette',
    'models/shipment',
    'models/labcontact',
    'collections/dewars',
    'collections/countries',
    'utils/editable',

    'tpl!templates/shipment/createawb.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, 
        Shipment, LabContact, Dewars, Countries,
        Editable, template, Backbone) {
    
    
    /*
     T&C Dialog
    */
    var Terms = Backbone.Model.extend({
        idAttribute: 'SHIPPINGID',
        urlRoot: '/shipment/terms',
    })
            
    var TCDialog = DialogView.extend({
        template: _.template('<%=TERMS%>'),
        title: 'Terms & Conditions',
        buttons: {
            'Accept': 'accept',
            'Cancel': 'closeDialog',
        },
        
        accept: function() {
            var self = this
            this.model.set({ ACCEPTED: 1 })
            this.model.save(this.model.changedAttributes(), {
                patch: true,
                success: function() {
                    self.closeDialog()
                }
            })
        },
    })


    var AWBModel = Backbone.Model.extend({
        validation: {
            DECLAREDVALUE: {
                required: true,
                pattern: 'number'
            },

            DESCRIPTION: {
                required: true,
                pattern: 'wwsdash',
            }
        }
    })


    var DewarView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<label><input type="checkbox" /> <% if (FACILITYCODE) { %><%=FACILITYCODE%><% } else { %><%=CODE%>%><% } %></label>'),
        events: {
            'click @ui.sel': 'select',
        },

        ui: {
            sel: 'input[type=checkbox]',
        },

        select: function(e) {
            this.model.set('isSelected', this.ui.sel.is(':checked'))
        }
    })

    var DewarsView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: DewarView
    })


    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rdew: '.DEWARS',
        },

        ui: {
            DESCRIPTION: 'input[name=DESCRIPTION]',
            DECLAREDVALUE: 'input[name=DECLAREDVALUE]',

            facc: 'a.facc',
            uacc: 'li.uacc',
            free: '.free',
            weight: '.WEIGHT',
            acc_msg: '.acc_msg',
            submit: '.submit',
        },

        events: {
            'click @ui.facc': 'showTerms',
            'click button.submit': 'createAWB',
            'change input':  'validateField',
            'blur input':  'validateField',
            'keyup input':  'validateField',
        },

        templateHelpers: function() {
            var obj = { RETURN: this.getOption('return') }
            _.each(this.shipment.attributes, function(v,k) {
                obj[k] = v
            }, this)

            return obj
        },

        _lcFields: ['PHONENUMBER', 'EMAILADDRESS', 'LABNAME', 'ADDRESS', 'CITY', 'POSTCODE','COUNTRY', 'GIVENNAME', 'FAMILYNAME'],

        toggleFacilityCourier: function() {
            if (app.options.get('facility_courier_countries').indexOf(this.lc.get('COUNTRY')) > -1) {
                if (this.terms.get('ACCEPTED')) {
                    this.$el.find('.DELIVERYAGENT_AGENTCODE').hide()
                    this.ui.acc_msg.text('Paid for by Facility')
                    this.ui.facc.hide()
                } else {
                    this.ui.facc.show()
                }
            } else this.ui.facc.hide()
        },

        updateWeight: function() {
            var sel = new Backbone.Collection(this.dewars.where({ isSelected: true }))
            this.ui.weight.text(sel.reduce(function(n,m) { return n + parseFloat(m.get('WEIGHT')) },0))
        },

        initialize: function(options) {
            this.shipment = options.shipment

            this.lc = new LabContact({ LABCONTACTID: this.shipment.get(this.getOption('return') ? 'RETURNLABCONTACTID' : 'SENDINGLABCONTACTID')})
            this.listenTo(this.lc, 'change:COUNTRY', this.toggleFacilityCourier)

            this.ready = []
            this.ready.push(this.lc.fetch())

            this.terms = new Terms({ SHIPPINGID: this.shipment.get('SHIPPINGID') })
            this.listenTo(this.terms, 'change:ACCEPTED', this.toggleFacilityCourier)
            this.ready.push(this.terms.fetch())

            this.dewars = new Dewars()
            this.listenTo(this.dewars, 'change:isSelected', this.updateWeight)
            this.dewars.queryParams.sid = this.shipment.get('SHIPPINGID')
            this.ready.push(this.dewars.fetch())

            this.countries = new Countries()
            this.countries.state.pageSize = 9999
            this.ready.push(this.countries.fetch())

            this.shipment.__proto__.validation.DELIVERYAGENT_SHIPPINGDATE.required = true
            this.shipment.__proto__.validation.PHYSICALLOCATION.required = true
            this.shipment.__proto__.validation.READYBYTIME.required = true
            this.shipment.__proto__.validation.CLOSETIME.required = true

            this.lc.__proto__.validation.EMAILADDRESS.required = true

            this.awb = new AWBModel()

            this.setupValidation(this.shipment)
            console.log(this.shipment)
            this.setupValidation(this.lc)
            console.log(this.lc)

            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
                model: this.awb,
                selector: 'name',
                valid: function(view, attr) {
                    view.valid(view.$el.find('[name="'+attr+'"]'))
                },
                invalid: function(view, attr, error) {
                    view.invalid(view.$el.find('[name="'+attr+'"]'), error)
                }
            })
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
        
        validateField: function(e) {
            var attr = this.$el.find(e.target).attr('name')
            var val = this.$el.find(e.target).val()
            var data = {}
                data[attr] = val
            this.awb.set(data, { silent: true })
            var error = this.awb.preValidate(attr, val)
            if (error) this.invalid(e.target, error)
            else this.valid(e.target)
        },

        
        onRender: function() {
            this.ui.facc.hide()

            if (app.options.get('facility_courier_countries').length) this.ui.free.text('[Free For: '+app.options.get('facility_courier_countries').join(', ')+']')
            this.ui.DESCRIPTION.val(app.options.get('package_description'))

            

            var sedit = new Editable({ model: this.shipment, el: this.$el })
            sedit.create('DELIVERYAGENT_AGENTCODE', 'text')
            sedit.create('DELIVERYAGENT_SHIPPINGDATE', 'date')
            sedit.create('READYBYTIME', 'time')
            sedit.create('CLOSETIME', 'time')
            sedit.create('PHYSICALLOCATION', 'text')

            this.awb.set({
                DECLAREDVALUE: this.ui.DECLAREDVALUE.val(),
                DESCRIPTION: this.ui.DESCRIPTION.val(),
            })

            this.rdew.show(new DewarsView({ collection: this.dewars }))
            this.updateWeight()

            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            this.populateLC()

            var cedit = new Editable({ model: this.lc, el: this.$el })
            _.each(this._lcFields, function(a) {
                if (a == 'COUNTRY') return
                cedit.create(a, a == 'ADDRESS'? 'textarea' : 'text')
            }, this)
            cedit.create('COUNTRY', 'select', { data: this.countries.kv() });
        },

        checkAvailability: function() {
            if (this.shipment.get('DELIVERYAGENT_AGENTNAME').toLowerCase() != 'dhl' && !(app.options.get('facility_courier_countries').indexOf(this.lc.get('COUNTRY')) > -1))
                app.message({ title: 'Service Not Available', message: 'This service is only available for shipments from '+app.options.get('facility_courier_countries').join(',')+', or for user with DHL accounts. Please either update your labcontact or the shipment courier'})
        },

        populateLC: function() {            
            this.checkAvailability()
            this.toggleFacilityCourier()

            _.each(this._lcFields, function(a) {
                if (this.lc.get(a)) this.$el.find('.'+a).text(this.lc.get(a))
            }, this)
        },

        showTerms: function() {
            var terms = new TCDialog({ model: this.terms })
            this.listenTo(terms, 'terms:accepted', this.termsAccepted, this)
            if (!this.terms.get('ACCEPTED')) app.dialog.show(terms)
        },   


        createAWB: function() {
            this.ui.submit.prop('disabled', true)
            var sel = this.dewars.where({ isSelected: true })
            var ids = (new Backbone.Collection(sel)).pluck('DEWARID')
            
            if (!ids.length) {
                app.alert({ message: 'You must select at least one dewar to ship' })
                this.ui.submit.prop('disabled', false)
                return
            }

            var valid = true
            if (!this.lc.isValid(true)) valid = false
            if (!this.shipment.isValid(true)) valid = false
            if (!this.awb.isValid(true)) valid = false

            if (!valid) {
                this.ui.submit.prop('disabled', false)
                return
            }

            this.$el.addClass('loading')
            app.alert({ message: 'Creating Airway Bill and Booking Pickup, Please Wait...'})

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/awb/'+this.shipment.get('SHIPPINGID'),
                method: 'POST',
                data: {
                    DEWARS: ids,
                    DECLAREDVALUE: this.ui.DECLAREDVALUE.val(),
                    DESCRIPTION: this.ui.DESCRIPTION.val()
                },
                success: function(resp) {
                    app.alert({ message: 'Airway Bill Successfully Created'})
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