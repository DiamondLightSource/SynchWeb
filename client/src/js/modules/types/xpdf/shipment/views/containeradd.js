/**
 * The 'Add Container' view for XPDF experiments 
 */

define([
    'marionette',
    'modules/shipment/views/containeradd',
    'modules/types/xpdf/shipment/views/instancetable',
    'modules/shipment/views/plate',
    'collections/crystals',
    'modules/types/xpdf/shipment/views/sampletable',

    'modules/types/xpdf/shipment/collections/containertypes',

    'templates/types/xpdf/shipment/containeradd.html',
    'templates/types/xpdf/shipment/sampletablenew.html',
    'templates/types/xpdf/shipment/sampletablerownew.html'
    ], function(
        Marionette,
        GenericContainerAdd,
        InstanceTableView,
        PlateView,

        Crystals,
        SampleTableView,

        XpdfStageTypes,
        template,
        table,
        row
    ) {


    var ContainerAdd = GenericContainerAdd.extend({
        template: template,     
        
        // Override the plate types with the XPDF sample stages
        initialize: function(options) {
            ContainerAdd.__super__.initialize.call(this, options)
            this.ctypes = new XpdfStageTypes()

            this.crystals = new Crystals()
            this.crystals.fetch()
        },
        
        // Override the setType function with XPDF specific gubbins
        setType: function(e) {
            this.type = this.ctypes.findWhere({name: this.ui.type.val()})
            this.type.set({isSelected: true})
            this.model.set({
                CAPACITY: this.type.get('capacity'),
                CONTAINERTYPE: this.type.get('name'),
            })
            
            // Show type-specific elements
            this.puck.$el.css('width', app.mobile() ? '100%' : '50%')
            this.puck.show(new PlateView({ collection: this.samples, type: this.type, showValid: true }))
            this.buildCollection()
            this.stable = new SampleTableView({ crystals: this.crystals, proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table })
            this.table.show(this.stable)
            this.single.empty()
            this.ui.pc.show()
            
        },
        
        selectSample: function() {
        },        

    })

    return ContainerAdd
})
