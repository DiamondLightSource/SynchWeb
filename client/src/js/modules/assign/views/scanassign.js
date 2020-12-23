define(['marionette', 'backbone', 
    'views/pages',
    'collections/containers',
    'modules/assign/collections/pucknames',
    'modules/shipment/models/containerregistry',
    'utils',
    'templates/assign/scanassign.html',
    'backbone-validation'
    ], function(Marionette,
        Backbone,
        Pages,
        Containers,
        PuckNames,
        ContainerRegistry,
        utils,
        template) {
            
    var ValidatedContainerRegistry = ContainerRegistry.extend({})
    _.extend(ValidatedContainerRegistry.prototype, Backbone.Validation.mixin);
    
    var ContainerView = Marionette.CompositeView.extend({
        template: _.template('<span class="r"><a class="button button-notext" title="Click to view container contents" href="/containers/cid/<%-CONTAINERID%>"><i class="fa fa-search"></i> <span>View Container</span></a></span><h1><%-PROP%>: <%-NAME%></h1>'),
        className: 'container assigned',
        
        events: {
            click: 'unassignContainer'
        },

        // Unassign Containers
        unassignContainer: function(e, options) {
            if ($(e.target).is('a') || $(e.target).is('i')) return;

            console.log('this.beal', this.getOption('bl'))
            utils.confirm({
                title: 'Confirm Container Unassignment',
                content: 'Are you sure you want to unassign &quot;'+this.model.get('NAME')+'&quot; from sample changer position &quot;'+this.model.get('SAMPLECHANGERLOCATION')+'&quot;?',
                callback: this.doUnAssign.bind(this, options)
            })
        },
        
        doUnAssign: function() {
            Backbone.ajax({
                url: app.apiurl+'/assign/unassign',
                data: { prop: this.model.get('PROP'), cid: this.model.get('CONTAINERID'), bl: this.getOption('bl') },
                success: this.unassignUpdateGUI.bind(this),
                error: function() {
                    app.alert({ message: 'Something went wrong unassigning this container' })
                    
                },
            })
        },

        unassignUpdateGUI: function() {
            this.model.set({ SAMPLECHANGERLOCATION: null })
        }
        
    })


    // Sample Changer Positions
    var PositionView = Marionette.CompositeView.extend({
        template: _.template('<%-id%> <span class="name"></span><div class="ac"></div><input name="barcode" />'),
        className: 'bl_puck',

        childView: ContainerView,
        childViewContainer: '.ac',
        childViewOptions: function() {
            return {
                bl: this.getOption('bl')
            }
        },

        ui: {
            name: '.name',
            barcode: 'input[name=barcode]',
        },

        events: {
            click: 'focusInput',
            'change @ui.barcode': 'findContainer',
            'keyup @ui.barcode': 'findContainer',
        },
        
        collectionEvents: {
            'change reset': 'render',
        },
        
        focusInput: function() {
            this.ui.barcode.focus()
        },

        findContainer: function() {
            if (this.ui.barcode.val() && this.validate()) {
                this.containers.fetch().done(this.assignContainer.bind(this))
            }
        },

        validate: function() { 
            var error = this.registryModel.preValidate('BARCODE', this.ui.barcode.val())

            if (error) this.ui.barcode.addClass('ferror').removeClass('fvalid')
            else this.ui.barcode.removeClass('ferror').addClass('fvalid')

            return error ? false : true
        },

        assignContainer: function() {
            if (this.containers.length) {
                var container = this.containers.at(0)

                utils.confirm({
                    title: 'Confirm Assign Container',
                    content: 'Barcode matched &quot;'+container.get('PROP')+': '+container.get('NAME')+'&quot; from dewar &quot;'+container.get('DEWAR')+'&quot with owner &quot;'+container.get('OWNER')+'&quot;. Do you want to assign this to sample changer position &quot;'+this.model.get('id')+'&quot;?',
                    callback: this.doAssignContainer.bind(this)
                })
            } else {
                app.alert({ message: 'No containers found for barcode: '+this.ui.barcode.val() })
            }

        },

        doAssignContainer: function() {
            var container = this.containers.at(0)
            Backbone.ajax({
                url: app.apiurl+'/assign/assign',
                data: { 
                    prop: container.get('PROP'), 
                    cid: container.get('CONTAINERID'), 
                    pos: this.model.get('id'), 
                    bl: this.getOption('bl')
                },
                success: this.assignUpdateGUI.bind(this),
                error: function() {
                    app.alert({ message: 'Something went wrong assigning this container' })
                },
            })
        },
        
        assignUpdateGUI: function() {
            var container = this.containers.at(0)
            container.set({ SAMPLECHANGERLOCATION: this.model.get('id').toString() })
            this.assigned.add(container)
        },

        getBarcode: function() {
            return this.ui.barcode.val()
        },

        initialize: function(options) {
            this.collection = new Containers()
            this.assigned = options.assigned
            this.listenTo(this.assigned, 'change:SAMPLECHANGERLOCATION change sync add remove', this.updateCollection, this)
            this.updateCollection()

            this.listenTo(this.getOption('pucknames'), 'sync', this.getNameModel)

            this.findContainer = _.debounce(this.findContainer.bind(this), 500)

            this.containers = new Containers()
            this.containers.queryParams.all = 1
            this.containers.queryParams.REGISTRY = this.getBarcode.bind(this)

            this.registryModel = new ValidatedContainerRegistry()
        },

        getNameModel: function() {
            this.name = this.getOption('pucknames').findWhere({ id: this.model.get('id') })
            if (this.name) {
                this.listenTo(this.name, 'change update', this.updateName)
                this.updateName()
            }
        },

        updateName: function() {
            if (this.name && this.name.get('name')) this.ui.name.text(' - '+this.name.get('name'))
        },
        
        updateCollection: function() {
            this.collection.reset(this.assigned.findWhere({ SAMPLECHANGERLOCATION: this.model.get('id').toString() }))
        },
        
        onRender: function() {
            this.updateName()

            if (this.collection.length > 0) {
                this.ui.barcode.hide()
            }
        },
        
        
    })
            
            
    var SampleChangerView = Marionette.CollectionView.extend({
        className: 'clearfix',
        childView: PositionView,
        childViewOptions: function() {
            return {
                assigned: this.getOption('assigned'),
                pucknames: this.getOption('pucknames'),
                bl: this.getOption('bl'),
            }
        }
    })

            
            
    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            rassigned: '.rassigned'
        },
        
        templateHelpers: function() {
            return {
                bl: this.getOption('bl'),
            }
        },
        
        refresh: function() {
            this.assigned.fetch()
        },
        
        initialize: function() {
            this.assigned = new Containers(null, { queryParams: { assigned: 1, bl: this.getOption('bl'), all: 1 }, state: { pageSize: 9999 } })
            this.assigned.fetch()
            
            this.pucknames = new PuckNames()
            this.pucknames.state.pageSize = 100
            this.pucknames.queryParams.bl = this.getOption('bl')
            this.pucknames.fetch()
        },
        
        onShow: function() {
            var pucks = this.getOption('bl') in app.config.pucks ? app.config.pucks[this.getOption('bl')] : 10

            var positions = new Backbone.Collection(_.map(_.range(1,pucks+1), function(i) { return { id: i } }))
            this.rassigned.show(new SampleChangerView({
                collection: positions,
                assigned: this.assigned,
                pucknames: this.pucknames,
                bl: this.getOption('bl')
            }))

        },
        
        onDestroy: function() {
            this.pucknames.stop()
        },
    })
    
})
