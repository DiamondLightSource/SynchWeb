define(['marionette', 'views/form',
    'models/shipment',
    'collections/visits',
    'collections/labcontacts',
    
    'views/dialog',
    'modules/contact/views/addcontact',
    
    'tpl!templates/shipment/shipmentadd.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'backbone-validation',
    
    ], function(Marionette, FormView,
        Shipment, Visits, LabContacts,
        DialogView, AddContactView,
        template, $_, Backbone) {

    
    /*
     T&C Dialog
    */
    var DHLDetails = Backbone.Model.extend({
        urlRoot: '/shipment/termsaccept',
            
        parse: function(r) {
            return { details: r[0], pin: r[1], account: r[2] }
        },
    })
            
    var Terms = Backbone.Model.extend({
        urlRoot: '/shipment/terms',
            
        parse: function(r) {
            return { content: r }
        },
    })
            
    var TCDialog = DialogView.extend({
        template: _.template('<%=content%>'),
        title: 'Terms & Conditions',
        buttons: {
            'Accept': 'accept',
            'Cancel': 'closeDialog',
        },
        
        accept: function() {
            this.trigger('terms:accepted')
            this.closeDialog()
        },
    })
            
    var AcceptedDialog = DialogView.extend({
        title: 'Terms Accepted',
        template: _.template('<p>Pin Code: <b><%=pin%></b></p><%=details%>')
    })
            

    /*
     List of facility codes
    */
    var FCode = Marionette.ItemView.extend({
        tagName: 'span',
        template: _.template('<input type="text" name=FCODES[] value="" placeholder="DLS-XX-000<%=id%>" />')
    })
            
    var FCodes = Marionette.CollectionView.extend({
        tagName: 'span',
        className: 'fcodes',
        childView: FCode,
    })
            
            
    return FormView.extend({
        template: template,
        
        events: {
            'change input[name=DEWARS]': 'updateFCodes',
            'change @ui.lcret': 'getlcdetails',
            'change input[name^=FCODES]': 'checkFCodes',
            'change @ui.name': 'checkFCodes',
            'click button[name=dls]': 'getTerms',
            'click a.add_lc': 'addLC',
        },
        
        ui: {
            lcret: 'select[name=RETURNLABCONTACTID]',
            lcout: 'select[name=SENDINGLABCONTACTID]',
            first: 'select[name=FIRSTEXPERIMENTID]',
            name: 'input[name=SHIPPINGNAME]',
        },
        
        addLC: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Add Home Lab Contact', className: 'content', view: new AddContactView({ dialog: true }), autoSize: true }))
            this.listenTo(app.dialog.currentView, 'close', this.refreshContacts, this)
            
            return false
        },
        
        createModel: function() {
            this.model = new Shipment()
        },
        
        success: function(model, response, options) {
            console.log('success from shipadd')
            app.trigger('shipment:show', model.get('SHIPPINGID'))
        },

        failure: function(model, response, options) {
            console.log('failure from shipadd')
            app.alert({ message: 'Something went wrong registering this shipment, please try again'})
        },
        
        onRender: function() {
            var self = this
            
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()
            
            this.visits = new Visits(null, { queryParams: { next: 1 }, state: { pageSize: 5 } })
            this.visits.fetch().done(function() {
                self.ui.first.html(self.visits.opts())
            })
            
            this.date('input[name=DELIVERYAGENT_SHIPPINGDATE], input[name=DELIVERYAGENT_DELIVERYDATE]')

            this.fcodes = new Backbone.Collection()
            this.$el.find('li.d .floated').append(new FCodes({ collection: this.fcodes }).render().el)
            
            this.updateFCodes()
            this.checkFCodes()
        },
        
        refreshContacts: function() {
            this.contacts.fetch()
        },
        
        updateContacts: function() {
            this.ui.lcret.html(this.contacts.opts())
            this.ui.lcout.html(this.contacts.opts())
            this.getlcdetails()
        },
        
        /*
         Get Courier details from selected lab contact
        */
        getlcdetails: function() {
            var lc = this.contacts.findWhere({ LABCONTACTID: this.ui.lcret.val() })
            console.log(lc)
            if (lc) {
                this.$el.find('input[name=DELIVERYAGENT_AGENTNAME]').val(lc.get('DEFAULTCOURRIERCOMPANY'))
                this.$el.find('input[name=DELIVERYAGENT_AGENTCODE]').val(lc.get('COURIERACCOUNT'))
            }
        },
        
        
        /*
         Update number of facility code inputs based on number of dewars
        */
        updateFCodes: function() {
            var d = this.$el.find('input[name=DEWARS]').val()
            d > 0 ? this.$el.find('li.d').show() : this.$el.find('li.d').hide()
            var fcs = _.map(_.range(1,parseInt(d)+1), function(i) { return { id: i } })
            this.fcodes.set(fcs)
        },
        
        
        /*
         Check facility codes and title are valid, if so show DLS shipping
         button
        */
        checkFCodes: function() {
            var fc = this.$el.find('input[name^=FCODES]').eq(0)

            if (!this.model.preValidate('FCODES[]', fc.val()) && fc.val() && fc.val().search('MX') > -1 && !this.model.preValidate('SHIPPINGNAME', this.ui.name.val())) this.$el.find('button[name="dls"]').fadeIn()
            else this.$el.find('button[name="dls"]').hide()
        },
        
        prepareModel: function() {
            this.model.set({ FCODES: this.$el.find('input[name^=FCODES]').map(function(i,f) { if ($(f).val()) return $(f).val() }).get() })
        },
        
        
        /*
         Get T&Cs for using DLS shipping
        */
        getTerms: function(e) {
            e.preventDefault()
            var self = this
            this.terms = new Terms()
            this.terms.fetch().done(this.showTerms.bind(this))
        },
        
        showTerms: function() {
            var terms = new TCDialog({ model: this.terms })
            this.listenTo(terms, 'terms:accepted', this.termsAccepted, this)
            if (!this.terms.get('accepted')) app.dialog.show(terms)
            else this.showAccepted()
        },
        
        termsAccepted: function() {
            this.details = new DHLDetails()
            this.details.fetch({ data: { SHIPPINGNAME: this.ui.name.val() } }).done(this.showAccepted.bind(this))
        },
        
        showAccepted: function() {
            this.terms.set({ accepted: true })
            this.$el.find('input[name="DELIVERYAGENT_AGENTNAME"]').val('DHL')
            this.$el.find('input[name="DELIVERYAGENT_AGENTCODE"]').val(this.details.get('account'))
            app.dialog.show(new AcceptedDialog({ model: this.details }))
        },
    })

})