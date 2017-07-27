define(['marionette', 'views/pages',
    'collections/shipments',
    'collections/containers',
    'collections/dewars',
    'models/shipment',
    'models/dewar',
    'modules/assign/collections/pucknames',
    
    'utils',
    'tpl!templates/assign/assign.html',
    'jquery-ui',
    ], function(Marionette, Pages,
        Shipments,
        Containers,
        Dewars,
        Shipment,
        Dewar,
        PuckNames,
    
        utils,
        template) {

            
    
    var ContainerView = Marionette.CompositeView.extend({
        template: _.template('<span class="r"><a class="button button-notext" title="Click to view container contents" href="/containers/cid/<%=CONTAINERID%>"><i class="fa fa-search"></i> <span>View Container</span></a></span><h1><%=NAME%></h1>'),
        className: function() { return  'container' + (this.getOption('assigned') ? ' assigned' : '') },
        
        initialize: function(options) {
            this.getOption('model').view = this
        },
        
        
        onRender: function() {
            this.$el.draggable({
                containment: '#drag_container',
                stack: '#unassigned div',
                revert: true
            })
        },
        
        events: {
            'drop:assign': 'assignContainer',
            'drop:unassign': 'unassignContainer',
        },
        
        // possible circular reference
        onDestroy: function() {
            this.model.view = null
        },
        
        
        // Assign Containers
        assignContainer: function(e, options) {
            console.log('confirm container on to', options.id, this.model)
            utils.confirm({
                title: 'Confirm Container Assignment',
                content: 'Are you sure you want to assign &quot;'+this.model.get('NAME')+'&quot; to sample changer position &quot;'+options.id+'&quot;?',
                callback: this.doAssign.bind(this, options)
            })
        },
        
        doAssign: function(options) {
            console.log('dropped container on to', options.id, this.model, options.assigned)
            
            var assigned = options.assigned.where({ SAMPLECHANGERLOCATION: options.id.toString() })
            console.log(assigned)
            _.each(assigned, function(c) {
                c.view.doUnAssign.call(c.view,options)
            })

            Backbone.ajax({
                url: app.apiurl+'/assign/assign',
                data: { visit: options.visit, cid: this.model.get('CONTAINERID'), pos: options.id },
                success: this.assignUpdateGUI.bind(this, options),
                error: function(xhr, message, options) {
                    app.alert({ message: 'Something went wrong assigning this container:' })
                },
            })
        },
        
        assignUpdateGUI: function(options) {
            this.trigger('remove:container', this.model)
            this.model.set({ SAMPLECHANGERLOCATION: options.id.toString() })
            options.assigned.add(this.model)
        },
        
        
        // Unassign Containers
        unassignContainer: function(e, options) {
            console.log('unassign container', this.model)
            utils.confirm({
                title: 'Confirm Container Unassignment',
                content: 'Are you sure you want to unassign &quot;'+this.model.get('NAME')+'&quot; from sample changer position &quot;'+this.model.get('SAMPLECHANGERLOCATION')+'&quot;?',
                callback: this.doUnAssign.bind(this, options)
            })
        },
        
        doUnAssign: function(options) {
            console.log('unassigning', this.model)
            Backbone.ajax({
                url: app.apiurl+'/assign/unassign',
                data: { visit: options.visit, cid: this.model.get('CONTAINERID') },
                success: this.unassignUpdateGUI.bind(this, options),
                error: function(xhr, message, options) {
                    app.alert({ message: 'Something went wrong unassigning this container:' })
                    
                },
            })
        },
        
        unassignUpdateGUI: function(options) {
            this.model.set({ SAMPLECHANGERLOCATION: null })
            this.trigger('remove:container', this.model)
            
            var shipments = _.uniq(options.shipments.pluck('SHIPPINGID'))
            if (shipments.indexOf(this.model.get('SHIPPINGID')) > -1) {
                var s = options.shipments.findWhere({ SHIPPINGID: this.model.get('SHIPPINGID') })
                var d = s.get('DEWARS').findWhere({ DEWARID: this.model.get('DEWARID') })
                d.get('CONTAINERS').add(this.model)
                
                console.log('add container to dewar')
            }
        },
        
    })
            
            
            
    // List of Dewars in Shipment
    var DewarView = Marionette.CompositeView.extend({
        template: _.template('<h1 class="clearfix"><%=CODE%><span class="r deactivate"><a class="button deact"><i class="fa  fa-power-off"></i> Deactivate Dewar</a></span></h1><div class="containers clearfix"></div>'),
        className: function() {
            var classes = 'dewar clearfix'
            if (this.model.get('DEWARSTATUS') == 'processing') classes += ' active'
            
            return classes
        },
        
        childView: ContainerView,
        childEvents: {
            'remove:container': 'removeContainer',
        },
        
        events: {
            'click a.deact': 'deactivateDewar',
        },
        
        deactivateDewar: function(e) {
            e.preventDefault()
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/assign/deact',
                data: { did: this.model.get('DEWARID') },
                success: function() {
                    self.$el.removeClass('active')
                    self.trigger('refresh')
                },
                
                error: function() {
                    app.alert({ message: 'Something went wrong deactivating this dewar' })
                }
                
            })
        },
        
        removeContainer: function(child, model) {
            console.log('remove container dewar', model)
            this.collection.remove(model)
            this.render()
        },
        
        initialize: function(options) {
            this.collection = this.model.get('CONTAINERS')
        },
        
        onRender: function() {
            this.$el.show()
        }
    })
            
            
    // List of Shipments
    var ShipmentView = Marionette.CompositeView.extend({
        template: _.template('<h1><%=SHIPPINGNAME%></h1>'),
        childView: DewarView,
        className: 'shipment',
        
        initialize: function(options) {
            this.collection = this.model.get('DEWARS')
        }
    })
            
            
            
    // Sample Changer Positions
    var PositionView = Marionette.CompositeView.extend({
        className:'bl_puck',
        template: _.template('<%=id%> <span class="name"></span><div class="ac"></div>'),
        
        childView: ContainerView,
        childViewOptions: {
            assigned: true,
        },
        childViewContainer: '.ac',
        
        childEvents: {
            'remove:container': 'removeContainer',
        },

        ui: {
            name: '.name',
        },
        
        removeContainer: function(child, model) {
            console.log('remove container position', model)
            this.collection.remove(model)
            this.render()
        },
        
        collectionEvents: {
            'change reset': 'render',
        },
        
        events: {
            'drop': 'handleDrop',
        },
        
        initialize: function(options) {
            this.collection = new Containers()
            this.assigned = options.assigned
            this.listenTo(this.assigned, 'change sync reset add remove', this.updateCollection, this)
            this.updateCollection()

            this.listenTo(this.getOption('pucknames'), 'sync', this.getNameModel)
        },

        getNameModel: function() {
            this.name = this.getOption('pucknames').findWhere({ id: this.model.get('id') })
            if (this.name) {
                this.listenTo(this.name, 'change update', this.updateName)
                this.updateName()
            }
        },

        updateName: function() {
            if (this.name && this.name.get('name')) this.ui.name.html(' - '+this.name.get('name'))
        },
        
        updateCollection: function() {
            //console.log('update assigned', this.assigned)
            this.collection.reset(this.assigned.findWhere({ SAMPLECHANGERLOCATION: this.model.get('id').toString() }))
        },
        
        onRender: function() {
            this.$el.attr('id', 'blpos'+this.model.get('id'))
            this.$el.droppable({
                accept: '.container',
                hoverClass: 'bl_puck_drag',
            })
            this.updateName()
        },
        
        handleDrop: function(e, ui) {
            ui.draggable.trigger('drop:assign', { id: this.model.get('id'), assigned: this.assigned, visit: this.getOption('visit') })
        }
        
    })
            
            
    var SampleChangerView = Marionette.CollectionView.extend({
        className: 'clearfix',
        childView: PositionView,
        childViewOptions: function() {
            return {
                assigned: this.getOption('assigned'),
                visit: this.getOption('visit'),
                pucknames: this.getOption('pucknames')
            }
        }
    })

            
            
    return Marionette.CompositeView.extend({
        template: template,
        className: 'content',
        childView: ShipmentView,
        childViewContainer: '#unassigned',
        
        events: {
            'drop #unassigned': 'handleDrop',
        },
        
        handleDrop: function(e, ui) {
            ui.draggable.trigger('drop:unassign', { shipments: this.collection, visit: this.getOption('visit').get('VISIT') })
        },
        
        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit').toJSON(),
            }
        },
        
        refresh: function() {
            this.assigned.fetch()
            this.containers.fetch()
        },
        
        initialize: function(options) {
            this.collection = new Shipments()
            
            this.assigned = new Containers(null, { queryParams: { assigned: 1, bl: this.getOption('visit').get('BL') }, state: { pageSize: 9999 } })
            this.assigned.fetch()
            
            this.containers = new Containers(null, { queryParams: { unassigned: this.getOption('visit').get('BL') }, state: { pageSize: 30, currentPage: options.page } })
            var self = this
            this.containers.fetch().done(function() {
                console.log(self.containers)
            })
            this.listenTo(this.containers, 'sync', this.generateShipments, this)
            this.paginator = new Pages({ collection: this.containers })

            this.pucknames = new PuckNames()
            this.pucknames.queryParams.bl = this.getOption('visit').get('BL')
            this.pucknames.fetch()
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
        },
        
        
        onShow: function() {
            if (this.getOption('visit').get('BL') in app.config.pucks) {
                var pucks = app.config.pucks[this.getOption('visit').get('BL')]
            } else var pucks = 10
            
            var positions = new Backbone.Collection(_.map(_.range(1,pucks+1), function(i) { return { id: i } }))
            this.scview = new SampleChangerView({
                collection: positions,
                assigned: this.assigned,
                visit: this.getOption('visit').get('VISIT'),
                shipments: this.collection,
                pucknames: this.pucknames,
            })
            this.$el.find('#assigned').append(this.scview.render().$el)
            this.$el.find('.page_wrap').append(this.paginator.render().$el)
            
            this.$el.find('#unassigned').droppable({
                accept: '.bl_puck .ac div',
                hoverClass: 'unassigned_drag',
            })
        },
        
        onDestroy: function() {
            if (this.scview) this.scview.destroy()
            this.pucknames.stop()
            // hmm no destroy?
            //if (this.paginator) this.paginator.destroy()
        },
    })
    
})