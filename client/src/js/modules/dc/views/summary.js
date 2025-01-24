define(['backbone',
    'marionette',
    'backgrid',
    'views/table',
    'utils',
    'utils/table',
    'utils/kvcollection',
    'collections/spacegroups',
    'templates/dc/summary.html'], 
    function(Backbone, Marionette, Backgrid, TableView,
        utils,
        table,
        KVCollection,
        Spacegroups,
        template) {

    var Pipelines = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            wrap: '.wrapper',
        },
        
        events: {
            'click a.dll': utils.signHandler,
            'change @ui.pipeline': 'changePipeline',
            'change @ui.sg': 'changeSpaceGroup',
            'change @ui.minres': 'changeResolution',
            'change @ui.mincom': 'changeCompleteness',
            'change @ui.minanom': 'changeAnomCompleteness',
            'change @ui.maxrmeas': 'changeRmeas',
            'change @ui.mincchalf': 'changeCCHalf',
            'change @ui.minccanom': 'changeCCAnom',
        },
        
        ui: {
            pipeline: 'select[name=pipeline]',
            sg: 'select[name=SG]',
            minres: 'input[name=minres]',
            mincom: 'input[name=mincom]',
            minanom: 'input[name=minanom]',
            maxrmeas: 'input[name=maxrmeas]',
            mincchalf: 'input[name=mincchalf]',
            minccanom: 'input[name=minccanom]',
        },
        
        initialize: function(options) {
            this.visit = options.model.get('VISIT')
        },

        changePipeline: function() {
            if (this.ui.pipeline.val()) {
                this.collection.queryParams.pipeline = this.ui.pipeline.val()
            } else {
                delete this.collection.queryParams.pipeline
            }
            this.collection.fetch()
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
            this.collection.fetch()
        },
        
        changeResolution: function() {
            if (this.ui.minres.val()) {
                this.collection.queryParams.resolution = this.ui.minres.val()
            } else {
                delete this.collection.queryParams.resolution
            }
            this.collection.fetch()
        },

        changeCompleteness: function() {
            if (this.ui.mincom.val()) {
                this.collection.queryParams.completeness = this.ui.mincom.val()
            } else {
                delete this.collection.queryParams.completeness
            }
            this.collection.fetch()
        },

        changeAnomCompleteness: function() {
            if (this.ui.minanom.val()) {
                this.collection.queryParams.anomcompleteness = this.ui.minanom.val()
            } else {
                delete this.collection.queryParams.anomcompleteness
            }
            this.collection.fetch()
        },

        changeRmeas: function() {
            if (this.ui.maxrmeas.val()) {
                this.collection.queryParams.rmeas = this.ui.maxrmeas.val()
            } else {
                delete this.collection.queryParams.rmeas
            }
            this.collection.fetch()
        },

        changeCCHalf: function() {
            if (this.ui.mincchalf.val()) {
                this.collection.queryParams.cchalf = this.ui.mincchalf.val()
            } else {
                delete this.collection.queryParams.cchalf
            }
            this.collection.fetch()
        },

        changeCCAnom: function() {
            if (this.ui.minccanom.val()) {
                this.collection.queryParams.ccanom = this.ui.minccanom.val()
            } else {
                delete this.collection.queryParams.ccanom
            }
            this.collection.fetch()
        },

        onRender: function() {
            this.showSpaceGroups()

            this.pipelines = new Pipelines([
                { NAME: 'Any', VALUE: '' },
                { NAME: 'Xia2 DIALS', VALUE: 'xia2 dials' },
                { NAME: 'Xia2 3dii', VALUE: 'xia2 3dii' },
                { NAME: 'Fast DP', VALUE: 'fast_dp' },
                { NAME: 'autoPROC', VALUE: 'autoPROC' },
                { NAME: 'autoPROC+STARANISO', VALUE: 'autoPROC+STARANISO' },
            ])

            this.ui.pipeline.html(this.pipelines.opts())

            var columns = [
                { label: '', cell: table.TemplateCell, editable: false, template: '<a href="/dc/visit/'+this.visit+'/id/<%-ID%>" class="button button-notext"><i class="fa fa-search"></i> <span>View Data Collection</span></a>' },
                { name: 'PREFIX', label: 'Prefix', cell: 'string', editable: false },
                { name: 'SAMPLE', label: 'Sample', cell: table.TemplateCell, template: '<a href="/samples/sid/<%-BLSAMPLEID%>"><%-SAMPLE%></a>',editable: false },
                { name: 'ENERGY', label: 'Energy', cell: table.TemplateCell, template: '<%-ENERGY%>eV', editable: false },
                { name: 'RESOLUTION', label: 'Det Resolution', cell: table.TemplateCell, template: '<%-RESOLUTION%>Å', editable: false },
                { name: 'PIPELINE', label: 'Pipeline', cell: 'string', editable: false },
                { name: 'SG', label: 'Spacegroup', cell: 'string', editable: false },
                { name: 'CELL', label: 'Unit Cell', cell: table.TemplateCell, template: '<%-CELL_A%> (<%-CELL_AL%>)<br /><%-CELL_B%> (<%-CELL_BE%>)<br /><%-CELL_C%> (<%-CELL_GA%>)', editable: false },
                { name: 'RES', label: 'Resolution', cell: table.TemplateCell, template: '<%-OVERALLRLOW%> - <%-OVERALLRHIGH%><br /><%-INNERRLOW%> - <%-INNERRHIGH%><br /><%-OUTERRLOW%> - <%-OUTERRHIGH%>', editable: false },
                { name: 'COMPLETENESS', label: 'Completeness', cell: table.TemplateCell, template: '<span class="<%-OVERALLCOMPLETENESSCLASS%>"><%-OVERALLCOMPLETENESS%></span><br /><span class="<%-INNERCOMPLETENESSCLASS%>"><%-INNERCOMPLETENESS%></span><br /><span class="<%-OUTERCOMPLETENESSCLASS%>"><%-OUTERCOMPLETENESS%></span>', editable: false },
                { name: 'ANOMCOMPLETENESS', label: 'Anom Completeness', cell: table.TemplateCell, template: '<span class="<%-ANOMOVERALLCOMPLETENESSCLASS%>"><%-ANOMOVERALLCOMPLETENESS%></span><br /><span class="<%-ANOMINNERCOMPLETENESSCLASS%>"><%-ANOMINNERCOMPLETENESS%></span><br /><span class="<%-ANOMOUTERCOMPLETENESSCLASS%>"><%-ANOMOUTERCOMPLETENESS%></span>', editable: false },
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
