define(['marionette', 'views/form',
    'collections/visits',
    'collections/labcontacts',
    'collections/shipments',
    'collections/dewars',
    'modules/shipment/collections/dewarhistory',

    'modules/shipment/models/dispatch',
    
    'templates/shipment/dispatch.html',
    'jquery',
    'backbone',
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
            'click @ui.useAnotherCourierAccount': 'toggleCourierAccountDisplay'  
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
            useAnotherCourierAccount: 'input[name=USE_ANOTHER_COURIER_ACCOUNT]'
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

            this.ui.courier.html('<input type="text" name="DELIVERYAGENT_AGENTNAME" />')
            this.$el.find('input[name=DELIVERYAGENT_AGENTNAME]').val(this.dewar.get('DELIVERYAGENT_AGENTNAME'))
            this.$el.find('input[name=DELIVERYAGENT_AGENTCODE]').val(this.dewar.get('DELIVERYAGENT_AGENTCODE'))

            this.$el.find('input[name=DELIVERYAGENT_AGENTNAME]').attr('disabled', true)
            this.$el.find('input[name=DELIVERYAGENT_AGENTCODE]').attr('disabled', true)
            
            var self = this
            this.ready.done(function() {
                self.ui.exp.html(self.visits.opts()).val(self.model.get('VISIT'))
                self.updateLC()
            })
        },

        initialize: function(options) {
            this.dewar = options.dewar
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()

            var self = this
            this.visits = new VVisits(null, { state: { pageSize: 9999 } })
            this.ready = this.visits.fetch()

            this.history = new DewarHistory(null, { queryParams: { did: this.getOption('dewar').get('DEWARID') }})
            this.history.fetch().done(function() {
                var h = self.history.at(0)
                if (h) self.ui.loc.val(h.get('STORAGELOCATION'))
            })
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
                this.ui.addr.val([lc.get('ADDRESS'),lc.get('CITY'),lc.get('POSTCODE'),lc.get('COUNTRY')].join("\n"))
                this.ui.lab.val(lc.get('LABNAME'))
            }
        },
        
        toggleCourierAccountDisplay: function(event) {
            if (event.target.checked) {
                this.$el.find('input[name=DELIVERYAGENT_AGENTNAME]').attr('disabled', false)
                this.$el.find('input[name=DELIVERYAGENT_AGENTCODE]').attr('disabled', false)
            } else {
                this.$el.find('input[name=DELIVERYAGENT_AGENTNAME]').val(this.dewar.get('DELIVERYAGENT_AGENTNAME'))
                this.$el.find('input[name=DELIVERYAGENT_AGENTCODE]').val(this.dewar.get('DELIVERYAGENT_AGENTCODE'))
            }
        }
    })

})