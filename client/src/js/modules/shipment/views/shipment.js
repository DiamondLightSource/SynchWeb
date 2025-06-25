define(['marionette',
    
    'models/dewar',
    'collections/dewars',
    'collections/labcontacts',
    'modules/shipment/views/dewars',
    'collections/containers',
    'modules/shipment/views/dewarcontent',
    'modules/shipment/collections/dewarhistory',
    'modules/shipment/views/dewarhistory',

    'modules/shipment/collections/dhl-tracking',
    'modules/shipment/views/dewartracking',

    
    'utils/editable',
    'utils',
    'templates/shipment/shipment.html',
    
    'backbone', 'backbone-validation'], function(Marionette,
        Dewar,
        Dewars,
        LabContacts,
        DewarsView,
        Containers,
        DewarContentView,
        DewarHistory,
        DewarHistoryView,
        DewarTracking,
        DewarTrackingView,
        
        Editable, utils, template,
        Backbone){

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { table: '.table', history: '.history', cont: '.dcontent', rtracking: '.tracking' },
        //modelEvents: { 'change': 'render' },
        
        templateHelpers: function() {
            return {
                APIURL: app.apiurl,
                PROP: app.prop,
            }
        },

        events: {
            'click #add_dewar': 'addDewar',
            'click a.send': 'sendShipment',
            'click a.pdf': utils.signHandler,
            'click a.cancel_pickup': 'cancelPickup',
        },

        ui: {
            add_dewar: '#add_dewar',
            longwavelength: '.longwavelength',
            sent: '.sent',
            booking: '.booking',
            dhlmessage: '.dhlmessage',
            buttons: '.buttons',
        },


        cancelPickup: function(e) {
            e.preventDefault()

            utils.confirm({
                title: 'Cancel Pickup',
                content: 'Are you sure you want to cancel this pickup? This cannot be undone',
                callback: this.doCancelPickup.bind(this)
            })

        },

        doCancelPickup: function() {
            var self = this

            Backbone.ajax({
                type: 'DELETE',
                url: app.apiurl+'/shipment/pickup/cancel/'+this.model.get('SHIPPINGID'),
                success: function() {
                    self.model.set('DELIVERYAGENT_PICKUPCONFIRMATION', null)
                    self.render()
                    app.alert({ message: 'Pickup Cancelled' })
                },

                error: function(xhr, status, error) {
                    var json;
                    if (xhr.responseText) {
                        try {
                            json = $.parseJSON(xhr.responseText)
                        } catch(err) {
                            console.error("Error parsing response:", err)
                        }
                    }
                    app.alert({ message: json.message })
                }
            })
        },

        sendShipment: function(e) {
            e.preventDefault()
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/send/'+this.model.get('SHIPPINGID'),
                success: function() {
                    self.model.set({ SHIPPINGSTATUS: 'send to DLS' })
                    app.alert({ className: 'message notify', message: 'Shipment successfully marked as sent' })
                    self.render()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong sending this shipment, please try again' })
                },
                
            })
        },
        
        
        addDewar: function(e) {
            e.preventDefault()
            this.dewars.add(new Dewar({
                SHIPPINGID: this.model.get('SHIPPINGID'),
                new: true
            }))
        },
        
        initialize: function(options) {
            this.lastDewarID = null
            Backbone.Validation.bind(this);
            
            this.dewarcontent = new Containers()
            this.dewarcontent.setSorting('NAME')
            this.dewarhistory = new DewarHistory()
            this.dewartracking = new DewarTracking()
            this.dewars = new Dewars(null, { id: this.model.get('SHIPPINGID') })
            this.fetchDewars()
            
            this.listenTo(app, 'shipment:showdewar', this.showDewar)
        },
        
        fetchDewars: function(refresh) {
            var self = this
            this.dewars.fetch().done(function() {
                console.log('dewars fetch', self.dewars)
                if (self.dewars.length) self.showDewar(self.dewars.at(0).get('DEWARID'), refresh)
                if (refresh) self.table.currentView.render()
            })
        },
        
        showDewar: function(did, force) {
            if (did == this.lastDewarID && !force) return
            this.$el.find('.dewar_name').text(this.dewars.findWhere({ DEWARID: did }).get('CODE'))
            this.dewarcontent.dewarID = did
            this.dewarcontent.fetch()
            this.dewarhistory.id = did
            this.dewarhistory.fetch()

            var d = this.dewars.findWhere({ DEWARID: did })
            if (d && (d.get('TRACKINGNUMBERTOSYNCHROTRON') || d.get('TRACKINGNUMBERFROMSYNCHROTRON'))) {
                this.dewartracking.queryParams.DEWARID = did
                this.dewartracking.fetch()

            } else {
                this.dewartracking.ORIGIN = 'N/A'
                this.dewartracking.DESTINATION = 'N/A'
                this.dewartracking.reset()
            }
            this.lastDewarID = did
        },

        refreshDewar: function() {
            this.fetchDewars(true)
        },

        updateGUI: function() {
            this.updateCountryFromLabContact()
            this.showButtons()
            this.showBooking()
            this.showDhlMessage()
            this.updateDynamic()
        },

        updateCountryFromLabContact: function() {
            const sendingId = this.model.get('SENDINGLABCONTACTID')
            if (!sendingId || !this.contacts || !this.contacts.length) return
            const contact = this.contacts.findWhere({ LABCONTACTID: sendingId })
            if (contact) this.model.set('COUNTRY', contact.get('COUNTRY'))
        },

        showButtons: function() {
            if (this.model.get('LCOUT') && this.model.get('SAFETYLEVEL')) {
                this.ui.buttons.show()
            } else {
                this.ui.buttons.hide()
            }
            const status = this.model.get('SHIPPINGSTATUS')
            const proc = this.model.get('PROCESSING')
            if ((status === 'opened' || status === 'awb created' || status === 'pickup booked') && proc == 0) {
                this.ui.sent.html('<a class="button send" href="#"><i class="fa fa-plane"></i> Mark as Sent</a>')
            }
        },

        showBooking: function() {
            const courier = this.model.get('DELIVERYAGENT_AGENTNAME')
            const label = this.model.get('DELIVERYAGENT_HAS_LABEL')
            const pickup = this.model.get('DELIVERYAGENT_PICKUPCONFIRMATION')
            const country = this.model.get('COUNTRY')
            const fac_country = app.options.get('facility_courier_countries')
            const ss_url = app.options.get("shipping_service_app_url_incoming")
            const safetylevel = this.model.get('SAFETYLEVEL')
            const externalid = this.model.get('EXTERNALSHIPPINGIDTOSYNCHROTRON')
            const shippingid = this.model.get('SHIPPINGID')
            if (!courier || (app.options.get('dhl_enable') && courier.toLowerCase().trim() == 'dhl')) {
                if (label == '1') {
                    this.ui.booking.html('<a class="button pdf" href="'+app.apiurl+'/pdf/awb/sid/'+shippingid+'"><i class="fa fa-print"></i> Print Air Waybill</a>')
                    //this.ui.booking.append('<a class="button cancel" href="#"><i class="fa fa-truck"></i> Cancel Pickup</a>')
                    if (!pickup) {
                        this.ui.booking.append('<a class="button awb" href="/shipments/pickup/sid/'+shippingid+'"><i class="fa fa-truck"></i> Rebook Pickup</a>')
                    }
                } else if ((country && !fac_country.includes(country)) || safetylevel == "Red") {
                    this.ui.booking.html('<a class="button" href="#"><i class="fa fa-credit-card"></i> Create Air Waybill - Disabled</a>')
                } else if (externalid && ss_url) {
                    const link = ss_url+'/shipment-requests/'+externalid+'/incoming'
                    this.ui.booking.html('<a class="button shipping-service" href="'+link+'"><i class="fa fa-print"></i> Manage shipment booking</a>')
                } else {
                    this.ui.booking.html('<a class="button awb" href="/shipments/awb/sid/'+shippingid+'"><i class="fa fa-credit-card"></i> Create DHL Air Waybill</a>')
                }
            } else {
                this.ui.booking.html('')
            }
        },

        showDhlMessage: function() {
            if (app.options.get('dhl_enable')) {
                const label = this.model.get('DELIVERYAGENT_HAS_LABEL')
                const safetylevel = this.model.get('SAFETYLEVEL')
                const country = this.model.get('COUNTRY')
                const courier = this.model.get('DELIVERYAGENT_AGENTNAME')
                const lcout = this.model.get('LCOUT')
                const fac_country_nde = app.options.get('facility_courier_countries_nde')
                const fac_country_link = app.options.get('facility_courier_countries_link')
                const fac_country = app.options.get('facility_courier_countries')
                if (!lcout || !safetylevel) {
                    this.ui.dhlmessage.html('<p class="message notify">Set an Outgoing Lab Contact and Safety Level in order to manage shipping.</p>')
                } else if (label == '1') {
                    this.ui.dhlmessage.html('<p class="message notify">You can print your Air Waybill by clicking &quot;Print Air Waybill&quot; below.</p>')
                } else if (safetylevel && safetylevel == "Red") {
                    this.ui.dhlmessage.html('<p class="message alert">Shipping of red samples is not available through this application.</p>')
                } else if (country && fac_country_nde.includes(country) ) {
                    this.ui.dhlmessage.html('<p class="message alert">International shipping is not available through this application. If you&apos;re arranging your own shipping (e.g. industrial users), enter your tracking numbers below after booking and include printed return labels in the dewar case. European academic users, please see <a href="'+fac_country_link+'">here</a>.</p>')
                } else if (country && !fac_country.includes(country) ) {
                    this.ui.dhlmessage.html('<p class="message alert">International shipping is not available through this application. If you&apos;re arranging your own shipping, enter your tracking numbers below after booking and include printed return labels in the dewar case.</p>')
                } else if (courier && courier.toLowerCase().trim() != 'dhl') {
                    this.ui.dhlmessage.html('<p class="message alert">Shipping through this application is only available using DHL.</p>')
                } else {
                    this.ui.dhlmessage.html('<p class="message notify">You can now book your shipment with DHL using &quot;Create Air Waybill&quot; below.</p>')
                }
            }
        },

        updateDynamic: function(){
            dynamic = this.model.get('DYNAMIC')
            dynamicSelectedValues = [true, 'Yes', 'yes', 'Y', 'y']
            if (!dynamicSelectedValues.includes(dynamic)) {
                this.$el.find(".remoteormailin").hide()
                this.$el.find(".remoteform").hide()
                this.ui.longwavelength.hide()
            } else {
                industrial_codes = ['in', 'sw']
                industrial_visit = industrial_codes.includes(app.prop.slice(0,2))
                if (industrial_visit) {
                    this.$el.find(".remoteormailin").show()
                }
                this.ui.longwavelength.show()
                if (this.model.get('LONGWAVELENGTH') === 'Yes') {
                    this.$el.find(".remoteform").hide()
                } else {
                    this.$el.find(".remoteform").show()
                }
            }
        },

        onRender: function() {
            if (app.proposal && app.proposal.get('ACTIVE') != '1') this.ui.add_dewar.hide()

            this.table.show(new DewarsView({ collection: this.dewars }))
            this.cont.show(new DewarContentView({ collection: this.dewarcontent }))
            this.history.show(new DewarHistoryView({ collection: this.dewarhistory }))
            this.rtracking.show(new DewarTrackingView({ collection: this.dewartracking }))
            
            this.listenTo(this.cont.currentView, 'refresh:dewars', this.refreshDewar, this)
            
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('SHIPPINGNAME', 'textlong')
            edit.create('SAFETYLEVEL', 'select', { data: {'Green': 'Green', 'Yellow':'Yellow', 'Red': 'Red'}, alert: true, revert: true })
            edit.create('COMMENTS', 'textarea')
            edit.create('DELIVERYAGENT_AGENTNAME', 'text')
            edit.create('DELIVERYAGENT_AGENTCODE', 'text')
            edit.create('DELIVERYAGENT_SHIPPINGDATE', 'date')
            edit.create('DELIVERYAGENT_DELIVERYDATE', 'date')
            edit.create('DELIVERYAGENT_FLIGHTCODE', 'text')
            edit.create('PHYSICALLOCATION', 'text')
            edit.create('READYBYTIME', 'time')
            edit.create('CLOSETIME', 'time')


            edit.create("ENCLOSEDHARDDRIVE", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("ENCLOSEDTOOLS", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("DYNAMIC", 'select', { data: {
                'No': 'I have a session already scheduled',
                'UDC': 'I am sending pucks for Unattended Data Collection',
                'Imaging': 'I am sending plates for imaging',
                'Yes': 'I would like a session to be scheduled',
                'Other': 'Something else',
            }})
            industrial_codes = ['in', 'sw']
            industrial_visit = industrial_codes.includes(app.prop.slice(0,2))
            if (!industrial_visit) {
                this.$el.find(".remoteormailin").hide()
            } else {
                edit.create("REMOTEORMAILIN", 'select', { data: {'Remote': 'Remote', 'Mail-in': 'Mail-in', 'Other': 'Other'}})
            }

            edit.create("LONGWAVELENGTH", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("SESSIONLENGTH", 'text')
            edit.create("ENERGY", 'text')
            edit.create("MICROFOCUSBEAM", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("SCHEDULINGRESTRICTIONS", 'text')
            edit.create("LASTMINUTEBEAMTIME", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("DEWARGROUPING", 'select', { data: {'Yes': 'Yes', 'No': 'No', 'Don\'t mind': 'Don\'t mind'}})
            edit.create("EXTRASUPPORTREQUIREMENT", 'text');
            edit.create("MULTIAXISGONIOMETRY", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})

            this.updateGUI()
            this.listenTo(this.model, "change", this.updateGUI)

            
            var self = this
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.contacts.fetch().done(function() {
                console.log(self.contacts, self.contacts.kv())
                edit.create('SENDINGLABCONTACTID', 'select', { data: self.contacts.kv() })
                edit.create('RETURNLABCONTACTID', 'select', { data: self.contacts.kv() })
            })
        },
        
    })


})
