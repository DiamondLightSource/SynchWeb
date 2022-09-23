define(['marionette', 'backbone',
        'collections/visits',
        'views/validatedrow',
        'utils/editable',
        'utils/forms',
    
        'modules/fault/models/system',
        'modules/fault/models/component',
        'modules/fault/models/subcomponent',
        'modules/fault/collections/systems',
        'modules/fault/collections/components',
        'modules/fault/collections/subcomponents',
        'modules/fault/collections/bls',

        'templates/fault/edit.html',
        'templates/fault/table.html',
        'templates/fault/tablerow.html',
        'templates/fault/tablerownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, Visits, ValidatedRow, Editable, forms, System, Component, Subcomponent, Systems, Components, Subcomponents, Beamlines, template, table, rowtemplate, rowtemplatenew) {
    
    var GridRow = ValidatedRow.extend(_.extend({}, forms, {
        getTemplate: function() {
            return this.model.get('new') || this.model.get('edit') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        events: {
            'click': 'rowClick',
            'click a.cancel': 'cancel',
            'click a.edit': 'edit',
        },

        edit: function(e) {
            e.preventDefault()
            this.model.set('edit', true)
            this.render()
        },


        cancel: function(e) {
            e.preventDefault()

            if (this.model.get('new')) {
                this.model.collection.remove(this.model)	
            } else {
                this.model.set('edit', false)
                this.render()
            }
        },

        rowClick: function(e) {
            if (this.model.get('new') || this.model.get('edit')) return
            this.trigger('row:click', this.model)
            this.$el.siblings('tr').removeClass('selected')
            this.$el.addClass('selected')

        },
        
        setData: function() {
            var data = {}
            _.each(['NAME', 'DESCRIPTION'], function(f) {
                data[f] = $('[name='+f+']').val()
            })

            data.BLS = this.$el.find('input[name=BLS]:checked').map(function() {return $(this).val()}).get() || []
            data.BEAMLINES = data.BLS.join(',')

            this.model.set(data)
        },

        success: function(m,r,o) {
            this.model.set('new', false)
            this.model.set('edit', false)
            //var self = this
            //this.model.fetch().done(function() {
            this.render()
            //})
        },
        
        error: function(m,r,o) {
            app.message('Something went wrong creating this dewar, please try again')
        },
        
        
        initialize: function() {
            this.showDewar = _.debounce(this.showDewar, 500)
        },
    
        onRender: function() {
            console.log('rendering row')
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this)
            
            var self = this
            if (this.model.get('edit') || this.model.get('new')) {
                var beamlines = new Beamlines()
                beamlines.fetch().done(function() {
                    var bls = self.model.get('BEAMLINES').split(',')
                    var bsel = ''
                    beamlines.each(function(b, i) {
                        var sel = _.indexOf(bls, b.get('NAME')) > -1 ? 'checked="checked"' : ''
                        bsel += '<label><input type="checkbox" name="BLS" value="'+b.get('NAME')+'" '+sel+' /> '+b.get('NAME')+'</label> '
                    })	
                    self.$el.find('td.bls').html(bsel)
                })
                
            }

        },
        
    }))


    var EmptyView = Marionette.ItemView.extend({
        tagName: 'tr',
    })
        
    var TableView = Backbone.Marionette.CompositeView.extend({
        tagName: "table",
        template: table,
        childView: GridRow,
        

        childEvents: {
            'row:click': 'rowClick',
        },

        rowClick: function(view, m) {
            this.trigger('row:click', m)
        },


    })


    var EmptySystemsView = EmptyView.extend({
        template: _.template('<td colspan="6">No systems defined</td>')
    })

    var SystemsView = TableView.extend({
        emptyView: EmptySystemsView,
        className: 'systems',
    })


    var EmptyComponentsView = EmptyView.extend({
        template: _.template('<td colspan="6">Select a system to see its components</td>')
    })

    var ComponentsView = TableView.extend({
        emptyView: EmptyComponentsView,
        className: 'components',
    })


    var EmptySubComponentsView = EmptyView.extend({
        template: _.template('<td colspan="6">Select a component to see its subcomponents</td>')
    })

    var SubComponentsView = TableView.extend({
        emptyView: EmptySubComponentsView,
        className: 'subcomponents',
    })



    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: {
            sys: '.systems',
            comp: '.components',
            scomp: '.subcomponents',
        },

        events: {
            'click .add_system': 'addSystem',
            'click .add_component': 'addComponent',
            'click .add_subcomponent': 'addSubcomponent',
        },

        addSystem: function(e) {
            e.preventDefault()
            this.systems.add(new System({
                new: true
            }))
        },

        addComponent: function(e) {
            e.preventDefault()

            if (!this.sid) return

            var bls = this.systems.findWhere({ SYSTEMID: this.sid })
            this.components.add(new Component({
                SYSTEMID: this.sid,
                BEAMLINES: bls ? bls.get('BEAMLINES') : '',
                new: true,
            }))
        },

        addSubcomponent: function(e) {
            e.preventDefault()

            console.log('cid', this.comid)
            if (!this.comid) return

            var bls = this.components.findWhere({ COMPONENTID: this.comid })
            this.subcomponents.add(new Subcomponent({
                COMPONENTID: this.comid,
                BEAMLINES: bls ? bls.get('BEAMLINES') : '',
                new: true,
            }))
        },

        setSystem: function(m) {
            console.log('set sys', m)
            this.sid = m.get('SYSTEMID')
            if (this.sid) this.components.fetch()
        },

        setComponent: function(m) {
            console.log('set comp', m)
            this.comid = m.get('COMPONENTID')
            if (this.comid) this.subcomponents.fetch()
        },


        initialize: function(options) {
            this.systems = new Systems()
            this.systems.fetch()	

            var self = this
            this.components = new Components()
            this.components.queryParams.sid = function() {
                return self.sid
            }

            this.subcomponents = new Subcomponents()
            this.subcomponents.queryParams.cid = function() {
                return self.comid
            }
        },

        onRender: function(){
            var sysview = new SystemsView({ collection: this.systems })
            this.listenTo(sysview, 'row:click', this.setSystem, this)
            this.sys.show(sysview)

            var compview = new ComponentsView({ collection: this.components })
            this.listenTo(compview, 'row:click', this.setComponent, this)
            this.comp.show(compview)

            this.scomp.show(new SubComponentsView({ collection: this.subcomponents }))
        },

    })

})