define(['marionette',
    'modules/shipment/collections/distinctproteins',
    'utils/sgs',
    'utils/anoms',
    'utils/editable',
    'collections/datacollections',
    'modules/dc/datacollections',

    'modules/imaging/collections/inspectionimages',
    'modules/imaging/views/imagehistory',

    'tpl!templates/samples/sample.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, DistinctProteins, SG, Anom, Editable, DCCol, DCView, 
        InspectionImages, ImageHistoryView,
        template, Backbone) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            history: '.history',
            imh: '.im_history',
        },
        
        initialize: function(options) {
            Backbone.Validation.bind(this);
          
            this.dcs = new DCCol(null, { queryParams: { sid: this.model.get('BLSAMPLEID'), pp: 5 } })
            this.dcs.fetch()

            this.inspectionimages = new InspectionImages()
            this.inspectionimages.queryParams.sid = this.model.get('BLSAMPLEID')
            this.inspectionimages.fetch()
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            //edit.create('ACRONYM', 'select')
            edit.create('SPACEGROUP', 'select', { data: SG.obj() })
            edit.create('ANOMALOUSSCATTERER', 'select', { data: Anom.obj() })
            edit.create('COMMENTS', 'text')
            edit.create('CODE', 'text')

            _.each(['CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'REQUIREDRESOLUTION'], function(f, i) {
                edit.create(f, 'text')
            })

            this.distinct = new DistinctProteins()
            var self = this
            this.distinct.fetch().done(function() {
                var opts = _.map(self.distinct.kv(), function(v,k) { return { value: v, id: k } })
                edit.create('PROTEINID', 'autocomplete', { autocomplete: { source: opts } })
            })
            
            this.history.show(new DCView({ model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))

            this.imh.show(new ImageHistoryView({ historyimages: this.inspectionimages, embed: true }))
        },
        
    })
        
})
