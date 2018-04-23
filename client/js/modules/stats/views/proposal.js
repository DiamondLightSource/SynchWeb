define(['marionette',
        'modules/stats/views/pies',
        'modules/stats/views/hourlies',
    
        'modules/stats/models/pie',
        'modules/stats/views/pie',

        'modules/stats/collections/overview',
        'views/table',
        'utils/table',
    
    'tpl!templates/stats/proposal.html'
    ], function(Marionette,
        PiesView, HourliesView,
        Pie, PieView,
        BAGOverview, TableView, table,
        template) {


    var ClickableRow = table.ClickableRow.extend({
        event: 'dclist:show',
        argument: 'VISIT',
    })


    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            ps: '.pies',
            hrs: '.hrs',
            wrap: '.wrapper', 
        },

        initialize: function(options) {
            this.collection = new BAGOverview(null, { queryParams: { group_by: 'visit', prop: app.prop } })
            this.collection.fetch()

            var columns = [
                           { name: 'VISIT', label: 'Visit', cell: 'string', editable: false },
                           { name: 'LEN', label: 'Allocated (hr)', cell: 'string', editable: false },
                           { name: 'REM', label: 'Remaining (hr)', cell: 'string', editable: false },
                           { name: 'USED', label: 'Used (%)', cell: 'string', editable: false },
                           { name: 'DCH', label: 'Data Collections / hr', cell: table.ShadedCell, editable: false },
                           { name: 'MDCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'MX', label: 'M-Axis', cell: 'string', editable: false },
                           { name: 'DC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SCH', label: 'Screenings / hr', cell: table.ShadedCell, editable: false },
                           { name: 'MSCH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SC', label: 'Total', cell: 'string', editable: false },
                           { name: 'SLH', label: 'Samples Loaded / hr', cell: table.ShadedCell, editable: false },
                           { name: 'MSLH', label: 'Max / hr', cell: 'string', editable: false },
                           { name: 'SL', label: 'Total', cell: 'string', editable: false }]
                          
            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'visits', loading: true, backgrid: { row: ClickableRow, emptyText: 'No runs found', } })
        },
        
        onShow: function() {
            this.ps.show(new PiesView({ collection: this.getOption('pies') }))
            this.hrs.show(new HourliesView())
            
            var average = new Pie({ data: this.getOption('pies').average })
            this.pie = new PieView({ model: average, el: this.$el.find('#visit_pie') }).render()

            this.wrap.show(this.table)
        },
        
    })
    

})