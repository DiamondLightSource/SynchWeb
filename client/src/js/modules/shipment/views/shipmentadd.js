define(['marionette', 'views/form',
    'models/shipment',
    'collections/visits',
    'collections/labcontacts',
    'modules/shipment/collections/dewarregistry',
    
    'views/dialog',
    'modules/contact/views/addcontact',
    
    'templates/shipment/shipmentadd.html',
    'jquery',
    'backbone',
    
    'backbone-validation',
    
    ], function(Marionette, FormView,
        Shipment, Visits, LabContacts, DewarRegistry,
        DialogView, AddContactView,
        template, $_, Backbone) {

    /*
     List of facility codes
    */
    var FCode = Marionette.ItemView.extend({
        tagName: 'span',
        template: _.template('<select name=FCODES[]></select>'),
        ui: {
            select: 'select[name^=FCODES]',
        },

        onRender: function() {
            this.ui.select.html('<option value="!">Please select one</option>'+this.getOption('dewars').opts({ empty: true }))
        },
    })
            
    var FCodes = Marionette.CollectionView.extend({
        tagName: 'span',
        className: 'fcodes',
        childView: FCode,
        childViewOptions: function() {
            return {
                dewars: this.getOption('dewars')
            }
        }
    })
            
            
    return FormView.extend({
        template: template,

        templateHelpers: function() {
            return {
                DHL_ENABLE: app.options.get('dhl_enable'),
                FACILITY_COURIER_COUNTRIES_LINK: app.options.get('facility_courier_countries_link'),
            }
        },

        events: {
            'change @ui.dewars': 'updateFCodes',
            'change @ui.lcret': 'getlcdetails',
            'change select[name^=FCODES]': 'checkFCodes',
            'change @ui.name': 'checkFCodes',
            'click a.add_lc': 'addLC',
            'change @ui.safetylevel': 'changeSafetyLevel',
            'change @ui.dynamic': 'updateFirstExp',
            'change @ui.longwavelengthsel': 'updateLongWavelength',
            'change @ui.extrasupportsel': 'updateExtraSupport',
            'change @ui.onsiteusersel': 'updateOnsiteUser',
        },
        
        ui: {
            dewars: 'input[name=DEWARS]',
            lcret: 'select[name=RETURNLABCONTACTID]',
            lcout: 'select[name=SENDINGLABCONTACTID]',
            first: 'select[name=FIRSTEXPERIMENTID]',
            name: 'input[name=SHIPPINGNAME]',
            dynamic: 'input[name=DYNAMIC]',
            udc: '#udc',
            responsive: '#responsive',
            imaging: '#imaging',
            existing: '#existingsession',
            nosessions: '#nosessions',
            other: '#other',
            safetylevel: 'select[name=SAFETYLEVEL]',
            longwavelengthsel: 'select[name=LONGWAVELENGTH]',
            longwavelengthli: '.longwavelength',
            extrasupportsel: 'select[name=EXTRASUPPORTYESNO]',
            onsiteusersel: 'select[name=ONSITEUSERYESNO]',
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
        
        changeSafetyLevel: function() {
            if (this.ui.safetylevel.val() === 'Green') {
                this.ui.udc.prop('disabled', false)
                this.ui.responsive.prop('disabled', false)
                this.ui.imaging.prop('disabled', false)
                this.ui.other.prop('disabled', false)
            } else {
                this.ui.udc.prop('disabled', true)
                this.ui.udc.prop('checked', false)
                this.ui.responsive.prop('disabled', true)
                this.ui.responsive.prop('checked', false)
                this.ui.imaging.prop('disabled', true)
                this.ui.imaging.prop('checked', false)
                this.ui.other.prop('disabled', true)
                this.ui.other.prop('checked', false)
                this.updateDynamicSchedule()
            }
            this.visits.fetch().done(this.updateFirstExp.bind(this))
        },

        updateFirstExp: function() {
            if (this.visits.length === 0) {
                this.ui.existing.prop('disabled', true)
                this.ui.existing.prop('checked', false)
                this.ui.nosessions.html('(no suitable sessions found)')
            } else {
                this.ui.existing.prop('disabled', false)
                this.ui.nosessions.html('')
            }
            if (this.ui.existing.is(':checked')) {
                this.ui.first.show()
                this.ui.first.html('<option value="!">Please select one</option>'+this.visits.opts())
            } else {
                this.ui.first.html('<option value=""> - </option>').change()
                this.ui.first.hide()
            }
            if (this.ui.other.is(':checked')) {
                this.model.validation.COMMENTS.required = true
            } else {
                this.model.validation.COMMENTS.required = false
            }
            this.updateDynamicSchedule()
        },

        updateDynamicSchedule: function() {
            if (this.ui.responsive.is(':checked')) {
                this.ui.longwavelengthli.show()
                this.updateLongWavelength()
            } else {
                this.ui.longwavelengthli.hide()
                this.hideRemoteForm()
            }
        },

        updateLongWavelength: function() {
            if (this.ui.longwavelengthsel.val() === 'No') {
                this.showRemoteForm()
            } else {
                this.hideRemoteForm()
            }
        },

        updateExtraSupport: function() {
            if (this.ui.extrasupportsel.val() === 'No') {
                this.$el.find(".extrasupportdetail").hide()
            } else {
                this.$el.find(".extrasupportdetail").show()
            }
        },

        updateOnsiteUser: function() {
            if (this.ui.onsiteusersel.val() === 'No') {
                this.$el.find(".onsiteuserdetail").hide()
            } else {
                this.$el.find(".onsiteuserdetail").show()
            }
        },

        isIndustrialProposal: function() {
            industrial_codes = app.options.get('industrial_prop_codes')
            return industrial_codes.includes(app.prop.slice(0,2))
        },

        showRemoteForm: function() {
            this.$el.find(".remoteform").show()
            if (this.isIndustrialProposal()) {
                this.model.validation.REMOTEORMAILIN.required = true
                this.$el.find(".remoteormailin").show()
            }
        },

        hideRemoteForm: function() {
            this.model.validation.REMOTEORMAILIN.required = false
            this.$el.find(".remoteform").hide()
            if (this.isIndustrialProposal()) {
                this.$el.find(".remoteormailin").hide()
            }
        },

        getRiskRating: function() {
            if (this.ui.safetylevel.val() === 'Yellow') return 'medium'
            if (this.ui.safetylevel.val() === 'Red') return 'high'
        },

        onRender: function() {
            var self = this

            this.dewars = new DewarRegistry(null, { state: { pageSize: 9999 } })
            this.listenTo(this.dewars, 'sync', this.updateFCodes)
            this.refreshDewars()
            
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.listenTo(this.contacts, 'sync', this.updateContacts)
            this.refreshContacts()
            
            this.visits = new Visits(null, { queryParams: { next: 1 }, state: { pageSize: 9999 } })
            this.visits.queryParams.RISKRATING = this.getRiskRating.bind(this)
            this.visits.fetch().done(this.updateFirstExp.bind(this))
            
            this.date('input[name=DELIVERYAGENT_SHIPPINGDATE], input[name=DELIVERYAGENT_DELIVERYDATE]')
            this.time('input[name=READYBYTIME], input[name=CLOSETIME]')

            this.fcodes = new Backbone.Collection()
            this.$el.find('li.d .floated').append(new FCodes({ collection: this.fcodes, dewars: this.dewars }).render().el)

            this.$el.find(".remoteform").hide()
            this.$el.find(".extrasupportdetail").hide()
            this.$el.find(".onsiteuserdetail").hide()
            this.$el.find(".remoteormailin").hide()
            
            this.checkFCodes()
        },

        onShow: function() {
            this.ui.name.focus()
        },

        refreshDewars: function() {
            this.dewars.fetch()
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
            var d = this.ui.dewars.val()
            d > 0 ? this.$el.find('li.d').show() : this.$el.find('li.d').hide()
            var fcs = _.map(_.range(1,parseInt(d)+1), function(i) { return { id: i } })
            this.fcodes.set(fcs)
        },
        
        
        /*
         Check facility codes and title are valid, if so show DLS shipping
         button
        */
        checkFCodes: function() {
            var fc = this.$el.find('select[name^=FCODES]').eq(0)

            if (!this.model.preValidate('FCODES[]', fc.val()) && fc.val() && fc.val().search('MX') > -1 && !this.model.preValidate('SHIPPINGNAME', this.ui.name.val())) this.$el.find('button[name="dls"]').fadeIn()
            else this.$el.find('button[name="dls"]').hide()
        },
        
        prepareModel: function() {
            this.model.set({ FCODES: this.$el.find('select[name^=FCODES]').map(function(i,f) { if ($(f).val()) return $(f).val() }).get() })
        },
        
    })

})
