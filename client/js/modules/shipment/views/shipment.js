define(['marionette',
    
    'models/dewar',
    'collections/dewars',
    'collections/labcontacts',
    'modules/shipment/views/dewars',
    'collections/containers',
    'modules/shipment/views/dewarcontent',
    'modules/shipment/collections/dewarhistory',
    'modules/shipment/views/dewarhistory',
    
    'utils/editable',
    'tpl!templates/shipment/shipment.html',
    
    'backbone', 'backbone-validation'], function(Marionette,
        Dewar,
        Dewars,
        LabContacts,
        DewarsView,
        Containers,
        DewarContentView,
        DewarHistory,
        DewarHistoryView,
        
        Editable, template,
        Backbone){

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { table: '.table', history: '.history', cont: '.dcontent' },
        //modelEvents: { 'change': 'render' },
        
        templateHelpers: {
            APIURL: app.apiurl
        },

        events: {
            'click #add_dewar': 'addDewar',
            'click a.send': 'sendShipment',
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
            this.dewarhistory = new DewarHistory()
            this.dewars = new Dewars([], { id: this.model.get('SHIPPINGID') })
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
            this.$el.find('.add_container').html('<a class="button" href="/containers/add/did/'+did+'"><i class="fa fa-plus"></i> Add Container</a>')
            this.dewarcontent.dewarID = did
            this.dewarcontent.fetch()
            this.dewarhistory.id = did
            this.dewarhistory.fetch()
                
            this.lastDewarID = did
        },

        refreshDewar: function() {
            this.fetchDewars(true)
        },
        
        onRender: function() {
            this.table.show(new DewarsView({ collection: this.dewars }))
            this.cont.show(new DewarContentView({ collection: this.dewarcontent }))
            this.history.show(new DewarHistoryView({ collection: this.dewarhistory }))
            
            this.listenTo(this.cont.currentView, 'refresh:dewars', this.refreshDewar, this)
            
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('SHIPPINGNAME', 'textlong')
            edit.create('SAFETYLEVEL', 'select', { data: {'Green': 'Green', 'Yellow':'Yellow', 'Red': 'Red'} })
            edit.create('COMMENTS', 'textarea')
            edit.create('DELIVERYAGENT_AGENTNAME', 'text')
            edit.create('DELIVERYAGENT_AGENTCODE', 'text')
            edit.create('DELIVERYAGENT_SHIPPINGDATE', 'date')
            edit.create('DELIVERYAGENT_DELIVERYDATE', 'date')
            
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