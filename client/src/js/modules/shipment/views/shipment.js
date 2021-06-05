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
                IS_STAFF: app.staff,
                QUEUE_SHIPMENT: app.config.queue_shipment,
                AUTO_LABEL: app.config.auto_collect_label || 'Automated'
            }
        },

        events: {
            'click #add_dewar': 'addDewar',
            'click a.send': 'sendShipment',
            'click a.return': 'returnShipment',
            'click a.pdf': utils.signHandler,
            'click a.cancel_pickup': 'cancelPickup',
            'click a.queue': 'queueShipment',
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
                    self.model.set({ SHIPPINGSTATUS: 'sent to facility' })
                    app.alert({ className: 'message notify', message: 'Shipment successfully marked as sent' })
                    self.render()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong sending this shipment, please try again' })
                },
                
            })
        },

        returnShipment: function(e) {
            e.preventDefault()
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/return/'+this.model.get('SHIPPINGID'),
                success: function() {
                    self.model.set({ SHIPPINGSTATUS: 'returned' })
                    self.render()
                    setTimeout(function() {
                        app.alert({ className: 'message notify', message: 'Shipment successfully marked as returned to user' })    
                    }, 500)
                    
                },
                error: function(xhr) {
                    var json = {};
                    if (xhr.responseText) {
                        try {
                            json = JSON.parse(xhr.responseText)
                        } catch(err) {

                        }
                    }

                    if (json.message) {
                        app.alert({ message: json.message })
                    } else {
                        app.alert({ message: 'Something went wrong marking this shipment returned, please try again' })
                    }
                },
                
            })
        },

        queueShipment: function(e) {
            e.preventDefault()

            var containers = new Containers()
            // make sure to return all containers in the shipment
            containers.state.pageSize = 100
            containers.queryParams.SHIPPINGID = this.model.get('SHIPPINGID')
            containers.fetch().done(function () {
                var promises = []
                var success = 0
                var failure = 0

                containers.each(function(c) {
                    promises.push(Backbone.ajax({
                        url: app.apiurl+'/shipment/containers/queue',
                        data: {
                            CONTAINERID: c.get('CONTAINERID')
                        },
                        success: function() {
                            success++
                        },
                        error: function(xhr) {
                            var json = {};
                            if (xhr.responseText) {
                                try {
                                    json = JSON.parse(xhr.responseText)
                                } catch(err) {

                                }
                            }
                            app.alert({ message: c.get('CONTAINERID') + ': ' + json.message })
                            failure++
                        }
                    }))
                })

                $.when.apply($, promises).then(function() {
                    app.alert({ message: success+ ' Container(s) Successfully Queued, ' + failure + ' Failed' })
                }).fail(function() {
                    app.alert({ message: success+ ' Container(s) Successfully Queued, ' + failure + ' Failed' })
                })
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
            if (app.proposal && app.proposal.get('ACTIVE') == '1') this.$el.find('.add_container').html('<a class="button" href="/containers/add/did/'+did+'"><i class="fa fa-plus"></i> Add Container</a>')
            this.dewarcontent.dewarID = did
            this.dewarcontent.fetch()
            this.dewarhistory.id = did
            this.dewarhistory.fetch()

            var d = this.dewars.findWhere({ DEWARID: did })
            if (d && (d.get('TRACKINGNUMBERTOSYNCHROTRON') || d.get('TRACKINGNUMBERTOSYNCHROTRON'))) {
                this.dewartracking.queryParams.DEWARID = did
                this.dewartracking.fetch()

            } else {
                this.dewartracking.ORIGIN = 'N/A'
                this.dewartracking.DESTINATION = 'N/A'
                this.dewartracking.reset()
                
            this.lastDewarID = did
            }
        },

        refreshDewar: function() {
            this.fetchDewars(true)
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