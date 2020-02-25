define(['views/table', 'backgrid', 'jquery', 'jquery-ui/ui/widgets/sortable'], function(TableView, Backgrid, $) {

    var SortableRow = Backgrid.Row.extend({
        events: {
            'drop': 'drop',
        },
        
        drop: function(event, position) {
            var collection = this.model.collection
            var comparator = collection.comparator

            collection.remove(this.model)
            
            collection.each(function (model, index) {
                var ordinal = index
                if (index >= position) ordinal += 1
                var d = {}
                    d[comparator] = ordinal
                // model.set(d, { silent: true })
                model.set(d)
            }, this)
            
            var d = {}
                d[comparator] = position
            // this.model.set(d, { silent: true })
            this.model.set(d)
            collection.add(this.model, { at: position })
            collection.sort()
            collection.trigger('order:updated')
        },
    })


    var SortableTable = TableView.extend({
        backgrid: {
            row: SortableRow,
        },

        initialize: function(options) {
            if (options && options.backgrid) {
                this.options.backgrid = _.extend({}, options.backgrid, this.options.backgrid)
            }

            SortableTable.__super__.initialize.call(this, options)
        },

        onRender: function() {
            SortableTable.__super__.onRender.call(this)

            this.table.$el.find('tbody').sortable({
                stop: function(e, ui) {
                    ui.item.trigger('drop', ui.item.index());
                }
            })
        }


    })


    return SortableTable

})
