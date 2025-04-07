define(['marionette', 'backbone',
        'collections/visits',
        'modules/shipment/collections/dewarregistry',
        'views/validatedrow',
        'utils/editable',
        'utils/forms',
        'utils',
    
        'templates/shipment/dewarlist.html',
        'templates/shipment/dewarlistrow.html',
        'templates/shipment/dewarlistrownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, Visits, DewarRegistry, ValidatedRow, Editable, forms, utils, template, rowtemplate, rowtemplatenew) {


    var GridRow = ValidatedRow.extend(_.extend({}, forms, {
        getTemplate: function() {
            return this.model.get('new') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        attributes: { 'data-testid': 'shipment-dewars-table-row' },
        templateContext: function() {
            return {
                APIURL: app.apiurl,
                PROP: app.prop,
            }
        },

        events: {
            'click a.cancel': 'cancelDewar',
            'click td': 'showDewar',
            'click a.deact': 'deactivateDewar',
            'click a.print': utils.signHandler,
        },

        ui: {
            first: 'select[name=FIRSTEXPERIMENTID]',
            fc: 'select[name=FACILITYCODE]',
            deact: '.deact',
            dispatch: '.dispatch',
            transfer: '.transfer',
            ssd: '.ssdispatch',
        },

        className: function() {
            if (this.model.get('DEWARSTATUS') == 'processing') return 'active'
        },

        deactivateDewar: function(e) {
            e.preventDefault()
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/assign/deact',
                data: { did: this.model.get('DEWARID') },
                success: function() {
                    self.$el.removeClass('active')
                    self.model.set('DEWARSTATUS', 'at facility')
                    self.showHideButtons()
                },
                
                error: function() {
                    app.alert({ message: 'Something went wrong deactivating this dewar' })
                }
                
            })
        },

        showDewar: function(e) {
            console.log('show dewar', this.model.get('new'))
            if (this.model.get('new')) return
            app.trigger('shipment:showdewar', this.model.get('DEWARID'))
        },

        setData: function() {
            var data = {}
            _.each(['CODE', 'FACILITYCODE','FIRSTEXPERIMENTID','TRACKINGNUMBERTOSYNCHROTRON','TRACKINGNUMBERFROMSYNCHROTRON', 'WEIGHT'], function(f) {
                data[f] = $('[name='+f+']').val()
            })
            this.model.set(data)
        },

        success: function(m,r,o) {
            this.model.set('new', false)
            var self = this
            this.model.fetch().done(function() {
                self.render()
            })
        },

        error: function(m,r,o) {
            app.message('Something went wrong creating this dewar, please try again')
        },

        cancelDewar: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },
        
        initialize: function() {
            this.showDewar = _.debounce(this.showDewar, 500)
        },

        onRender: function() {
            console.log('rendering row')
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this)
            
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('CODE', 'text')

            var self = this
            edit.create('FACILITYCODE', 'select', { data: function() {
                return self.getOption('regdewars').kv({ empty: true })}
            })
            
            edit.create('TRACKINGNUMBERTOSYNCHROTRON', 'text')
            edit.create('TRACKINGNUMBERFROMSYNCHROTRON', 'text')
            edit.create('WEIGHT', 'text')
            
            this.visits = new Visits(null, { queryParams: { next: 1 }, state: { pageSize: 9999 } })
            this.visits.fetch().done(function() {
                self.ui.first.html(self.visits.opts({ empty: true }))
                edit.create('FIRSTEXPERIMENTID', 'select', { data: self.visits.kv({ empty: true }) }, true)
            })

            this.ui.fc.html(this.getOption('regdewars').opts({ empty: true }))
            this.showHideButtons()
        },

        showHideButtons: function() {
            if (this.model.get('DEWARSTATUS') === 'processing') {
                this.ui.deact.show()
                this.ui.dispatch.hide()
                this.ui.transfer.hide()
            } else {
                this.ui.deact.hide()
                this.ui.dispatch.show()
                this.ui.transfer.show()
            }
            if (this.model.get('STORAGELOCATION') === 'stores-out') {
                this.ui.dispatch.hide()
                this.ui.transfer.hide()
            }
            if (app.options.get('shipping_service_app_url') && this.model.get('EXTERNALSHIPPINGIDFROMSYNCHROTRON')) {
                let link = app.options.get('shipping_service_app_url')+'/shipment-requests/'+this.model.get('EXTERNALSHIPPINGIDFROMSYNCHROTRON')+'/outgoing'
                this.ui.ssd.attr('href', link)
            } else {
                this.ui.ssd.hide()
            }
        },

        modelEvents: {
            sync: 'render'
        }
    }))


    var EmptyView = Marionette.View.extend({
        tagName: 'tr',
        template: _.template('<td colspan="10">No dewars for this shipment</td>')
    })

    return GridView = Marionette.View.extend({
        tagName: 'table',
        emptyView: EmptyView,
        className: 'dewars reflow',
        template: template,
        childView: GridRow,
        proteins: '',
        
        childViewOptions: function() {
            return {
                regdewars: this.regdewars
            }
        },

        initialize: function(options) {
            if (options.childTemplate) this.options.childViewOptions.template = options.childTemplate

            this.regdewars = new DewarRegistry()
            this.regdewars.state.pageSize = 9999
            this.regdewars.fetch()
        },
    })
    
})
