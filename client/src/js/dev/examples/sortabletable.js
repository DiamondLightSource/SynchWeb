define(['backbone', 'marionette', 'views/sortabletable'], function(Backbone, Marionette, SortableTable) {
    
    var OrderModel = Backbone.Model.extend({
        idAttribute: 'ID'
    })

    var OrderCol = Backbone.Collection.extend({
        model: OrderModel,
        comparator: 'ORDER',
    })

    return Marionette.LayoutView.extend({
        template: _.template('<div class="test"></div>'),
        regions: {
            test: '.test'
        },

        onRender: function() {
            var mods = _.map(_.range(6), function(i) { return { ID: (i+1), ORDER: i }})
            this.collection = new OrderCol(mods)
            this.listenTo(this.collection, 'order:updated', this.saveOrder)

            this.test.show(new SortableTable({
                collection: this.collection,
                columns: [
                    { name: 'ORDER', label: 'Order', cell: 'string', editable: false },
                    { name: 'ID', label: 'ID', cell: 'string', editable: false },
                ],
                pages: false,
            }))

        },

        saveOrder: function() {
            this.collection.each(function(m) {
                var ca = m.changedAttributes()
                if (Object.keys(ca).length) m.save(ca, { patch: true })
            })
        }


    })


})