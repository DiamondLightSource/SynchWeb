define(['marionette', 
    'collections/reprocessings',
    'collections/reprocessingparameters',
    'collections/reprocessingimagesweeps',
    'views/table',
    'utils/table'],
    function(Marionette,
        Reprocessings, ReprocessingParamters, ReprocessingImageSweeps,
        TableView, table) {


        var StatusCell = Backgrid.Cell.extend({
            render: function() {
                var icons = {
                    2: '<i class="fa icon grey fa-pause alt="Waiting" title="Waiting"></i>',
                    null: '<i class="fa icon grey fa-cog fa-spin alt="Running" title="Running"></i>',
                    1: '<i class="fa icon green fa-check alt="Completed" title="Completed"></i>',
                    0: '<i class="fa icon red fa-times alt="Failed" title="Failed"></i>',
                }

                if (this.model.get('STATUS') in icons) this.$el.append(icons[this.model.get('STATUS')])

                return this
            }
        })

        var ArgsCell = Backgrid.Cell.extend({
            initialize: function(options) {
                ArgsCell.__super__.initialize.call(this, options)

                this.params = new ReprocessingParamters()
                console.log('col', this.column, 'opts', options)
                this.listenTo(this.column.get('params'), 'sync reset', this.syncParams)
                this.syncParams()

                this.sweeps = new ReprocessingImageSweeps()
                this.listenTo(this.column.get('sweeps'), 'sync reset', this.syncSweeps)
                this.syncSweeps()
            },

            syncParams: function() {
                var sw = this.column.get('params').where({ PROCESSINGJOBID: this.model.get('PROCESSINGJOBID') })
                this.params.reset(sw)
            },

            syncSweeps: function() {
                var sw = this.column.get('sweeps').where({ PROCESSINGJOBID: this.model.get('PROCESSINGJOBID') })
                this.sweeps.reset(sw)
            },

            render: function() {
                var columns = [
                   { name: 'PARAMETERKEY', label: 'Key', cell: 'string', editable: false },
                   { name: 'PARAMETERVALUE', label: 'Value', cell: 'string', editable: false },
                ]

                var ptable = new TableView({ 
                    collection: this.params, 
                    columns: columns, 
                    loading: false,
                    pages: false,
                    backgrid: { emptyText: 'No parameters found' },
                })

                this.$el.html(ptable.render().$el)

                var columns = [
                   { label: 'Files', cell: table.TemplateCell, editable: false, template: '<a href="/dc/visit/<%-VISIT%>/id/<%-DATACOLLECTIONID%>"><%-IMAGEDIRECTORY%><%-IMAGEPREFIX%>_<%-DATACOLLECTIONNUMBER%></a>' },
                   { label: 'Image #', cell: table.TemplateCell, editable: false, template: '<%-STARTIMAGE%> - <%-ENDIMAGE%>' },
                ]

                var stable = new TableView({ 
                    collection: this.sweeps, 
                    columns: columns, 
                    loading: false,
                    pages: false,
                    backgrid: { emptyText: 'No image sweeps found' },
                })

                this.$el.append(stable.render().$el)

                return this
            },

        })


        var ResultsCell = Backgrid.Cell.extend({
            render: function() {
                if (this.model.get('RLOW')) {
                    var columns = [
                       { name: 'KEY', label: '', cell: 'string', editable: false },
                       { name: 'VALUE', label: 'Overall', cell: 'string', editable: false },
                    ]

                    var results = []
                    _.each({
                        'Low Resolution': 'RLOW',
                        'High Resolution': 'RHIGH',
                        'Total Observations': 'NTOBS',
                        'Multiplicity': 'MULTIPLICITY',
                        'Rmerge': 'RMERGE',
                        'I/sig(I)': 'ISIGI',
                        'Completeness': 'COMPLETENESS',
                    }, function(v, k) {
                        results.push({
                            KEY: k,
                            VALUE: this.model.get(v)
                        })
                    }, this)

                    this.results = new Backbone.Collection(results)
                    console.log('results', this.results)
                    var rtable = new TableView({ 
                        collection: this.results, 
                        columns: columns, 
                        loading: false,
                        pages: false,
                        backgrid: { emptyText: 'No results found' },
                    })

                    this.$el.html(rtable.render().$el)
                }
                return this
            },
        })



        return Marionette.LayoutView.extend({
            template: _.template('<% if (!EMBED) { %><h1>Reprocessing</h1><p class="help">Here you can find all reprocessing jobs and their statuses</p><% } %><div class="filter"></div><div class="wrapper"></div>'),
            className: 'content',

            regions: {
                rwrap: '.wrapper',
                rflt: '.filter',
            },

            templateHelpers: function() {
                return {
                    EMBED: this.getOption('embed')
                }
            },

            initialize: function(options) {
                if (!options.collection) {
                    this.collection = new Reprocessings()
                    this.collection.queryParams.visit = options.visit
                    this.collection.fetch()
                }

                this.parameters = new ReprocessingParamters()
                this.parameters.queryParams.visit = options.visit
                this.parameters.state.pageSize = 9999

                this.sweeps = new ReprocessingImageSweeps()
                this.sweeps.queryParams.visit = options.visit
                this.sweeps.state.pageSize = 9999
                
                this.listenTo(this.collection, 'sync', this.refreshArgs)
            },

            refreshArgs: function() {
                var ids = this.collection.pluck('PROCESSINGJOBID')
                this.sweeps.fetch({ data: { ids: ids } })
                this.parameters.fetch({ data: { ids: ids } })
            },

            onRender: function() {
                var columns = [
                    { label: 'Status', cell: StatusCell, editable: false },
                    { label: 'Sample', cell: table.TemplateCell, editable: false, template: '<a href="/samples/sid/<%-BLSAMPLEID%>"><%-SAMPLE%></a> - <a href="/proteins/pid/<%-PROTEINID%>"><%-PROTEIN%></a>' },
                    { label: 'DC', cell: table.TemplateCell, editable: false, template: '<a href="/dc/visit/<%-VISIT%>/id/<%-DATACOLLECTIONID%>"><%-IMAGEPREFIX%></a>' },
                    { name: 'DISPLAYNAME', label: 'Process', cell: 'string', editable: false },
                    { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
                    { name: 'LASTUPDATETIMESTAMP', label: 'Last Updated', cell: 'string', editable: false },
                    { name: 'PROCESSINGMESSAGE', label: 'Last Message', cell: 'string', editable: false },
                    { label: 'Arguments', cell: ArgsCell, editable: false, sweeps: this.sweeps, params: this.parameters },
                ]

                if (this.getOption('results')) columns.push(
                    { label: 'Results', cell: ResultsCell, editable: false }
                )

                this.rwrap.show(new TableView({
                    columns: columns,
                    collection: this.collection,  
                    backgrid: { emptyText: 'No reprocessings found' },
                }))
            },

            onDestroy: function() {
                this.collection.stop()
            },

        })


})
