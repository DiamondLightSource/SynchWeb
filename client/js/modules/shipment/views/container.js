define(['marionette',
    'modules/shipment/collections/distinctproteins',
    
    'models/sample',
    'collections/samples',
    'modules/shipment/views/puck',
    'modules/shipment/views/sampletable',
    
    'modules/shipment/collections/platetypes',
    'modules/shipment/views/plate',
    'modules/shipment/views/singlesample',
    
    'utils/editable',
    'tpl!templates/shipment/container.html'], function(Marionette,
        
    DistinctProteins,
    Sample,
    Samples,
    PuckView,
    SampleTableView,
        
    PlateTypes,
    PlateView,
    SingleSample,
        
    Editable, template){
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: {
            table: '.table',
            puck: '.puck',
            sample: '.singlesamp',
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
            this.listenTo(this.samples, 'selected:change', this.selectSample)
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
            this.ctypes = PlateTypes
            
            Backbone.Validation.bind(this)
        },

        
        selectSample: function() {
            if (this.model.get('CONTAINERTYPE') != 'Puck') {
                var s = this.samples.findWhere({ isSelected: true })
                if (s) {
                    this.singlesample.setModel(s)
                    console.log('select sample', s)
                }
            }
        },
        
        onRender: function() {  
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
        },
        
        onShow: function() {
            this._ready.done(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
            console.log(self.samples)
            
            if (['Puck', null].indexOf(this.model.get('CONTAINERTYPE')) > -1) {
                this.puck.show(new PuckView({ collection: this.samples }))
                this.table.show(new SampleTableView({ proteins: this.proteins, collection: this.samples, in_use: (this.model.get('CONTAINERSTATUS') === 'processing') }))
                
                
            } else {
                this.$el.find('.puck').css('width', '50%')
                this.type = this.ctypes.findWhere({ name: this.model.get('CONTAINERTYPE') })
                this.puck.show(new PlateView({ collection: this.samples, type: this.type, showStatus: true }))
                this.singlesample = new SingleSample({ proteins: this.proteins })
                this.samples.at(0).set({isSelected: true})
                this.sample.show(this.singlesample)
            }
        }
    })

})