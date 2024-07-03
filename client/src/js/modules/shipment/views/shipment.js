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
                DHL_ENABLE: app.options.get('dhl_enable'),
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
            if (app.proposal && app.proposal.get('ACTIVE') == '1') {
                if (app.type == "xpdf"){
                    this.$el.find('.add_container').html('<a class="button" data-testid="shipment-add-container" href="/containers/add/did/'+did+'"><i class="fa fa-plus"></i> Add Puck</a>')
                    this.$el.find('.add-container-small').prop('title', 'Click to add a puck')
                    this.$el.find('.add-container-text').text('Add Puck')
                } else {
                    this.$el.find('.add_container').html('<a class="button" data-testid="shipment-add-container" href="/containers/add/did/'+did+'"><i class="fa fa-plus"></i> Add Container</a>')
                }
            }
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

        updateDynamic: function(){
            dynamic = this.model.get('DYNAMIC')
            dynamicSelectedValues = [true, 'Yes', 'yes', 'Y', 'y']
            if (!dynamicSelectedValues.includes(dynamic)) {
                this.$el.find(".remoteormailin").hide()
                this.$el.find(".remoteform").hide()
            } else {
                industrial_codes = ['in', 'sw']
                industrial_visit = industrial_codes.includes(app.prop.slice(0,2))
                if (industrial_visit) {
                    this.$el.find(".remoteormailin").show()
                }
                this.$el.find(".remoteform").show()
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
            edit.create('SAFETYLEVEL', 'select', { data: {'Green': 'Green', 'Yellow':'Yellow', 'Red': 'Red'} })
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
            edit.create("DYNAMIC", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            industrial_codes = ['in', 'sw']
            industrial_visit = industrial_codes.includes(app.prop.slice(0,2))
            if (!industrial_visit) {
                this.$el.find(".remoteormailin").hide()
            } else {
                edit.create("REMOTEORMAILIN", 'select', { data: {'Remote': 'Remote', 'Mail-in': 'Mail-in', 'Other': 'Other'}})
            }

            edit.create("SESSIONLENGTH", 'text')
            edit.create("ENERGY", 'text')
            edit.create("MICROFOCUSBEAM", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("SCHEDULINGRESTRICTIONS", 'text')
            edit.create("LASTMINUTEBEAMTIME", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})
            edit.create("DEWARGROUPING", 'select', { data: {'Yes': 'Yes', 'No': 'No', 'Don\'t mind': 'Don\'t mind'}})
            edit.create("EXTRASUPPORTREQUIREMENT", 'text');
            edit.create("MULTIAXISGONIOMETRY", 'select', { data: {'Yes': 'Yes', 'No': 'No'}})

            this.updateDynamic()
            this.listenTo(this.model, "change:DYNAMIC", this.updateDynamic)
            
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
