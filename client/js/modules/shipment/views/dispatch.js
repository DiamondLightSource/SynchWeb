define(['marionette', 'views/form',
    'collections/visits',
    'collections/labcontacts',
    'collections/shipments',
    'collections/dewars',
    'modules/shipment/collections/dewarhistory',

    'modules/shipment/models/dispatch',
    
    'tpl!templates/shipment/dispatch.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(Marionette, FormView,
        Visits, LabContacts, Shipments, Dewars, DewarHistory,
        DispatchModel,
        template, $_, Backbone) {

   
    var VVisits = Visits.extend({
        valueAttribute: 'VISIT',
    })


    return FormView.extend({
        template: template,
        
        events: {
            'change @ui.lc': 'getlcdetails',    
            'change @ui.exp': 'updateLC',    
        },
        
        ui: {
            lc: 'select[name=LABCONTACTID]',

            exp: 'select[name=VISIT]',
            lco: 'input[name=LOCALCONTACT]',
            loc: 'input[name=LOCATION]',

            gn: 'input[name=GIVENNAME]',
            fn: 'input[name=FAMILYNAME]',
            addr: 'textarea[name=ADDRESS]',
            em: 'input[name=EMAILADDRESS]',
            ph: 'input[name=PHONENUMBER]',
            lab: 'input[name=LABNAME]',

            courier: 'span.courier',
        },



        templateHelpers: function() {
            return {
                DEWAR: this.getOption('dewar').toJSON()
            }
        },
        
        createModel: function() {
            this.model = new DispatchModel({ 
                FACILITYCODE: this.getOption('dewar').get('FACILITYCODE'), 
                DEWARID: this.getOption('dewar').get('DEWARID'), 
                LABCONTACTID: this.getOption('dewar').get('LABCONTACTID'),
                VISIT: this.getOption('dewar').get('FIRSTEXPERIMENT')
            })
        },
        
        success: function(model, response, options) {
            console.log('success from dispatch req')
            app.trigger('shipment:show', this.getOption('dewar').get('SHIPPINGID'))
        },

        failure: function(model, response, options) {
            console.log('failure from dispatch req')
            app.alert({ message: 'Something went wrong registering this dispatch request, please try again'})
        },
        
        onRender: function() {
            this.date('input[name=DELIVERYAGENT_SHIPPINGDATE]')

            var d = new Date()
            var today = (d.getDate() < 10 ? '0'+d.getDate() : d.getDate()) + '-' + (d.getMonth() < 9 ? '0'+(d.getMonth()+1) : d.getMonth()+1) + '-' + d.getFullYear()
            this.$el.find('input[name=DELIVERYAGENT_SHIPPINGDATE]').val(today)

            if (this.model.get('FACILITYCODE')) {
                this.ui.courier.html('<select name="DELIVERYAGENT_AGENTNAME"><option value="Diamond DHL">Diamond DHL (UK ONLY)</option><option value="Diamond Fedex">Diamond Fedex (International ONLY)</option></select>')
            } else {
                this.ui.courier.html('<input type="text" name="DELIVERYAGENT_AGENTNAME" />')
            }
            
        },

        initialize: function() {
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()

            var self = this
            this.visits = new VVisits(null, { state: { pageSize: 9999 } })
            this.visits.fetch().done(function() {
                self.ui.exp.html(self.visits.opts()).val(self.model.get('VISIT'))
                self.updateLC()
            })

            this.history = new DewarHistory(null, { queryParams: { did: this.getOption('dewar').get('DEWARID') }})
            this.history.fetch().done(function() {
                var h = self.history.at(0)
                if (h) self.ui.loc.val(h.get('STORAGELOCATION'))
            })
        },

        updateLC: function() {
            var vis = this.visits.findWhere({ VISIT: this.ui.exp.val() })
            if (vis) {
                this.ui.lco.val(vis.get('LC'))
            }

        },

        refreshContacts: function() {
            this.contacts.fetch()
        },
        
        updateContacts: function() {
            this.ui.lc.html(this.contacts.opts()).val(this.model.get('LABCONTACTID'))
            this.getlcdetails()
        },
        
        getlcdetails: function() {
            var lc = this.contacts.findWhere({ LABCONTACTID: this.ui.lc.val() })
            if (lc) {
                this.ui.gn.val(lc.get('GIVENNAME'))
                this.ui.fn.val(lc.get('FAMILYNAME'))
                this.ui.em.val(lc.get('EMAILADDRESS'))
                this.ui.ph.val(lc.get('PHONENUMBER'))
                this.ui.addr.val([lc.get('ADDRESS'),lc.get('CITY'),lc.get('POSTCODE'),lc.get('COUNTRY')].join("\n"))
                this.ui.lab.val(lc.get('LABNAME'))
            }
        },
        

        
        
    })

})