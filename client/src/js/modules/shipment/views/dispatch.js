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
            'click @ui.facc': 'showTerms',
            'blur @ui.postCode': 'stripPostCode',
            'blur @ui.addr': 'formatAddress',
            'change @ui.country': 'showDispatchForm',
        },

        ui: {
            lc: 'select[name=LABCONTACTID]',

            exp: 'select[name=VISIT]',
            lco: 'input[name=LOCALCONTACT]',
            loc: 'input[name=LOCATION]',

            gn: 'input[name=GIVENNAME]',
            fn: 'input[name=FAMILYNAME]',
            addr: 'textarea[name=ADDRESS]',
            city: 'input[name=CITY]',
            postCode: 'input[name=POSTCODE]',
            country: 'select[name=COUNTRY]',
            em: 'input[name=EMAILADDRESS]',
            ph: 'input[name=PHONENUMBER]',
            lab: 'input[name=LABNAME]',

            submit: 'button[name=submit]',
            shippingadvice: '.shippingadvice',

            facc: 'a.facc',
            accountNumber: 'input[NAME=DELIVERYAGENT_AGENTCODE]',
            courier: 'input[name=DELIVERYAGENT_AGENTNAME]',
            courierDetails: '.courierDetails',
            dispatchDetails: '.dispatchDetails',
            facilityCourier: '.facilityCourier',
            awbNumber: 'input[name=AWBNUMBER]',
            useAnotherCourierAccount: 'input[name=USE_ANOTHER_COURIER_ACCOUNT]',
            dispatchState: '.dispatch-state',

            courierSection: '.courierSection'
        },

        labContactCountry : null,
        dispatchCountry: null,

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
                UDCVISIT: this.getOption('dewar').get('UDCFIRSTEXPERIMENT'),
                // If no agent specified on inbound, default to diamond dhl
                DELIVERYAGENT_AGENTNAME: this.getOption('shipping').get('DELIVERYAGENT_AGENTNAME') || 'DHL'
            })
        },

        success: function() {
            if (
                app.options.get("shipping_service_app_url")
                && (Number(this.terms.get('ACCEPTED')) === 1) // terms.ACCEPTED could be undefined, 1, or "1"
                && app.options.get("facility_courier_countries").includes(this.dispatchCountry)
            ) {
                this.getOption('dewar').fetch().done((dewar) => {
                    const external_id = dewar.EXTERNALSHIPPINGIDFROMSYNCHROTRON;
                    if (external_id === null){
                        app.alert({message: "Error performing redirect: external shipping id is null"})
                        return;
                    }
                    window.location.assign(
                        `${app.options.get("shipping_service_app_url")}/shipment-requests/${external_id}/outgoing`
                    )
                })
            } else {
                app.trigger('shipment:show', this.getOption('dewar').get('SHIPPINGID'))
            }
        },

        failure: function(_model, response, _options) {
            app.alert({
                message: `Something went wrong registering this dispatch request, please try again<br/>
                          Detail: ${response.responseJSON.message}`,
                persist: true
            })
        },

        onRender: function() {
            this.date('input[name=DELIVERYAGENT_SHIPPINGDATE]')
            this.$el.hide()

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
            let visit = this.model.get('VISIT') || this.model.get('UDCVISIT')
            this.ui.exp.html(this.visits.opts()).val(visit)
            this.updateLC()
            this.populateCountries()
            this.stripPostCode()
            this.formatAddress()
            this.$el.show()
            this.showDispatchForm();
        },

        populateCountries: function() {
            if (this.countries.length > 0) {
                this.ui.country.html(this.countries.opts())
            }
            this.ui.country.val(this.labContactCountry)
        },

        initialize: function(options) {
            this.dewar = options.dewar
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()

            var self = this
            this.visits = new VVisits(null, { state: { pageSize: 9999 } })
            this.visits.queryParams.notnull = 1
            this.ready = []
            this.ready.push(this.visits.fetch())

            this.history = new DewarHistory(null, { queryParams: { did: this.getOption('dewar').get('DEWARID') }})
            this.history.fetch().done(function() {
                const history = self.history.at(0)
                const location = history ? history.get('STORAGELOCATION') : null
                const historyComment = history ? history.get('COMMENTS') : null
                const restrictedLocations = ['i03', 'i04', 'i04-1', 'i24']

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
                this.ui.addr.val(lc.get('ADDRESS'))
                this.ui.city.val(lc.get('CITY'))
                this.ui.postCode.val(lc.get('POSTCODE'))
                this.labContactCountry = lc.get('COUNTRY')
                this.ui.country.val(this.labContactCountry)
                this.checkPostCodeRequired()
            }
        },

        showDispatchForm: function() {
            this.checkPostCodeRequired()
            this.dispatchCountry = this.ui.country.val()
            this.ui.courierSection.show();
            this.ui.dispatchDetails.show();
            this.enableValidation()
            this.ui.submit.show();
            if (
                this.terms.get("ACCEPTED") ||
                !app.options.get("facility_courier_countries").includes(this.dispatchCountry)
            ) {
                this.ui.facc.hide()
            } else {
                this.ui.facc.show()
            }
            if (
                this.terms.get("ACCEPTED")
                && app.options.get("shipping_service_app_url")
                && app.options.get("facility_courier_countries").includes(this.dispatchCountry)
            ){
                this.disableValidation()
                this.ui.dispatchDetails.hide()
                this.ui.submit.text("Proceed")
                this.ui.shippingadvice.html("<mark>On clicking 'Proceed' you will be redirected to the new Diamond shipping service to book the shipment. Please ensure all stages of the form are completed.</mark><br /><br />")
            } else {
                this.ui.submit.text("Request Dewar Dispatch")
                this.ui.shippingadvice.html("")
            }
        },

        enableValidation: function() {
            this.model.visitRequired = true
            this.model.dispatchDetailsRequired = true
            this.model.validation.LOCATION.pattern = 'wwsdash'
            this.model.validation.GIVENNAME.pattern = 'wwsdash'
            this.model.validation.FAMILYNAME.pattern = 'wwsdash'
            this.model.validation.LABNAME.pattern = 'wwsdash'
            this.model.validation.DELIVERYAGENT_AGENTNAME.pattern = 'wwsdash'
            this.model.validation.DELIVERYAGENT_SHIPPINGDATE.pattern = 'edate'
            this.model.validation.EMAILADDRESS.pattern = 'email'
            this.model.validation.AWBNUMBER.pattern = 'word'
            this.model.validation.VISIT.pattern = 'visit'
        },

        disableValidation: function() {
            this.model.visitRequired = false
            this.model.dispatchDetailsRequired = false
            this.model.validation.LOCATION.pattern = ''
            this.model.validation.GIVENNAME.pattern = ''
            this.model.validation.FAMILYNAME.pattern = ''
            this.model.validation.LABNAME.pattern = ''
            this.model.validation.DELIVERYAGENT_AGENTNAME.pattern = ''
            this.model.validation.DELIVERYAGENT_SHIPPINGDATE.pattern = ''
            this.model.validation.EMAILADDRESS.pattern = ''
            this.model.validation.AWBNUMBER.pattern = ''
            this.model.validation.VISIT.pattern = ''
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
            if (
                app.options.get("shipping_service_app_url")
                && app.options.get("facility_courier_countries").includes(this.ui.country.val())
            ){
                this.disableValidation()
                this.ui.dispatchDetails.hide()
                this.ui.submit.text("Proceed")
                this.ui.shippingadvice.html("<mark>On clicking 'Proceed' you will be redirected to the new Diamond shipping service to book the shipment. Please ensure all stages of the form are completed.</mark><br /><br />")
            }
        },

        checkPostCodeRequired: function() {
            if (this.ui.country.val() === "United Kingdom"){
                this.model.postCodeRequired = true
            } else {
                this.model.postCodeRequired = false
            }
        },

        stripPostCode: function() {
            this.ui.postCode.val(this.ui.postCode.val().trim())
        },

        formatAddress: function() {
            // Remove duplicate new lines and whitespace or commas before/after each line
            this.ui.addr.val(this.ui.addr.val().replace(/([,\s]*\n[,\s]*)+/g, "\n").trim())
        }
    })

})
