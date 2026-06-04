define(['backbone',
    'marionette',
    'backgrid',
    'views/table',
    'utils',
    'utils/table',
    'utils/kvcollection',
    'collections/spacegroups',
    'collections/processingpipelines',
    'collections/visits',
    'modules/shipment/collections/distinctproteins',
    'collections/samplegroups',
    'templates/dc/summary.html'], 
    function(Backbone, Marionette, Backgrid, TableView,
        utils,
        table,
        KVCollection,
        Spacegroups,
        ProcessingPipelines,
        Visits,
        DistinctProteins,
        SampleGroups,
        template) {

    var Pipelines = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        templateHelpers: function() {
            return {
                APIURL: app.apiurl,
                PROTEINID: this.protein,
                SAMPLEGROUPID: this.group,
            }
        },

        regions: {
            wrap: '.wrapper',
        },
        
        events: {
            'click a.dll': utils.signHandler,
            'click a.csv': 'downloadCSV',
            'change @ui.typeselect': 'changeType',
            'change @ui.visitselect': 'changeVisit',
            'change @ui.proteinselect': 'changeProtein',
            'change @ui.groupselect': 'changeGroup',
            'change @ui.pipeline': 'changePipeline',
            'change @ui.sg': 'changeSpaceGroup',
            'change @ui.minres': 'changeResolution',
            'change @ui.mincom': 'changeCompleteness',
            'change @ui.minanom': 'changeAnomCompleteness',
            'change @ui.maxrmeas': 'changeRmeas',
            'change @ui.mincchalf': 'changeCCHalf',
            'change @ui.minccanom': 'changeCCAnom',
            'change @ui.minimages': 'changeImages',
        },
        
        ui: {
            typeselect: 'select[name=type-select]',
            visitselect: 'select[name=visit-select]',
            proteinselect: 'select[name=protein-select]',
            groupselect: 'select[name=group-select]',
            pipeline: 'select[name=pipeline]',
            sg: 'select[name=SG]',
            minres: 'input[name=minres]',
            mincom: 'input[name=mincom]',
            minanom: 'input[name=minanom]',
            maxrmeas: 'input[name=maxrmeas]',
            mincchalf: 'input[name=mincchalf]',
            minccanom: 'input[name=minccanom]',
            minimages: 'input[name=minimages]',
        },
        
        initialize: function(options) {
            this.visit = options.collection.queryParams.visit
            this.protein = options.collection.queryParams.pid
            this.group = options.collection.queryParams.sgid
            this.visits = null
            this.proteins = null
            this.groups = null
        },

        setType: function() {
            if (this.visit) this.ui.typeselect.val('visit')
            if (this.protein) this.ui.typeselect.val('protein')
            if (this.group) this.ui.typeselect.val('group')
            this.changeType()
        },

        changeType: function() {
            if (this.ui.typeselect.val() == 'visit') {
                this.ui.visitselect.show()
                this.ui.proteinselect.hide()
                this.ui.groupselect.hide()
                if (!this.visits) {
                    this.visits = new Visits(null, { state: { pageSize: 9999 } })
                    this.visits.fetch().done(this.updateVisits.bind(this))
                }
            } else if (this.ui.typeselect.val() == 'protein') {
                this.ui.visitselect.hide()
                this.ui.proteinselect.show()
                this.ui.groupselect.hide()
                if (!this.proteins) {
                    this.proteins = new DistinctProteins(null, { state: { pageSize: 9999 } })
                    this.proteins.fetch().done(this.updateProteins.bind(this))
                }
            } else {
                // sample group
                this.ui.visitselect.hide()
                this.ui.proteinselect.hide()
                this.ui.groupselect.show()
                if (!this.groups) {
                    this.groups = new SampleGroups(null, { state: { pageSize: 9999 } })
                    this.groups.queryParams.groupSamplesType = 'BLSAMPLEGROUPID'
                    this.groups.fetch().done(this.updateGroups.bind(this))
                }
            }
        },

        changeVisit: function() {
            const selectedModel = this.visits.findWhere({ SESSIONID: this.ui.visitselect.val() });
            if (selectedModel) {
                app.trigger('visitsummary:show', selectedModel.get('VISIT'));
            }
        },

        changeProtein: function() {
            app.trigger('proteinsummary:show', this.ui.proteinselect.val());
        },

        changeGroup: function() {
            app.trigger('groupsummary:show', this.ui.groupselect.val());
        },

        updateVisits: function() {
            this.ui.visitselect.html(this.visits.opts())
            const model = this.visits.findWhere({ VISIT: this.visit })
            if (model) {
                this.ui.visitselect.val(model.get('SESSIONID'))
            }
        },

        updateProteins: function() {
            this.ui.proteinselect.html(this.proteins.opts())
            this.ui.proteinselect.val(this.protein)
        },

        updateGroups: function() {
            this.ui.groupselect.html(this.groups.opts())
            this.ui.groupselect.val(this.group)
        },

        downloadCSV: function(e) {
            e.preventDefault()

            let a = e.target
            while (a && a.tagName !== 'A') a = a.parentNode
            if (!a) return

            const originalHref = a.href
            const url = new URL(originalHref)

            const skip = ['currentPage', 'pageSize', 'totalPages', 'totalRecords', 'sortKey', 'order']

            for (const [key, val] of Object.entries(this.collection.queryParams)) {
                if (skip.includes(key)) continue
                if (val == null || typeof val === 'function' || typeof val === 'object') continue
                url.searchParams.set(key, val)
            }

            if (this.collection.state.sortKey) {
                url.searchParams.set('sort_by', this.collection.state.sortKey)
                url.searchParams.set('order', this.collection.state.order === 1 ? 'desc' : 'asc')
            }
            url.searchParams.set('per_page', 9999)

            a.href = url.pathname + url.search

            utils.signHandler(e)

            a.href = originalHref
        },

        updateData: function() {
            this.collection.state['currentPage'] = 1
            this.collection.fetch()
        },

        changePipeline: function() {
            if (this.ui.pipeline.val()) {
                this.collection.queryParams.pipeline = this.ui.pipeline.val()
            } else {
                delete this.collection.queryParams.pipeline
            }
            this.updateData()
        },

        showSpaceGroups: async function() {
            this.spacegroups = new Spacegroups(null, { state: { pageSize: 9999 } })
            await this.spacegroups.fetch();
            this.ui.sg.html('<option value=""> - </option>'+this.spacegroups.opts())
        },

        changeSpaceGroup: function() {
            if (this.ui.sg.val()) {
                this.collection.queryParams.spacegroup = this.ui.sg.val()
            } else {
                delete this.collection.queryParams.spacegroup
            }
            this.updateData()
        },
        
        changeResolution: function() {
            if (this.ui.minres.val()) {
                this.collection.queryParams.resolution = this.ui.minres.val()
            } else {
                delete this.collection.queryParams.resolution
            }
            this.updateData()
        },

        changeCompleteness: function() {
            if (this.ui.mincom.val()) {
                this.collection.queryParams.completeness = this.ui.mincom.val()
            } else {
                delete this.collection.queryParams.completeness
            }
            this.updateData()
        },

        changeAnomCompleteness: function() {
            if (this.ui.minanom.val()) {
                this.collection.queryParams.anomcompleteness = this.ui.minanom.val()
            } else {
                delete this.collection.queryParams.anomcompleteness
            }
            this.updateData()
        },

        changeRmeas: function() {
            if (this.ui.maxrmeas.val()) {
                this.collection.queryParams.rmeas = this.ui.maxrmeas.val()
            } else {
                delete this.collection.queryParams.rmeas
            }
            this.updateData()
        },

        changeCCHalf: function() {
            if (this.ui.mincchalf.val()) {
                this.collection.queryParams.cchalf = this.ui.mincchalf.val()
            } else {
                delete this.collection.queryParams.cchalf
            }
            this.updateData()
        },

        changeCCAnom: function() {
            if (this.ui.minccanom.val()) {
                this.collection.queryParams.ccanom = this.ui.minccanom.val()
            } else {
                delete this.collection.queryParams.ccanom
            }
            this.updateData()
        },

        changeImages: function() {
            if (this.ui.minimages.val()) {
                this.collection.queryParams.images = this.ui.minimages.val()
            } else {
                delete this.collection.queryParams.images
            }
            this.updateData()
        },

        updatePipelines: function() {
            this.ui.pipeline.html('<option value="">All pipelines</option>'+this.processing_pipelines.opts())
        },

        onRender: function() {
            this.showSpaceGroups()
            this.setType()

            this.processing_pipelines = new ProcessingPipelines()
            this.processing_pipelines.fetch({
                data: {
                    category: 'processing',
                    pipelinestatus: ['automatic', 'optional'],
                }
            }).done(this.updatePipelines.bind(this));

            var columns = [
                { label: '', cell: table.TemplateCell, editable: false, template: '<a href="/dc/visit/<%-VISIT%>/id/<%-ID%>" class="button button-notext"><i class="fa fa-search"></i> <span>View Data Collection</span></a>' },
                { name: 'PREFIX', label: 'Prefix', cell: 'string', editable: false },
                { name: 'SAMPLE', label: 'Sample', cell: table.TemplateCell, template: '<a href="/samples/sid/<%-BLSAMPLEID%>"><%-SAMPLE%></a>', editable: false },
                { name: 'ENERGY', label: 'Energy (eV)', cell: 'string', editable: false },
                { name: 'RESOLUTION', label: 'Det Resolution (Å)', cell: 'string', editable: false },
                { name: 'PIPELINE', label: 'Pipeline', cell: 'string', editable: false },
                { name: 'SG', label: 'Spacegroup', cell: 'string', editable: false },
                { name: 'CELL', label: 'Unit Cell (Å (°))', cell: table.TemplateCell, template: '<%-CELL_A%> (<%-CELL_AL%>)<br /><%-CELL_B%> (<%-CELL_BE%>)<br /><%-CELL_C%> (<%-CELL_GA%>)', editable: false },
                { name: 'RES', label: 'Resolution (Å)', cell: table.TemplateCell, template: '<%-OVERALLRLOW%> - <%-OVERALLRHIGH%><br /><%-INNERRLOW%> - <%-INNERRHIGH%><br /><%-OUTERRLOW%> - <%-OUTERRHIGH%>', editable: false },
                { name: 'COMPLETENESS', label: 'Completeness (%)', cell: table.TemplateCell, template: '<span class="<%-OVERALLCOMPLETENESSCLASS%>"><%-OVERALLCOMPLETENESS%></span><br /><span class="<%-INNERCOMPLETENESSCLASS%>"><%-INNERCOMPLETENESS%></span><br /><span class="<%-OUTERCOMPLETENESSCLASS%>"><%-OUTERCOMPLETENESS%></span>', editable: false },
                { name: 'ANOMCOMPLETENESS', label: 'Anom Completeness (%)', cell: table.TemplateCell, template: '<span class="<%-ANOMOVERALLCOMPLETENESSCLASS%>"><%-ANOMOVERALLCOMPLETENESS%></span><br /><span class="<%-ANOMINNERCOMPLETENESSCLASS%>"><%-ANOMINNERCOMPLETENESS%></span><br /><span class="<%-ANOMOUTERCOMPLETENESSCLASS%>"><%-ANOMOUTERCOMPLETENESS%></span>', editable: false },
                { name: 'INNERRMEAS', label: 'Rmeas Inner', cell: 'string', editable: false },
                { name: 'OUTERCCHALF', label: 'CC½ Outer', cell: 'string', editable: false },
                { name: 'INNERCCANOM', label: 'CCanom Inner', cell: 'string', editable: false },
                { label: '', cell: table.TemplateCell, template: '<a href="'+app.apiurl+'/download/ap/archive/<%-AID%>" class="button button-notext dll" title="Download autoprocessing archive"><i class="fa fa-download"></i> <span>Download autoprocessing archive</span></a>', editable: false },
            ]
            
            this.wrap.show(new TableView({
                collection: this.collection,
                columns: columns,
                tableClass: '',
                filter: 's',
                noSearchUrl: true,
                loading: true,
                backgrid: { emptyText: 'No data collections found' }
            
            }))

        },
    })

})
