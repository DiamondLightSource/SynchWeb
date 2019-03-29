define(['marionette',
    'models/dewar',
    'models/shipment',
    'collections/containers',
    'collections/dewars',
    'collections/shipments',
    'tpl!templates/assign.html',
    'tpl!templates/assigndialog.html',
    'tpl!templates/unassigndialog.html'
    ], function(Marionette, Dewar, Shipment, Containers, Dewars, Shipments, template, assignt, unassignt) {

        
    var AssignDialog = Marionette.ItemView.extend({
        attributes: {
            'data-role': 'popup',
            'data-dismissible': 'false',
            'data-overlay-theme': 'b',
            'data-transition': 'pop',
            'style': 'min-width:400px;',
        },
        template: assignt,
        
        initialize: function(options) {
            this.listenTo(options.assigned, 'sync', this.refresh, this)
        },

        refresh: function() {
            console.log('refrsh assign view', this.getOption('assigned'))
            this.render()
        },

        setContainer: function(name) {
            this.container = name
            this.render()
        },
        
        templateHelpers: function() {
            return {
                container: this.container,
                assigned: this.getOption('assigned')
            }
        },
        
        events: {
            'click [data-rel=back]': 'close',
            'click .submit': 'assign',
        },
        
        assign: function(e) {
            e.preventDefault()
            e.stopPropagation()
            this.trigger('assign', this.$el.find('input[name=position]:checked').val())
            this.close()
        },
        
        
        close: function(e) {
            if (e) e.stopPropagation()
            if (e) e.preventDefault()
            this.$el.popup('close')
        },
    })

    var UnassignDialog = Marionette.ItemView.extend({
        attributes: {
            'data-role': 'popup',
            'data-dismissible': 'false',
            'data-overlay-theme': 'b',
            'data-transition': 'pop',
            'style': 'min-width:400px;',
        },
        template: unassignt,
        
        setContainer: function(name) {
            this.container = name
            this.render()
        },
        
        templateHelpers: function() {
            return {
                container: this.container
            }
        },
        
        events: {
            'click [data-rel=back]': 'close',
            'click .submit': 'unassign',
        },
        
        unassign: function(e) {
            e.preventDefault()
            e.stopPropagation()
            this.trigger('unassign')
            this.close()
        },
        
        
        close: function(e) {
            if (e) e.preventDefault()
            if (e) e.stopPropagation()
            this.$el.popup('close')
        },
    })
        

    var ContainerView = Marionette.CompositeView.extend({
        tagName: 'li',
        className: 'container',
        template: _.template('<a href="#"><h3><%-NAME%></h3></a>'),
        events: {
            click: 'doClick',
        },
        
        doClick: function(e) {
            e.preventDefault()
            e.stopPropagation()
            
            if (this.getOption('assigned')) {
                app.trigger('unassign', this.model)
            } else {
                app.trigger('assign', this.model)
            }
        },
        
    })
            
            
            
    // List of Dewars in Shipment
    var DewarView = Marionette.CompositeView.extend({
        attributes: {
            'data-role': "collapsible",
            'data-content-theme': "a",
            'data-collapsed': 'false'
        },
        template: _.template('<h3><%-CODE%></h3><button data-role="button" class="deact">Deactivate Dewar</button><ul data-role="listview" data-inset="true" class="responsive dewar"></ul><div class="clear"></div>'),
        
        events: {
            'click button.deact': 'deactivateDewar',
        },

        onRender: function() {
            if (this.model.get('DEWARSTATUS') != 'processing') this.$el.find('.deact').hide()
        },

        deactivateDewar: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/assign/deact',
                data: { visit: this.getOption('visit'), did: this.model.get('DEWARID') },
                success: function() {
                    app.trigger('refreshGUI')
                },
            })
        },

        childView: ContainerView,
        childViewContainer: '.dewar',
        
        initialize: function(options) {
            this.collection = this.model.get('CONTAINERS')
        },
    })
            
            
    // List of Shipments
    var ShipmentView = Marionette.CompositeView.extend({
        attributes: {
            'data-role': "collapsible",
            'data-content-theme': "a",
            'data-collapsed': 'false'
        },
        template: _.template('<h3><%-SHIPPINGNAME%></h3><div data-role="collapsible-set" class="shipment"></div>'),
        childView: DewarView,
        className: 'shipment',
        childViewContainer: '.shipment',
        
        events: {
            'expand': function(e) { e.stopPropagation() },
            'collapse': function(e) { e.stopPropagation() }
        },
        
        initialize: function(options) {
            this.collection = this.model.get('DEWARS')
        },

        childViewOptions: function() {
            return {
                visit: this.getOption('visit')
            }
        }
    })
        
    var ShipmentsView = Marionette.CollectionView.extend({
        childView: ShipmentView,
        attributes: {
            'data-role': 'collapsible',
            id: 'shipments'
        },

        childViewOptions: function() {
            return {
                visit: this.getOption('visit')
            }
        }
    })
            

        
        
    var PositionView = Marionette.CompositeView.extend({
        className: function() {
            return 'ui-block-'+String.fromCharCode((this.model.collection.indexOf(this.model)%4)+97)
        },
        
        template: _.template('<div class="pos assigned" data-role="collapsible" data-content-theme="a" data-collapsed="false"><h3>Position <%-id%></h3><ul data-role="listview" data-inset="true"></ul></div>'),
        
        childView: ContainerView,
        childViewOptions: {
            assigned: true,
        },
        childViewContainer: 'ul',
        
        initialize: function(options) {
            this.collection = new Containers()
            this.assigned = options.assigned
            this.listenTo(this.assigned, 'change sync reset add remove', this.updateCollection, this)
            this.updateCollection()
        },
        
        updateCollection: function() {
            this.collection.reset(this.assigned.findWhere({ SAMPLECHANGERLOCATION: this.model.get('id').toString() }))
            this.$el.find('ul').listview().listview('refresh')
        },
    })
        
        
    var SampleChangerView = Marionette.CollectionView.extend({
        className: 'ui-grid-c',
        childView: PositionView,
        childViewOptions: function() {
            return {
                assigned: this.getOption('assigned'),
                visit: this.getOption('visit'),
            }
        }
    })
    
        
    return Marionette.LayoutView.extend({
        template: template,
        
        attributes: {
            'data-url': 'assign',
            'data-role': 'page'
        },
        
        regions: {
            pos: '.pos',
            shps: '.shps',
        },
        
        ui: {
            page: 'span.page',
        },
        
        events: {
            'click a.prev': 'prevPage',
            'click a.next': 'nextPage',
        },
        
        
        prevPage: function(e) {
            e.preventDefault()
            e.stopPropagation()
            this.containers.getPreviousPage()
            this.setPage()
            this.showLoader()
        },

        nextPage: function(e) {
            e.preventDefault()
            e.stopPropagation()
            this.containers.getNextPage()
            this.setPage()
            this.showLoader()
        },
        
        setPage: function() {
            this.ui.page.text(this.containers.state.currentPage)
        },
        
        showLoader: function() {
            $.mobile.loading( 'show', {
                textVisible: false,
                theme: 'z',
            })
        },
        
        hideLoader: function() {
            $.mobile.loading('hide')
        },
        
        
        initialize: function(options) {
            this.assigned = new Containers(null, { queryParams: { assigned: 1, bl: this.model.get('BL'), visit: this.model.get('VISIT') }, state: { pageSize: 9999 } })
            this.containers = new Containers(null, { queryParams: { unassigned: this.model.get('BL'), visit: this.model.get('VISIT') }, state: { pageSize: 40 } })
            
            this.listenTo(this.containers, 'sync', this.generateShipments, this)
            this.listenTo(this.containers, 'sync', this.queueRefresh, this)
            this.collection = new Shipments()
            
            this.listenTo(app, 'assign', this.onAssign, this)
            this.listenTo(app, 'unassign', this.onUnassign, this)
            this.listenTo(app, 'refreshGUI', this.refreshGUI, this)

            this.refreshThread = null
            this.refreshGUI()

            setTimeout(function() {
                console.log('go to visits')
                app.trigger('visits')
            }, 60*30*1000)
        },
        
        queueRefresh: function() {
            console.log('queueRefresh')
            clearTimeout(this.refreshThread)
            var self = this
            this.refreshThread = setTimeout(function() {
                self.refreshGUI()
            }, 30*1000)
        },

        onAssign: function(m) {
            console.log('assign', m)
            this.assignmodel = m
            this.assign.setContainer(m.get('NAME'))
            this.assign.$el.popup('open')
        },
        
        doAssign: function(p) {
            var assigned = this.assigned.where({ SAMPLECHANGERLOCATION: p })
            console.log(assigned)
            _.each(assigned, function(c) {
                this.unassignmodel = c
                this.doUnassign()
            }, this)

            Backbone.ajax({
                url: app.apiurl+'/assign/assign', 
                data: { visit: this.model.get('VISIT'), cid: this.assignmodel.get('CONTAINERID'), pos: p },
                success: this.refreshGUI.bind(this),
            })
        },
        
        onUnassign: function(m) {
            this.unassignmodel = m
            this.unassign.setContainer(m.get('NAME'))
            this.unassign.$el.popup('open')
        },
        
        doUnassign: function() {
            Backbone.ajax({
                url: app.apiurl+'/assign/unassign',
                data: { visit: this.model.get('VISIT'), cid: this.unassignmodel.get('CONTAINERID') },
                success: this.refreshGUI.bind(this),
            })
        },
        
        refreshGUI: function() {
            this.assigned.fetch()
            this.containers.fetch()
        },
        
        onRender: function() {
            if (this.model.get('BL') in app.config.pucks) {
                var pucks = app.config.pucks[this.model.get('BL')]
            } else var pucks = 10
            
            var positions = new Backbone.Collection(_.map(_.range(1,pucks+1), function(i) { return { id: i } }))
            console.log('on show')
            this.assign = new AssignDialog({ collection: positions, assigned: this.assigned })
            this.unassign = new UnassignDialog()
            this.$el.append(this.assign.render().$el)
            this.$el.append(this.unassign.render().$el)
            
            this.listenTo(this.assign, 'assign', this.doAssign, this)
            this.listenTo(this.unassign, 'unassign', this.doUnassign, this)
            
            
            this.scview = new SampleChangerView({
                collection: positions,
                assigned: this.assigned,
                visit: this.model.get('VISIT'),
                assign: this.unassign
            })
            this.pos.show(this.scview)
            this.shps.show(new ShipmentsView({ collection: this.collection, assign: this.assign, visit: this.model.get('VISIT') }))
        },
        
        onDestroy: function() {
            this.assign.destroy()
            this.unassign.destroy()
        },
        
        
        generateShipments: function() {
            
            console.log('generate shipments')
            var sids = _.uniq(this.containers.pluck('SHIPPINGID'))
            var shipments = []
            _.each(sids, function(sid) {
                var conts = new Containers(this.containers.where({ SHIPPINGID: sid }))
                
                var dids = _.uniq(conts.pluck('DEWARID'))
                var dewars = new Dewars()
                _.each(dids, function(did) {
                    var d = conts.findWhere({ DEWARID: did })
                    var dewar = new Dewar({
                        DEWARID: did,
                        CODE: d.get('DEWAR'),
                        DEWARSTATUS: d.get('DEWARSTATUS'),
                        CONTAINERS: new Containers(conts.where({ DEWARID: did }))
                    })
                    dewars.add(dewar)
                }, this)
                
                var shipment = new Shipment({
                    SHIPPINGID: sid,
                    SHIPPINGNAME: conts.at(0).get('SHIPMENT'),
                    DEWARS: dewars,
                })
                shipments.push(shipment)
            }, this)
            
            this.collection.reset(shipments)
            this.hideLoader()
        },
        
    })
    

})