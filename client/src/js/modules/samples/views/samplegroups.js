define(['backbone', 'marionette', 'backgrid',
    'collections/shipments',
    'collections/dewars',
    'collections/containers',
    'collections/samples',
    'collections/samplegroups',
    'models/samplegroup',
    'views/table',
    'templates/samples/samplegroup.html'
    ], function(
    Backbone, Marionette, Backgrid,
    Shipments, Dewars, Containers, Samples,
    SampleGroups, SampleGroup,
    TableView,
    template) {


    var InstanceCell = Backgrid.Cell.extend({
        events: {
            'change select[name=BLSAMPLEID]': 'updateSample',
        },

        updateSample: function() {
            console.log('update sample')
            var c = this.column.get('samples').findWhere({ BLSAMPLEID: this.$el.find('select[name=BLSAMPLEID]').val() })
            if (c) {
                this.model.set({
                    BLSAMPLEID: c.get('BLSAMPLEID'),
                    SAMPLE: c.get('NAME'),
                    PROTEIN: c.get('PROTEIN'),
                })
            }
        },

        initialize: function(options) {
            InstanceCell.__super__.initialize.call(this, options)

            if (this.column.get('samples')) {
                this.listenTo(this.column.get('samples'), 'sync add remove reset', this.render)
            }
        },

        render: function() {
            if (this.model.isNew()) {
                var opts = this.column.get('samples').map(function(s) {
                    return '<option value="'+s.get('BLSAMPLEID')+'">'+s.get('LOCATION')+': '+s.get('NAME')+'</option>'
                })

                opts += '<option value="">-</option>'

                this.$el.html('<select name="BLSAMPLEID">'+opts+'<select>')
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

    var TypeCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.html(this.model.get('TYPE'))

            if (this.model.isNew()) {
                this.$el.html('<select name="TYPE"></select>')
                var opts = []
                _.each(['sample', 'background', 'buffer'], function(ty) {
                    opts.push('<option value="'+ty+'">'+ty+'</option>')
                })

                this.$el.find('select').html(opts.join(''))
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
            this.rmembers.show(new TableView({
                collection: this.model.get('MEMBERS'),
                columns: [
                    { name: 'SAMPLE', label: 'Name', cell: InstanceCell, editable: false, samples: this.getOption('samples') },
                    { name: 'GROUPORDER', label: 'Order', cell: 'string', editable: false },
                    { name: 'PROTEIN', label: 'Component', cell: 'string', editable: false },
                    { name: 'TYPE', label: 'Type', cell: TypeCell, editable: false },
                    { label: '', cell: ViewCell, editable: false, PARENTBLSAMPLEID: this.getOption('PARENTBLSAMPLEID') },
                ],

                pages: false,
            }))
        },

    })


    var EmptyGroupView = Marionette.ItemView.extend({
        template: _.template('This sample is not in any groups yet')
    })


    var SampleGroupsView = Marionette.CollectionView.extend({
        childView: SampleGroupView,
        emptyView: EmptyGroupView,
    })

    var SSampleGroups = SampleGroups.extend({
        newType: 'sample',
    })

    return Marionette.LayoutView.extend({
        template: template,

        regions: {
            wrapper: '.wrapper',
        },

        events: {
            'click a.add': 'createGroup',
            'change @ui.shipment': 'changeShipment',
            'change @ui.dewae': 'changeDewar',
            'change @ui.container': 'changeContainer',
        },

        ui: {
            shipment: 'select[name=SHIPMENT]',
            dewar: 'select[name=DEWAR]',
            container: 'select[name=CONTAINER]',
        },

        updateShipments: function() {
            this.ui.shipment.html(this.shipments.opts())
            if (this.first) this.ui.shipment.val(this.sample.get('SHIPPINGID'))
            this.changeShipment()
        },

        changeShipment: function() {
            this.dewars.fetch().done(this.updateDewars.bind(this))
        },

        updateDewars: function() {
            this.ui.dewar.html(this.dewars.opts())
            if (this.first) this.ui.dewar.val(this.sample.get('DEWARID'))
            this.changeDewar()
        },

        changeDewar: function() {
            this.containers.fetch().done(this.updateContainers.bind(this))
        },

        updateContainers: function() {
            this.ui.container.html(this.containers.opts())
            if (this.first) {
                this.ui.container.val(this.sample.get('CONTAINERID'))
                this.first = false
            }
            this.changeContainer()
        },

        changeContainer: function() {
            this.samples.fetch()
        },

        getContainer: function() {
            return this.ui.container.val()
        },

        getDewar: function() {
            return this.ui.dewar.val()
        },

        getShipment: function() {
            return this.ui.shipment.val()
        },

        createGroup: function(e) {
            e.preventDefault()

            var group = new SampleGroup({
                BLSAMPLEID: this.getOption('BLSAMPLEID'),
                TYPE: 'sample',
            })
            group.save().done(this.fetchGroups.bind(this))
        },

        fetchGroups: function() {
            this.samplegroups.fetch()
        },

        initialize: function(options) {
            this.first = true
            this.sample = options.sample
            this.samplegroups = new SSampleGroups()

            this.samplegroups.queryParams.BLSAMPLEID = this.sample.get('BLSAMPLEID')
            this.fetchGroups()

            this.shipments = new Shipments()
            this.listenTo(this.shipments, 'sync', this.updateShipments)

            this.dewars = new Dewars()
            this.dewars.queryParams.sid = this.getShipment.bind(this)

            this.containers = new Containers()
            this.containers.queryParams.did = this.getDewar.bind(this)

            this.samples = new Samples()
            this.samples.queryParams.cid = this.getContainer.bind(this)

            this.shipments.fetch()
        },

        onRender: function() {
            this.wrapper.show(new SampleGroupsView({ 
                collection: this.samplegroups.groups(),
                childViewOptions: {
                    samples: this.samples,
                }
            }))
        }
    })

})
