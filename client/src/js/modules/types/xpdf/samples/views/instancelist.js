/**
 *  The table alone for the list of XPDF samples
 */

define(['marionette', 'backgrid',
    'views/table',
    'utils/table',
    ], function(
        Marionette, Backgrid,
        TableView,
        table
    ) {

    var ClickableRow = table.ClickableRow.extend({
        event: 'instances:view',
        argument: 'BLSAMPLEID',
        cookie: true,
    })
      
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Instances</h1><p class="help">This page shows the instances associated with the current <%-TYPE%></p><div class="instances"></div>'),
        regions: {
            wrap: '.instances'
        },

        templateHelpers: function() {
            return {
                TYPE: this.collection.queryParams.crid ? 'sample' : 'proposal'
            }
        },

        row: ClickableRow,

        onRender: function(options) {
            this.wrap.show(new TableView({
                tableClass: 'samples',
                collection: this.collection,
                columns: [
                        { name: 'NAME', label: 'Name', cell: 'string', editable: false},
                        { name: 'CRYSTAL', label: 'Sample', cell: 'string', editable: false},
                        { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
                        { name: 'THEORETICALDENSITY', label: 'Crystallographic Density', cell: 'string', editable: false},
                        { name: 'PACKINGFRACTION', label: 'Packing Fraction', cell:'string', editable: false},
                ],

                backgrid: {
                    row: this.getOption('row'),
                    emptyText: 'No instances available'
                }
            }))
        },

    })

})
