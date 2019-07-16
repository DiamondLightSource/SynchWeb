define(['marionette', 'backbone', 'backgrid', 'views/table', 'views/filter',
        'utils/editable',

        'modules/imaging/models/screencomponentgroup',
        'modules/imaging/collections/screencomponentgroups',

        'modules/imaging/models/screencomponent',
        'modules/imaging/collections/screencomponents',
        'modules/imaging/views/screencomponentgroup',

        'modules/shipment/collections/platetypes',
        'modules/shipment/views/plate',

        'tpl!templates/imaging/screencomps.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, Backgrid, TableView, FilterView, Editable,
        ComponentGroup, ComponentGroups, Component, Components, GroupView, PlateType, PlateView,
        template) {
      

    var ComponentCell = Backgrid.Cell.extend({

    })


    
    return Backbone.Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            group: '.group',
            plate: '.plate',
        },

        events: {
            'click button.submit': 'saveGroups',
        },

        modelEvents: {
            'change:CAPACITY': 'updatePositions',
        },

        initialize: function(options) {
            Backbone.Validation.bind(this);
            
            this.collection = new ComponentGroups()
            this.collection.queryParams.scid = this.model.get('SCREENID')
            this.listenTo(this.collection, 'change:isSelected', this.setGroup, this)
            this.collection.fetch()

            this.components = new Components(null, { state: { pageSize: 9999 }})
            this.components.queryParams.scid = this.model.get('SCREENID')
            this.components.fetch()

            this.positions = []
            this.updatePositions()
        },

        updatePositions: function(e) {
            var pos = []
            _.each(_.range(this.model.get('CAPACITY')), function(i) {
                pos.push({ id: i+1, name: i+1 })
            }, this)
            this.positions = pos
        },
        
        setGroup: function(pos) {
            var s = this.collection.findWhere({ POSITION: pos.toString() })
            if (s) this.groupview.setModel(s)
            else {
                var g = new ComponentGroup({
                    SCREENID: this.model.get('SCREENID'),
                    POSITION: pos.toString(),
                    new: true,
                })
                this.collection.add(g)
                this.groupview.setModel(g)
            }
        },

        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('CAPACITY', 'text')
            edit.create('GLOBAL', 'select', { data: { 'Yes': 1, 'No': 0 } })

            this.groupview = new GroupView({ components: this.components, editable: app.prop == this.model.get('PROP') })
            this.group.show(this.groupview)

            this.filterview = new FilterView({ filters: this.positions, url: false, className: 'fixed' })
            this.listenTo(this.filterview, 'selected:change', this.setGroup, this)
            this.plate.show(this.filterview)
        },


        saveGroups: function(e) {
            e.preventDefault()
            console.log('save groups')
            this.collection.save({
                success: this.onSave.bind(this),
                error: function() {
                    app.alert({ message: 'Something went wrong registering the groups' })
                }
            })
        },

        onSave: function(resp) {
            console.log('groups saved', this.collection)
            if (this.components.length) {
                this.collection.each(function(g) {
                    g.set({ new: false })
                    var cs = this.components.where({ POSITION: g.get('POSITION') })
                    console.log('assigning group ids', g.get('SCREENCOMPONENTGROUPID'), this.components, g.get('POSITION'), cs)
                    _.each(cs, function(c) {
                        c.set('SCREENCOMPONENTGROUPID', g.get('SCREENCOMPONENTGROUPID'))
                    })
                }, this)

                this.components.save({
                    success: this.onSaveCollection.bind(this),
                    failure: function() {
                        app.alert({ message: 'Something went wrong registering the group components' })
                    }
                })

            }
        },

        onSaveCollection: function() {
            this.components.each(function(m,i) {
                m.set({ new: false })
            })
        },
    })
    

})