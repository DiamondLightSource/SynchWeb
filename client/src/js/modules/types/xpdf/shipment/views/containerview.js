/*
 * View an XPDF sample changer
 */

define([
    'marionette',
    'collections/crystals',
    'modules/types/xpdf/collections/instances',
    'modules/shipment/views/container',
    'modules/shipment/views/plate',
    'modules/types/xpdf/shipment/views/sampletable',
    'modules/types/xpdf/shipment/collections/containertypes',
    'templates/types/xpdf/shipment/containerview.html'
    ], function(
        Marionette,
        Crystals,
        Instances,
        GenericContainerView,
        PlateView,
        SampleTableView,
        PlateTypes,
        template
        ) {


    var ContainerView = GenericContainerView.extend({
        template: template,   

        createSamples: function() {
            this.samples = new Instances(null, { state: { pageSize: 9999, addPrimary: true } })
            this.samples.queryParams.seq = 1
        },

        initialize: function(options) {
            ContainerView.__super__.initialize.call(this, options)

            this.crystals = new Crystals()
            this.crystals.fetch()
        },
        
        onShow: function() {
            this._ready.done(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
            console.log('Showing XPDF container')
            this.types = new PlateTypes()
            this.type = this.types.findWhere({ name: this.model.get('CONTAINERTYPE') })

            if (this.type.get('capacity') > 1) {
                this.$el.find('.puck').css('width', '50%')
                this.puck.show(new PlateView({ collection: this.samples, type: this.type }))
            } 

            this.table.show(new SampleTableView({ collection: this.samples, crystals: this.crystals, proteins: this.proteins }))
        }
    
    })

    return ContainerView
})
