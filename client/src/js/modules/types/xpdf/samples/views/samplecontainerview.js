/**
 * Recursively view and edit containers
 */

define([
    'marionette',
    'backgrid',
    'views/table',
    'utils/table',
    'models/samplegroup',
    'models/samplegroupsample',
    'collections/samplegroupsamples',
    'collections/samplegroups',
    'modules/types/xpdf/collections/instances',
    ], function(
        Marionette,
        Backgrid,
        TableView,
        table,
        SampleGroup,
        SampleGroupSample,
        SampleGroupSamples,
        SampleGroups,
        Instances
    ){
    

    var InstanceCell = Backgrid.Cell.extend({
        events: {
            'change select[name=BLSAMPLEID]': 'updateSample',
        },

        updateSample: function() {
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
            const self = this
            this.model.save({}, {
                success: function() {
                    const collection = self.model.collection
                    collection.fetch().then(() => {
                        collection.add(new SampleGroupSample({
                           TYPE: 'container',
                           GROUPORDER: collection.models.length + 1,
                           BLSAMPLEGROUPID: self.model.id,
                           BLSAMPLEID: null
                       }))
                    })
                },
                error: function() {
                    app.alert({ message: 'Could not add sample. Check if it has not been added before' })
                }
            })
        },

        removeModel: function(e) {
            e.preventDefault()
            this.model.destroy()
        },

        render: function() {
            if (this.model.get('BLSAMPLEID') && this.model.get('BLSAMPLEID') !== this.column.get('PARENTBLSAMPLEID')) {
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
        template: _.template('<h3>Group: <%-INDEX%></h3><div class="members"></div>'),
        regions: {
            rmembers: '.members',
        },

        initialize() {
            this.collection = new SampleGroupSamples(null, { state: { pageSize: 9999 }, sampleGroupId: this.model.id })
            this.deferred = []
            this.deferred.push(this.collection.fetch())
        },

        onRender: function() {
            $.when.apply($, this.deferred).then(this.doOnRender.bind(this))
        },

        templateHelpers: function() {
            return {
                INDEX: this.model.collection.indexOf(this.model) + 1
            }
        },

        doOnRender: function() {
            this.collection.add(new SampleGroupSample({
                TYPE: 'container',
                GROUPORDER: this.collection.models.length + 1,
                BLSAMPLEGROUPID: this.model.id,
                BLSAMPLEID: null
            }))

            this.rmembers.show(new TableView({
                collection: this.collection,
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
            this.deferred = []
            if (!options.collection) {
                // Get samplegroups
                this.collection = new SampleGroups(null, { state: { pageSize: 9999 } })
                this.collection.queryParams.BLSAMPLEID = options.parent.get('BLSAMPLEID')
            }
            this.deferred.push(this.collection.fetch())

            if (!options.containers) {
                // Get sample containers
                this.options.containers = new Instances()
                this.options.containers.queryParams.lt = 1
                this.deferred.push(this.options.containers.fetch())
            }
        },


        createGroup: function(e) {
            e.preventDefault()
            const p = this.getOption('parent')
            const sampleGroup = new SampleGroup()
            const self = this
            sampleGroup.save({}, {
                success: (result) => {
                    const sampleGroupSample = new SampleGroupSample({
                        BLSAMPLEGROUPID:  result.get('BLSAMPLEGROUPID'),
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

                    sampleGroupSample.save({}, {
                        success: () => {
                            self.collection.fetch()
                        }
                    })
                }
            })
        },

        onRender: function() {
            $.when.apply($, this.deferred).then(this.doOnRender.bind(this))
        },

        doOnRender() {
            this.rgroups.show(new SampleGroupsView({
                collection: this.collection,
                childViewOptions: {
                    containers: this.getOption('containers'),
                    PARENTBLSAMPLEID: this.getOption('parent').get('BLSAMPLEID')
                }
            }))
        }
    })
})
