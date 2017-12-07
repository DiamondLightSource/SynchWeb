/**
 * Recursively view and edit containers
 */

define([
    'marionette',
    'backgrid',
    'views/table',
    'utils/table',
    'models/samplegroup',
    'collections/samplegroups',
    'modules/types/xpdf/models/instance',
    'modules/types/xpdf/collections/instances',
    ], function(
        Marionette,
        Backgrid,
        TableView,
        table,
        SampleGroupMember,
        SampleGroups,
        Instance,
        Instances
    ){
    

    var InstanceCell = Backgrid.Cell.extend({
        events: {
            'change select[name=BLSAMPLEID]': 'updateSample',
        },

        updateSample: function() {
            console.log('update sample')
            var c = this.column.get('containers').findWhere({ BLSAMPLEID: this.$el.find('select[name=BLSAMPLEID]').val() })
            if (c) {
                this.model.set({
                    BLSAMPLEID: c.get('BLSAMPLEID'),
                    SAMPLE: c.get('NAME'),
                    CRYSTAL: c.get('CRYSTAL'),
                    PACKINGFRACTION: c.get('PACKINGFRACTION'),
                    THEORETICALDENSITY: c.get('THEORETICALDENSITY'),
                    DIMENSION1: c.get('DIMENSION1'),
                    DIMENSION2: c.get('DIMENSION2'),
                    DIMENSION3: c.get('DIMENSION3'),
                    SHAPE: c.get('SHAPE'),
                })
            }
        },

        initialize: function(options) {
            InstanceCell.__super__.initialize.call(this, options)

            if (this.column.get('containers')) {
                this.listenTo(this.column.get('containers'), 'sync add remove reset', this.render)
            }
        },

        render: function() {
            if (this.model.isNew()) {
                this.$el.html('<select name="BLSAMPLEID">'+this.column.get('containers').opts({ empty: true })+'<select>')
                this.$el.find('select[name=BLSAMPLEID]').val(this.model.get('BLSAMPLEID'))
            } else {
                this.$el.text(this.model.get('SAMPLE'))
            }

            return this
        }
    })


    var ViewCell = Backgrid.Cell.extend({
        events: {
            'click a.save': 'saveModel',
            'click a.remove': 'removeModel',
        },

        saveModel: function(e) {
            e.preventDefault()
            var self = this
            this.model.save({}, {
                success: function(model, resp) {
                    // TODO: should be a better way to do this
                    delete self.model.collection
                    self.model.parent.add(self.model)
                    
                    // TODO: Could be a better place to assign the dimensions
                    // But here will do?
                    var containingInst = self.model
                    var wrappedMember = self.model.parent.at(self.model.parent.length-2)
                    var wrappedInst = new Instance({BLSAMPLEID: wrappedMember.get("BLSAMPLEID")})
                    
                    // Copy across dimension if appropriate
                    // 'Appropriate' currently means a cylinder
                    if (containingInst.get('SHAPE') === 'cylinder' && (wrappedMember.get('SHAPE') === null || wrappedMember.get('SHAPE') === 'cylinder')) {
                    	wrappedInst.set({'SHAPE': 'cylinder'})
                    	// inner dimension. Set to zero, unless already non-null
                    	if (wrappedMember.get('DIMENSION1') === null) wrappedInst.set({'DIMENSION1': 0.0})
                    	if (wrappedMember.get('DIMENSION1') !== null && wrappedMember.get('DIMENSION1') > containingInst.get('DIMENSION1')) {
                    		console.error('Contained instance is already larger than the inner radius of the container.')
                    	} else {
                        	// the outer radius of the wrapped instance is the inner radius of the container
                    		// the lengths are equal
                    		wrappedInst.set({'DIMENSION2': containingInst.get('DIMENSION1')}) 
                    	}
                    	if (wrappedMember.get('DIMENSION3') === null || wrappedMember.get('DIMENSION3') > containingInst.get('DIMENSION3'))
                    		wrappedInst.set({'DIMENSION3': containingInst.get('DIMENSION3')})

                    	wrappedInst.save({
                    		'SHAPE': wrappedInst.get('SHAPE'),
                    		'DIMENSION1': wrappedInst.get('DIMENSION1'),
                    		'DIMENSION2': wrappedInst.get('DIMENSION2'),
                    		'DIMENSION3': wrappedInst.get('DIMENSION3'),
                    		}, {patch:true})
                    }
                }
            })
        },

        removeModel: function(e) {
            e.preventDefault()
            this.model.destroy()
        },

        render: function() {
            console.log('render', this.model, this.model.collection)
            if (this.model.get('BLSAMPLEID') && this.model.get('BLSAMPLEID') != this.column.get('PARENTBLSAMPLEID')) {
                this.$el.html('<a class="button" href="/instances/sid/'+this.model.get('BLSAMPLEID')+'"><i class="fa fa-search"></i></a>')
                this.$el.append(' <a class="button remove" href="#"><i class="fa fa-times"></i></a>')
            }

            if (this.model.isNew()) {
                this.$el.html('<a class="button save" href="#"><i class="fa fa-check"></i></a>')
            }

            return this
        }
    })


    var SampleGroupView = Marionette.LayoutView.extend({
        template: _.template('<h3>Group: <%-INDEX%><h3><div class="members"></div>'),
        regions: {
            rmembers: '.members',
        },

        templateHelpers: function() {
            return {
                INDEX: this.model.collection.indexOf(this.model) + 1
            }
        },

        onRender: function() {
            console.log('render members', this.model)
            this.rmembers.show(new TableView({
                collection: this.model.get('MEMBERS'),
                columns: [
                    { name: 'SAMPLE', label: 'Name', cell: InstanceCell, editable: false, containers: this.getOption('containers') },
                    { name: 'GROUPORDER', label: 'Order', cell: 'string', editable: false },
                    { name: 'CRYSTAL', label: 'Instance of', cell: 'string', editable: false },
                    { name: 'TYPE', label: 'Type', cell: 'string', editable: false },
                    { label: 'Exp. Density', cell: table.TemplateCell, editable: false, template: '<% if (BLSAMPLEID) { %><%-(THEORETICALDENSITY*PACKINGFRACTION).toFixed(3)%><% } %>' },
                    { label: 'Dimensions', cell: table.TemplateCell, editable: false, template: '<% if (DIMENSION1) { %><%-DIMENSION1%> x <%-DIMENSION2%> x <%-DIMENSION3%><% } %>' },
                    { label: '', cell: ViewCell, editable: false, PARENTBLSAMPLEID: this.getOption('PARENTBLSAMPLEID') },
                ],

                pages: false,
            }))
        },

    })


    var EmptyGroupView = Marionette.ItemView.extend({
        template: _.template('This instance is not in any groups yet')
    })


    var SampleGroupsView = Marionette.CollectionView.extend({
        childView: SampleGroupView,
        emptyView: EmptyGroupView,
    })


    return Marionette.LayoutView.extend({
        template: _.template('<div class="ra"><a href="#" class="button new"><i class="fa fa-plus"></i> <span>Create Group</span></div><div class="groups"></div>'),
        regions: {
            rgroups: '.groups',
        },

        events: {
            'click a.new': 'createGroup',
        },

        initialize: function(options) {
            if (!options.collection) {
                // Get samplegroups
                this.collection = new SampleGroups()
                this.collection.queryParams.BLSAMPLEID = options.parent.get('BLSAMPLEID')
                this.collection.fetch()
            }

            if (!options.containers) {
                // Get sample containers
                this.options.containers = new Instances()
                this.options.containers.queryParams.lt = 1
                this.options.containers.fetch()
            }
        },


        createGroup: function(e) {
            e.preventDefault()
            var p = this.getOption('parent')
            var m = new SampleGroupMember({
                BLSAMPLEID: p.get('BLSAMPLEID'),
                TYPE: 'sample',
                GROUPORDER: 1,
                SAMPLE: p.get('NAME'),
                CRYSTAL: p.get('CRYSTAL'),
                PACKINGFRACTION: p.get('PACKINGFRACTION'),
                THEORETICALDENSITY: p.get('THEORETICALDENSITY'),
                DIMENSION1: p.get('DIMENSION1'),
                DIMENSION2: p.get('DIMENSION2'),
                DIMENSION3: p.get('DIMENSION3'),
            })

            var self = this
            m.save({}, {
                success: function() {
                    self.collection.add(m)
                }
            })
        },

        onRender: function() {
            this.rgroups.show(new SampleGroupsView({ 
                collection: this.collection.groups(),
                childViewOptions: {
                    containers: this.getOption('containers'),
                    PARENTBLSAMPLEID: this.getOption('parent').get('BLSAMPLEID')
                }
            }))
        }
    })


})
