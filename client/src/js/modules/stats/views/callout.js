define(['marionette', 'modules/stats/collections/callouts', 'views/table'], function(Marionette, Callouts, TableView) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Callouts</h1><div class="wrapper"></div>'),

        regions: {
            wrap: '.wrapper',
        },
        
        initialize: function(options) {
            var columns = [
                { name: 'username', label: 'User', cell: 'string', editable: false },
                { name: 'logcontent', label: 'Description', cell: 'string', editable: false },
                { name: 'intime', label: 'In Time', cell: 'string', editable: false },
                { name: 'hometime', label: 'Out Time', cell: 'string', editable: false },
            ]
            
            this.collection = new Callouts(null, { visit: options.visit })
            this.collection.fetch()
            
            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'ehc', filter: false, pages: false, backgrid: { emptyText: 'No callouts recorded' } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
        },
    })

})