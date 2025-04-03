define(['marionette', 'views/table',
    'templates/shipment/tracking.html'], function(Marionette, TableView, template) {

    return Marionette.View.extend({
        template: template,

        regions: {
            rtr: '.rtr',
        },

        ui: {
            origin: '.origin',
            dest: '.destination',
        },

        initialize: function() {
            this.listenTo(this.collection, 'sync reset', this.update, this)
        },

        update: function() {
            this.ui.origin.text(this.collection.ORIGIN)
            this.ui.dest.text(this.collection.DESTINATION)
        },

        onRender: function() {
            console.log('dhl', this.collection)
            this.rtr.show(new TableView({
                collection: this.collection,
                columns: [
                    { name: 'DATE', label: 'Date', cell: 'string', editable: false },
                    { name: 'STATE', label: 'Status', cell: 'string', editable: false },
                    { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
                    { name: 'SIGNATORY', label: 'Signatory', cell: 'string', editable: false }
                ],
                backgrid: {
                    emptyText: 'No tracking available',
                },

                pages: false,
            }))
        }

    })
})