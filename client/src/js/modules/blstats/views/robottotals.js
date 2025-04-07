define(['marionette', 'views/table', 'utils/table'], function(Marionette, TableView, table) {
    
    return Marionette.View.extend({
        className: 'content',
        template: _.template('<div class="wrapper"></div>'),

        regions: {
            wrap: '.wrapper',
        },
        
        initialize: function(options) {
            var columns = [
                { name: 'ST', label: 'Time', cell: 'string', editable: false },
                { name: 'BL', label: 'Beamline', cell: 'string', editable: false },
                { label: 'Visit', cell: table.TemplateCell, editable: false, template: '<a href="/stats/visit/<%-VIS%>"><%-VIS%></a>' },
                { name: 'NUM', label: 'Actions', cell: 'string', editable: false },
                { name: 'SUCCESS', label: 'Success', cell: 'string', editable: false },
                { name: 'AVGT', label: 'Avg Time', cell: 'string', editable: false },
                { name: 'ERROR', label: 'Errors', cell: 'string', editable: false },
                { name: 'CRITICAL', label: 'Critical', cell: 'string', editable: false },
                { name: 'WARNING', label: 'Warning', cell: 'string', editable: false },
                { name: 'EPICSFAIL', label: 'Epics', cell: 'string', editable: false },
                { name: 'COMMANDNOTSENT', label: 'Not Sent', cell: 'string', editable: false },
            ]
            
            if (app.mobile()) {
                _.each([6,7,8,9,10], function(v) {
                    columns[v].renderable = false
                })
            }

            this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'robot_actions', filter: 's', loading: true, backgrid: { emptyText: 'No robot errors recorded' } })
        },
                                          
        onRender: function() {
            this.getRegion('wrap').show(this.table)
        },
    })

})