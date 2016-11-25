define(['marionette',
    'modules/shipment/collections/distinctproteins',
    
    'models/sample',
    'collections/samples',
    'modules/shipment/views/puck',
    'modules/shipment/views/sampletable',

    'modules/shipment/collections/platetypes',
    'modules/shipment/views/plate',

    'utils/editable',
    'tpl!templates/shipment/container.html'], function(Marionette,
        
    DistinctProteins,
    Sample,
    Samples,
    PuckView,
    SampleTableView,

    PlateTypes,
    PlateView,
        
    Editable, template){
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: {
            table: '.table',
            puck: '.puck',
        },
        
        ui: {
            ext: '.extrainfo',
        },

        events: {
            'click @ui.ext': 'toggleExtra',
        },


        toggleExtra: function (e) {
            e.preventDefault()
            this.table.currentView.toggleExtra()
        },


        initialize: function(options) {
            var self = this
            this.samples = new Samples([], { containerID: options.model.get('CONTAINERID'), state: {pageSize: 9999} })
            this._ready = this.samples.fetch({ data: {'sort_by': 'POSITION' } }).done(function() {
                console.log('samples')
                var total = _.map(_.range(1, parseInt(self.model.get('CAPACITY'))+1), function(e) { return e.toString() })
                var diff = _.difference(total, self.samples.pluck('LOCATION'))
                _.each(diff, function(l) {
                    self.samples.add(new Sample({ LOCATION: l.toString(), PROTEINID: -1, CONTAINERID: options.model.get('CONTAINERID'), new: true }))
                })
            })
            
            this.proteins = new DistinctProteins()
            this.proteins.fetch()
            
            Backbone.Validation.bind(this)
        },

        
        onRender: function() {  
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('COMMENTS', 'text')
            edit.create('EXPERIMENTTYPE', 'text')
            edit.create('STORAGETEMPERATURE', 'text')
            edit.create('BARCODE', 'text')
        },
        
        onShow: function() {
            this._ready.done(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
            console.log(self.samples)

            var type = this.model.get('CONTAINERTYPE') == 'PCRStrip' ? 'non-xtal' : ''
            
            if (this.model.get('CONTAINERTYPE') == 'PCRStrip') {
                this.$el.find('.puck').css('width', '50%')
                // this.puck.$el.width(this.puck.$el.parent().width()/2)
                this.type = PlateTypes.findWhere({ name: this.model.get('CONTAINERTYPE') })
                this.puck.show(new PlateView({ collection: this.samples, type: this.type }))
            } else this.puck.show(new PuckView({ collection: this.samples }))
            this.table.show(new SampleTableView({ proteins: this.proteins, collection: this.samples, in_use: (this.model.get('CONTAINERSTATUS') === 'processing'), type: type }))
        }
    })

})