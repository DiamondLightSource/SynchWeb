define(['marionette', 
  'modules/shipment/views/puck',

  'collections/shipments',
  'collections/dewars',
  'collections/containers',

  'models/sample',
  'collections/samples',
  'modules/shipment/views/singlesample',

  'modules/shipment/collections/distinctproteins',

  'templates/imaging/subtosample.html',
  ], function(Marionette, Puck, 
    Shipments, Dewars, Containers, Sample, Samples, SingleSampleView, DistinctProteins,
    template) {
    
    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        regions: {
            pk: '.puck',
            ss: '.singlesample',
        },

        ui: {
            dewar: 'select[name=dewar]',
            shipment: 'select[name=shipment]',
            container: 'select[name=container]',
        },
        
        events: {
            'change @ui.shipment': 'refreshDewars',
            'change @ui.dewar': 'refreshContainers',
            'change @ui.container': 'refreshSamples',
        },
        
        updateShipments: function() {
            this.ui.shipment.html(this.shipments.opts())
            this.refreshDewars()
        },

        refreshDewars: function(e) {
            this.dewars.fetch()
        },
        
        updateDewars: function() {
            this.ui.dewar.html(this.dewars.opts())
            this.refreshContainers()
        },

        refreshContainers: function(e) {
            this.containers.fetch()
        },

        updateContainers: function() {
            this.ui.container.html(this.containers.opts())
            this.refreshSamples()
        },

        refreshSamples: function(e) {
            this.samples.fetch({ data: {'sort_by': 'POSITION' } })
        },




        getShipment: function() {
            return this.ui.shipment.val()
        },

        getDewar: function() {
            return this.ui.dewar.val()
        },

        getContainer: function() {
            return this.ui.container.val()
        },



        generateSamples: function() {
            var c = this.containers.findWhere({ CONTAINERID: this.ui.container.val() })

            var total = _.map(_.range(1, parseInt(c.get('CAPACITY'))+1), function(e) { return e.toString() })
            var diff = _.difference(total, this.samples.pluck('LOCATION'))
            _.each(diff, function(l) {
                this.samples.add(new Sample({ 
                    LOCATION: l.toString(), 
                    new: true 
                }))
            }, this)

            var s = this.samples.findWhere({ new: true })
            if (s) {
                s.set({ isSelected: true }) 
                this.puck.sampleSelected(s.get('LOCATION')-1)
            }

            this.setSample()
        },

        setSample: function() {
            var s = this.samples.findWhere({ isSelected: true })

            s.set({
                PROTEINID: this.model.get('PROTEINID'),
                BLSUBSAMPLEID: this.model.get('BLSUBSAMPLEID'),
                CONTAINERID: this.ui.container.val(),
                COMMENTS: this.model.get('COMMENTS') 
            })

            if (s) this.single.setModel(s)
        },

        initialize: function(options) {
            this.shipments = new Shipments(null, { state: { pageSize: 9999 } })
            this.listenTo(this.shipments, 'sync', this.updateShipments.bind(this))

            this.dewars = new Dewars(null, { state: { pageSize: 9999 } })
            this.listenTo(this.dewars, 'sync', this.updateDewars, this)
            this.dewars.queryParams.sid = this.getShipment.bind(this)

            this.containers = new Containers(null, { state: { pageSize: 9999 } })
            this.listenTo(this.containers, 'sync', this.updateContainers, this)
            this.containers.queryParams.did = this.getDewar.bind(this)

            this.samples = new Samples(null, { state: { pageSize: 9999 }})
            this.samples.queryParams.cid = this.getContainer.bind(this)
            this.listenTo(this.samples, 'sync', this.generateSamples, this)
            this.listenTo(this.samples, 'selected:change', this.setSample, this)

            this.proteins = new DistinctProteins()
            this.proteins.fetch()

            this.shipments.fetch()
        },

        onDomRefresh: function() {
            this.puck = new Puck({ collection: this.samples })
            console.log('puck', this.pk.$el)
            this.pk.show(this.puck)
            this.single = new SingleSampleView({ proteins: this.proteins, existingContainer: true })
            this.ss.show(this.single)
        },
        
    })

})