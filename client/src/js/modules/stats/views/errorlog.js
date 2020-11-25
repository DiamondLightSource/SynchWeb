define(['backbone', 'backgrid', 'marionette', 'views/table'], 
    function(Backbone, Backgrid, Marionette, TableView) {

    var PercentCell = Backgrid.Cell.extend({
        render: function() {
            console.log(this.column)
            this.$el.text((this.model.get(
                this.column.get('name'))/(this.column.get('total') 
                    ? this.column.get('total')
                    : this.model.get('total'))*100).toFixed(1)
            )

            return this
        }
    })

    var MessagesCell = Backgrid.Cell.extend({
        render: function() {
            var columns = [
                { name: 'message', label: 'Message', cell: 'string', editable: false },
                { name: 'count', label: 'Count', cell: 'string', teditable: false },
                { name: 'count', label: '%', cell: PercentCell, total: this.model.get('failed'), editable: false },
            ]

            var collection = new Backbone.Collection(this.model.get('messages'))
            console.log('collection', collection, this.model)

            var table = new TableView({ 
                collection: collection, 
                pages: false,
                columns: columns, 
                tableClass: 'messages', 
                backgrid: { emptyText: 'No failure messages' } 
            })

            this.$el.html(table.render().$el)

            return this
        }
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Data Collection Errors</h1><div class="wrapper"></div>'),
        regions: { wrap: '.wrapper' },

        initialize: function(options) {
            var columns = [
                { name: 'type', label: 'DC Type', cell: 'string', editable: false },
                { name: 'aborted', label: 'Aborted', cell: 'string', editable: false },
                { name: 'aborted', label: '%', cell: PercentCell, editable: false },
                { name: 'failed', label: 'Failed', cell: 'string', editable: false },
                { name: 'failed', label: '%', cell: PercentCell, editable: false },
                { name: 'total', label: 'Total', cell: 'string', editable: false },
                { label: 'Messages', cell: MessagesCell, editable: false },
            ]
            
            if (app.mobile()) {
                _.each([], function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.table = new TableView({ 
                collection: options.collection, 
                columns: columns, 
                tableClass: 'errors', 
                loading: true, 
                backgrid: { emptyText: 'No datacollection failures' } 
            })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
        },
    })

})
