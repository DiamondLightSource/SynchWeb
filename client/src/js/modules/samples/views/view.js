define(['marionette',
    'backgrid',
    'modules/shipment/collections/distinctproteins',
    'collections/spacegroups',
    'utils/anoms',
    'utils/centringmethods',
    'utils/experimentkinds',
    'utils/radiationsensitivity',
    'utils/editable',
    'views/table',
    'utils/table',
    'collections/subsamples',
    'collections/datacollections',
    // 'modules/dc/datacollections',
    'modules/dc/views/getdcview',

    'modules/samples/views/componentsview',

    'modules/imaging/collections/inspectionimages',
    'modules/imaging/views/imagehistory',

    'templates/samples/sample.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Backgrid, DistinctProteins, SpaceGroups, Anom, CM, EXP, RS, Editable, TableView, table, SubSamples, DCCol, GetDCView, 
        ComponentsView,
        InspectionImages, ImageHistoryView,
        template, Backbone) {
    
    
    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        
        onClick: function(e) {
            if ($(e.target).is('i') || $(e.target).is('a') || $(e.target).is('input') || $(e.target).hasClass('editable')) return
            this.model.set('isSelected', true)
        },
    })

        
    return Marionette.View.extend({
        className: 'content',
        template: template,
        
        regions: {
            rsubsamples: '.subsamples',
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

            this.subsamples = new SubSamples()
            this.subsamples.queryParams.sid = this.model.get('BLSAMPLEID')
            this.subsamples.fetch()

            this.listenTo(this.subsamples, 'change:isSelected', this.selectSubsample)

            this.spacegroups = new SpaceGroups(null, { state: { pageSize: 9999 } })
        },


        selectSubsample: function(e) {
            var s = this.subsamples.findWhere({ isSelected: true })
            if (s) {
                this.dcs.queryParams.ssid = s.get('BLSUBSAMPLEID')
                this.dcs.fetch()
            } else this.dcs.queryParams.ssid = null
        },
        
        
        onRender: function () {
            var self = this
            var edit = new Editable({ model: this.model, el: this.$el })

            this.spacegroups.fetch().done(function () {
                edit.create('SPACEGROUP', 'select', { data: self.spacegroups.kv() })
            })
            
            edit.create('ANOMALOUSSCATTERER', 'select', { data: Anom.obj() })
            edit.create('COMMENTS', 'text')
            edit.create('VOLUME', 'text')
            edit.create('ABUNDANCE', 'text')
            edit.create('CENTRINGMETHOD', 'select', { data: CM.obj() })
            edit.create('EXPERIMENTKIND', 'select', { data: EXP.obj() })
            edit.create('RADIATIONSENSITIVITY', 'select', { data: RS.obj() })
            edit.create('ENERGY', 'text')
            edit.create('DIMENSION1', 'text')
            edit.create('DIMENSION2', 'text')
            edit.create('DIMENSION3', 'text')
            edit.create('SHAPE', 'text')
            edit.create('COLOR', 'text')
            edit.create('SMILES', 'text')

            if (!this.model.get('HASDATA')) {
                edit.create('CODE', 'text')
                edit.create('NAME', 'text')
                edit.create('USERPATH', 'text')
            }

            _.each(['CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA', 'REQUIREDRESOLUTION'], function(f, i) {
                edit.create(f, 'text')
            })

            this.distinct = new DistinctProteins()

            this.distinct.fetch().done(function() {
                var opts = _.map(self.distinct.kv(), function(v,k) { return { value: v, id: k } })
                edit.create('PROTEINID', 'autocomplete', { autocomplete: { source: opts } })
            })
            
            this.getRegion('history').show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))

            console.log('sample', this.model)
            this.getRegion('comps').show(new ComponentsView({ showEmpty: true, collection: this.model.get('components'), viewLink: true, editinline: true, CRYSTALID: this.model.get('CRYSTALID') }))
            if (this.model.get('INSPECTIONS') > 0) this.getRegion('imh').show(new ImageHistoryView({ historyimages: this.inspectionimages, embed: true }))


            this.ui.comp.autocomplete({ 
                source: this.getGlobalProteins.bind(this),
                select: this.selectGlobalProtein.bind(this)
            })


            var columns = [
                        { label: '#', cell: table.TemplateCell, editable: false, template: '<%-(RID+1)%>' },
                        { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%-(X2 ? "Region" : "Point")%>' },
                        { name: 'X', label: 'X', cell: 'string', editable: false },
                        { name: 'Y', label: 'Y', cell: 'string', editable: false },
                        { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: true },
                        { name: 'GR', label: 'Grid Scans', cell: 'string', editable: true },
                        { name: 'SC', label: 'SCs', cell: 'string', editable: true },
                        { name: 'DC', label: 'DCs', cell: 'string', editable: true },
                        { name: 'DCRESOLUTION', label: 'Res', cell: 'string', editable: true },
                        { label: 'Status', cell: table.StatusCell, editable: false },
            ]

            this.subtable = new TableView({
                collection: this.subsamples, 
                columns: columns, 
                tableClass: 'subsamples', 
                loading: false, pages: false, 
                backgrid: { emptyText: 'No subsamples found', row: ClickableRow } 
            })
            this.getRegion('rsubsamples').show(this.subtable)
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
