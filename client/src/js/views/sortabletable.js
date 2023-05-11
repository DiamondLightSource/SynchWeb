define(['backbone', 'views/table', 'backgrid', 'jquery', 'jquery-ui/ui/widgets/sortable'], function(Backbone, TableView, Backgrid, $) {

    var SortableRow = Backgrid.Row.extend({
        events: {
            'drop': 'drop',
            'click a.clear': 'clear'
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

        clear: function(){
            var self = this

            Backbone.ajax({
                url: app.apiurl+'/exp/plans/' + this.model.get('DIFFRACTIONPLANID'),
                method: 'post',
                data: {
                    _METHOD: 'delete'
                },

                success: function(response){
                    // Reorder plans on successful deletion
                    var collection = self.model.collection
                    var comparator = collection.comparator
                    var position = self.model.get('PLANORDER')

                    collection.each(function (model, index) {

                        if(index <= position)
                            return

                        var ordinal = index
                        var d = {}
                            d[comparator] = ordinal-1
                        model.set(d)
                    }, self)

                    collection.remove(self.model)
                    collection.sort()
                    collection.trigger('order:updated')
                },
                error: function(response){
                    console.log('failed to remove DCP')
                    app.alert({message: "Failed to remove Data CollectionPlan"})
                }
            })

        }
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
