define(['marionette', 'modules/stats/collections/ehclogs', 'views/table', 'utils/table'], function(Marionette, EHC, TableView, table) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>EHC Log</h1><div class="wrapper"></div>'),

        regions: {
            wrap: '.wrapper',
        },
        
        initialize: function(options) {
            var columns = [
                { name: 'title', label: 'Title', cell: 'string', editable: false },
                { name: 'posteddate', label: 'Date', cell: 'string', editable: false },
                { name: 'postedby', label: 'Posted By', cell: 'string', editable: false },
                { name: 'logcontent', label: 'Content', cell: table.HTMLCell, editable: false },
            ]
            
            this.collection = new EHC(null, { visit: options.visit })
            this.collection.fetch()
            
            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'ehc reflow', filter: false, pages: false, backgrid: {  emptyText: 'No EHC log found' } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
        },
    })

})