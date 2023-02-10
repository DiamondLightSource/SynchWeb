define(['marionette', 'views/form',
    'collections/visits',
    'collections/labcontacts',
    'collections/countries',
    'modules/shipment/collections/dewarhistory',

    'modules/shipment/models/dispatch',
    
    'templates/shipment/dispatch.html',
    'jquery',
    'backbone',
    'backbone-validation',
    
    ], function(Marionette, FormView,
        Visits, LabContacts, Countries, DewarHistory,
        DispatchModel,
        template, $_, Backbone) {

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

   
    var VVisits = Visits.extend({
        valueAttribute: 'VISIT',
    })


    return FormView.extend({
        template: template,
        
        events: {
            'change @ui.lc': 'getlcdetails',    
            'change @ui.exp': 'updateLC',
            'click @ui.useAnotherCourierAccount': 'toggleCourierAccountEditing',
            'click @ui.facc': 'showTerms'
        },
        
        ui: {
            lc: 'select[name=LABCONTACTID]',

            exp: 'select[name=VISIT]',
            lco: 'input[name=LOCALCONTACT]',
            loc: 'input[name=LOCATION]',

            gn: 'input[name=GIVENNAME]',
            fn: 'input[name=FAMILYNAME]',
            addr: 'textarea[name=ADDRESS]',
            country: 'select[name=COUNTRY]',
            em: 'input[name=EMAILADDRESS]',
            ph: 'input[name=PHONENUMBER]',
            lab: 'input[name=LABNAME]',

            facc: 'a.facc',
            accountNumber: 'input[NAME=DELIVERYAGENT_AGENTCODE]',
            courier: 'input[name=DELIVERYAGENT_AGENTNAME]',
            courierDetails: '.courierDetails',
            facilityCourier: '.facilityCourier',
            awbNumber: 'input[name=AWBNUMBER]',
            useAnotherCourierAccount: 'input[name=USE_ANOTHER_COURIER_ACCOUNT]',
            dispatchState: '.dispatch-state'
        },



        templateHelpers: function() {
            return {
                DEWAR: this.getOption('dewar').toJSON(),
                SHIPPING: this.getOption('shipping').toJSON()
            }
        },
        
        createModel: function() {
            this.model = new DispatchModel({ 
                FACILITYCODE: this.getOption('dewar').get('FACILITYCODE'), 
                DEWARID: this.getOption('dewar').get('DEWARID'), 
                LABCONTACTID: this.getOption('dewar').get('LABCONTACTID'),
                VISIT: this.getOption('dewar').get('FIRSTEXPERIMENT'),
                // If no agent specified on inbound, default to diamond dhl
                DELIVERYAGENT_AGENTNAME: this.getOption('shipping').get('DELIVERYAGENT_AGENTNAME') || 'DHL'
            })
        },
        
        success: function() {
            app.trigger('shipment:show', this.getOption('dewar').get('SHIPPINGID'))
        },

        failure: function() {
            app.alert({ message: 'Something went wrong registering this dispatch request, please try again'})
        },
        
        onRender: function() {
            this.date('input[name=DELIVERYAGENT_SHIPPINGDATE]')

            var d = new Date()
            var today = (d.getDate() < 10 ? '0'+d.getDate() : d.getDate()) + '-' + (d.getMonth() < 9 ? '0'+(d.getMonth()+1) : d.getMonth()+1) + '-' + d.getFullYear()
            this.$el.find('input[name=DELIVERYAGENT_SHIPPINGDATE]').val(today)
            this.$el.find('.facilityCourier').hide()
            
            industrial_codes = ['in', 'sw']
            industrial_visit = industrial_codes.includes(app.prop.slice(0,2))
            if (industrial_visit) {
                this.ui.facc.hide()
            }

            if (this.shipping.get('TERMSACCEPTED') == 0) {
                this.ui.courier.val(this.shipping.get('DELIVERYAGENT_AGENTNAME'))
                this.ui.accountNumber.val(this.shipping.get('DELIVERYAGENT_AGENTCODE'))
                if (this.shipping.get('DELIVERYAGENT_AGENTNAME') && this.shipping.get('DELIVERYAGENT_AGENTCODE')) {
                    this.ui.courier.attr('disabled', true)
                    this.ui.accountNumber.attr('disabled', true)
                }
                this.model.courierDetailsRequired = true
            }
            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
        },

        doOnRender: function() {
            this.ui.exp.html(this.visits.opts()).val(this.model.get('VISIT'))
            this.updateLC()
            this.populateCountries()
        },

        populateCountries: function() {
            if (this.countries.length > 0) {
                this.ui.country.html(this.countries.opts())
            }
        },

        initialize: function(options) {
            this.dewar = options.dewar
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()

            var self = this
            this.visits = new VVisits(null, { state: { pageSize: 9999 } })
            this.ready = []
            this.ready.push(this.visits.fetch())

            this.history = new DewarHistory(null, { queryParams: { did: this.getOption('dewar').get('DEWARID') }})
            this.history.fetch().done(function() {
                const history = self.history.at(0)
                const location = history ? history.get('STORAGELOCATION') : null
                const historyComment = history ? history.get('COMMENTS') : null
                const restrictedLocations = ['i03', 'i04', 'i04-1', 'i024']

                if (location) {
                    self.ui.loc.val(location)
                    if (restrictedLocations.includes(location.toLowerCase())) {
                        self.ui.dispatchState.text("Warning: This dewar is still on the beamline. We recommend waiting until the dewar returns to storage before requesting it's return. Dewars are not topped up with LN2 after a return is requested.")
                    } else if (
                        location.startsWith('tray-') &&
                        (!historyComment || (typeof historyComment === 'object' && !historyComment.checked))
                    ) {
                        self.ui.dispatchState.text("Warning: This dewar has not had it's contents checked. We recommend asking your local contact to check the dewar's contents before requesting it's return. Dewars are not topped up with LN2 after a return is requested.")
                    }
                }
            })
            // Shipping option should be a backbone model
            this.shipping = options.shipping

            this.terms = new Terms({ SHIPPINGID: this.shipping.get('SHIPPINGID') })
            this.listenTo(this.terms, 'change:ACCEPTED', this.toggleFacilityCourier)
            this.ready.push(this.terms.fetch())

            this.countries = new Countries()
            this.countries.state.pageSize = 9999
            this.ready.push(this.countries.fetch())
        },

        updateLC: function() {
            var vis = this.visits.findWhere({ VISIT: this.ui.exp.val() })
            if (vis) {
                var lc = vis.get('LC')
                if (lc) { 
                    var lcs = lc.split(',')
                    this.ui.lco.val(lcs[0].trim())
                } else this.ui.lco.val('')
            }

        },

        refreshContacts: function() {
            this.contacts.fetch()
        },
        
        updateContacts: function() {
            this.ui.lc.html(this.contacts.opts()).val(this.getOption('dewar').get('RETURNLABCONTACTID'))
            this.getlcdetails()
        },
        
        getlcdetails: function() {
            var lc = this.contacts.findWhere({ LABCONTACTID: this.ui.lc.val() })
            if (lc) {
                this.ui.gn.val(lc.get('GIVENNAME'))
                this.ui.fn.val(lc.get('FAMILYNAME'))
                this.ui.em.val(lc.get('EMAILADDRESS'))
                this.ui.ph.val(lc.get('PHONENUMBER'))
                this.ui.lab.val(lc.get('LABNAME'))
                this.ui.addr.val([lc.get('ADDRESS'), lc.get('CITY'), lc.get('POSTCODE')].join('\n'))
                this.ui.country.val(lc.get('COUNTRY'))
            }
        },

        showTerms: function() {
            var terms = new TCDialog({ model: this.terms })
            this.listenTo(terms, 'terms:accepted', this.termsAccepted, this)
            if (!this.terms.get('ACCEPTED')) app.dialog.show(terms)
            return false
        },
        
        toggleCourierAccountEditing: function(event) {
            if (event.target.checked) {
                this.ui.courier.attr('disabled', false)
                this.ui.accountNumber.attr('disabled', false)
            } else {
                this.ui.courier.val(this.shipping.get('DELIVERYAGENT_AGENTNAME'))
                this.ui.accountNumber.val(this.shipping.get('DELIVERYAGENT_AGENTCODE'))

                this.ui.courier.attr('disabled', true)
                this.ui.accountNumber.attr('disabled', true)
            }
        },

        toggleFacilityCourier: function() {
            this.ui.facc.hide()
            this.ui.courier.val('DHL')
            this.ui.courierDetails.hide()
            this.ui.facilityCourier.show()
            this.model.courierDetailsRequired = false
        }
    })

})
