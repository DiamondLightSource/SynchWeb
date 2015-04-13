define(['marionette', 'backbone',
        'collections/visits',
        'views/validatedrow',
        'utils/editable',
        'utils/forms',
    
        'tpl!templates/shipment/dewarlist.html',
        'tpl!templates/shipment/dewarlistrow.html',
        'tpl!templates/shipment/dewarlistrownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, Visits, ValidatedRow, Editable, forms, template, rowtemplate, rowtemplatenew) {
    
        
    var GridRow = ValidatedRow.extend(_.extend({}, forms, {
        getTemplate: function() {
            return this.model.get('new') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        templateHelpers: {
            APIURL: app.apiurl
        },

        events: {
            'click a.cancel': 'cancelDewar',
            //'mouseover td': 'showDewar',
            'click td': 'showDewar',
            'click a.deact': 'deactivateDewar',
        },
        
        ui: {
            first: 'select[name=FIRSTEXPERIMENTID]',
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
            _.each(['CODE', 'FACILITYCODE','FIRSTEXPERIMENTID','TRACKINGNUMBERTOSYNCHROTRON','TRACKINGNUMBERFROMSYNCHROTRON'], function(f) {
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
            edit.create('FACILITYCODE', 'text')
            edit.create('TRACKINGNUMBERTOSYNCHROTRON', 'text')
            edit.create('TRACKINGNUMBERFROMSYNCHROTRON', 'text')
            
            var self = this
            this.visits = new Visits(null, { queryParams: { next: 1 }, state: { pageSize: 5 } })
            this.visits.fetch().done(function() {
                self.ui.first.html(self.visits.opts())
                edit.create('FIRSTEXPERIMENTID', 'select', { data: self.visits.kv() }, true)
            })
        },
        
    }))
    

    var EmptyView = Marionette.ItemView.extend({
        tagName: 'tr',
        template: _.template('<td colspan="10">No dewars for this shipment</td>')
    })
        
    return GridView = Backbone.Marionette.CompositeView.extend({
        tagName: "table",
        emptyView: EmptyView,
        className: 'dewars reflow',
        template: template,
        childView: GridRow,
        proteins: '',
        
        initialize: function(options) {
            if (options.childTemplate) this.options.childViewOptions.template = options.childTemplate
        },
        
        // This magically works, which is worrying...
        /*appendHtml: function(collectionView, itemView){
            collectionView.$("tbody").append(itemView.el);
        },*/
        
    })
    
})