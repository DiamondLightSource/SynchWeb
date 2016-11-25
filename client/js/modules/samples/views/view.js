define(['marionette',
    'modules/shipment/collections/distinctproteins',
    'utils/sgs',
    'utils/anoms',
    'utils/editable',
    'collections/datacollections',
    // 'modules/dc/datacollections',
    'modules/dc/views/getdcview',

    'modules/samples/views/componentsview',

    'modules/imaging/collections/inspectionimages',
    'modules/imaging/views/imagehistory',

    'tpl!templates/samples/sample.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, DistinctProteins, SG, Anom, Editable, DCCol, GetDCView, 
        ComponentsView,
        InspectionImages, ImageHistoryView,
        template, Backbone) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            history: '.history',
            imh: '.im_history',
            comps: '.components',
        },

        ui: {
            comp: 'input[name=COMPONENTID]',
        },
        
        initialize: function(options) {
            Backbone.Validation.bind(this);
          
            this.dcs = new DCCol(null, { queryParams: { sid: this.model.get('BLSAMPLEID'), pp: 5 } })
            this.dcs.fetch()

            if (this.model.get('INSPECTIONS') > 0) {
                this.inspectionimages = new InspectionImages()
                this.inspectionimages.queryParams.sid = this.model.get('BLSAMPLEID')
                this.inspectionimages.fetch()
            }

            this.gproteins = new DistinctProteins()
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
            //edit.create('ACRONYM', 'select')
            edit.create('SPACEGROUP', 'select', { data: SG.obj() })
            edit.create('ANOMALOUSSCATTERER', 'select', { data: Anom.obj() })
            edit.create('COMMENTS', 'text')
            edit.create('CODE', 'text')
            edit.create('VOLUME', 'text')

            _.each(['CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'REQUIREDRESOLUTION'], function(f, i) {
                edit.create(f, 'text')
            })

            this.distinct = new DistinctProteins()
            var self = this
            this.distinct.fetch().done(function() {
                var opts = _.map(self.distinct.kv(), function(v,k) { return { value: v, id: k } })
                edit.create('PROTEINID', 'autocomplete', { autocomplete: { source: opts } })
            })
            
            this.history.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))

            console.log('sample', this.model)
            this.comps.show(new ComponentsView({ showEmpty: true, collection: this.model.get('components'), viewLink: true, editinline: true, CRYSTALID: this.model.get('CRYSTALID') }))
            if (this.model.get('INSPECTIONS') > 0) this.imh.show(new ImageHistoryView({ historyimages: this.inspectionimages, embed: true }))


            this.ui.comp.autocomplete({ 
                source: this.getGlobalProteins.bind(this),
                select: this.selectGlobalProtein.bind(this)
            })
        },

        selectGlobalProtein: function(e, ui) {
            e.preventDefault()
            var prot = this.gproteins.findWhere({ PROTEINID: ui.item.value })
            if (prot) {
                console.log('add comp', prot)
                var clone = prot.clone()
                var comps = this.model.get('components')
                clone.collection = comps
                clone.set('new', true)
                comps.add(clone)
            }
            this.ui.comp.val('')
        },

        getGlobalProteins: function(req, resp) {
            var self = this
            this.gproteins.fetch({
                data: {
                    term: req.term,
                    global: 1,
                },
                success: function(data) {
                    resp(self.gproteins.map(function(m) {
                        return {
                            label: m.get('ACRONYM'),
                            value: m.get('PROTEINID'),
                        }
                    }))
                }
            })
        },
        
    })
        
})
