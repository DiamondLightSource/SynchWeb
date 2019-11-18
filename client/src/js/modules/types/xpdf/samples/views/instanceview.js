/**
 *  The Sample view class for XPDF proposals
 */

define(['marionette',
    'backbone',
    'utils/editable',
    'collections/datacollections',
    'modules/dc/views/getdcview',
    'modules/types/xpdf/utils/phasecompositor',
    'modules/types/xpdf/samples/views/phasetable',
    'modules/types/xpdf/samples/views/samplecontainerview',
    'collections/samplegroups',
    'modules/types/xpdf/collections/instances',
    'templates/types/xpdf/samples/instance.html',
    ], function(Marionette,
        Backbone,
        Editable,
        DCCol,
        GetDCView,
        phaseCompositor,
        PhaseTableView,
        SampleContainersView,
        SampleGroups,
        Instances,
        template) {

    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            history: '.history',
            rcont: '.containers',
            rphases: '.phases',
        },

        ui: {
            EXPERIMENTALDENSITY: '.EXPERIMENTALDENSITY',
            COMPOSITION: '.COMPOSITION'
        },
    

        initialize: function(options) {
            // bind the validation
            Backbone.Validation.bind(this)
                        
            // Data collections for this sample
            this.dcs = new DCCol(null, { queryParams: {sid: this.model.get('BLSAMPLEID'), state: { pageSize: 5  } } })
            this.dcs.fetch()

            // Get samplegroups
            this.groups = new SampleGroups()
            this.groups.queryParams.BLSAMPLEID = this.model.get('BLSAMPLEID')
            this.groups.fetch()

            // Get sample containers
            this.containers = new Instances()
            this.containers.queryParams.lt = 1
            this.containers.fetch()
        },
        
        onRender: function() {
            // Create the editable fields
            var edit = new Editable( { model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            edit.create('COMMENTS', 'text')
            edit.create('CODE', 'text')
            edit.create('PACKINGFRACTION', 'text')
            edit.create('LOOPTYPE', 'select', { data: { 0: 'No', 1: 'Yes' } })

            edit.create('DIMENSION1', 'text')
            edit.create('DIMENSION2', 'text')
            edit.create('DIMENSION3', 'text')
            edit.create('SHAPE', 'text')


            // Show the Data Collections in the history region
            this.history.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true}))
            
            // Show the phase table
            this.rphases.show(new PhaseTableView({ collection: this.model.get('components'), editable: false }))
            
            // Show the sample containers
            this.rcont.show(new SampleContainersView({ 
                collection: this.groups, 
                containers: this.containers,
                parent: this.model,
            }))

            // Watch for model changes
            this.listenTo(this.model, 'change:COMPOSITION', this.updateComposition)
            this.listenTo(this.model, 'change:EXPERIMENTALDENSITY', this.updateExpDensity)

        },


        updateComposition: function() {
            this.ui.COMPOSITION.text(this.model.get('COMPOSITION'))
        },

        updateExpDensity: function() {
            this.ui.EXPERIMENTALDENSITY.text(this.model.get('EXPERIMENTALDENSITY'))
        },
        
    })
})

