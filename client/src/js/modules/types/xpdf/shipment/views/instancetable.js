/*
 * A table of the instances in an XPDF sample changer.
 */

define(['backgrid',
    'views/table',
    'utils/table',

    ], function(
    Backgrid,
    TableView,
    table
        ) {

    
    return TableView.extend( {

        columns: [
            { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
            { name: 'PROTEINID', label: 'Sample', cell: 'integer', editable: true },
            { name: 'NAME', label: 'Name', cell: 'string', editable: true },
            { name: 'PACKINGFRACTION', label: 'Packing Fraction', cell: 'string', editable: true },

            { name: 'EXPERIMENTALDENSITY', label: 'Exp. Density', cell: 'string', editable: false },
            { name: 'COMPOSITION', label: 'Composition', cell: 'string', editable: false },

            { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
            { cell: 'string', editable: false },
        ],

        backgrid: {
            // row: ClickableRow,
        },
        
        pages: false,
    
    })
    
})
