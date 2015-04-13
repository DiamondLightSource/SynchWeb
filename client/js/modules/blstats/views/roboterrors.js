define(['marionette', 'modules/blstats/collections/roboterrors', 'views/table'], function(Marionette, RobotErrors, TableView) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Robot Errors</h1><div class="wrapper"></div>'),

        regions: {
            wrap: '.wrapper',
        },
        
        initialize: function(options) {
            var columns = [
                { name: 'ST', label: 'Time', cell: 'string', editable: false },
                { name: 'BL', label: 'Beamline', cell: 'string', editable: false },
                { name: 'VIS', label: 'Visit', cell: 'string', editable: false },
                { name: 'ACTIONTYPE', label: 'Action', cell: 'string', editable: false },
                { name: 'TIME', label: 'Duration', cell: 'string', editable: false },
                { name: 'DEWARLOCATION', label: 'Puck', cell: 'string', editable: false },
                { name: 'CONTAINERLOCATION', label: 'Sample', cell: 'string', editable: false },
                { name: 'SAMPLEBARCODE', label: 'Barcode', cell: 'string', editable: false },
                { name: 'STATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'MESSAGE', label: 'Message', cell: 'string', editable: false },
            ]
            
            if (app.mobile()) {
                _.each([2,3,4,5,6,7,8], function(v) {
                    columns[v].renderable = false
                })
            }

            this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'robot_actions', filter: 's', loading: true, backgrid: { emptyText: 'No robot errors recorded' } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
        },
    })

})