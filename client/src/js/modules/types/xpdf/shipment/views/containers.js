/**
 * XPDF implementation of the container list view
 */

define([
    'modules/shipment/views/containers',
    ], function(
        ContainersView
    ) {
    
    return ContainersView.extend({
        showFilter: false,
        showImaging: false,
        template: '<div><h1>Pucks</h1><div class="filter type"></div><div class="filter"><ul><li><label><input type="checkbox" name="currentuser" /> My Pucks</label></li></ul></div><div class="wrapper"></div></div>',
        
        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
            { name: 'BARCODE', label: 'Barcode', cell: 'string', editable: false },
            { name: 'SHIPMENT', label: 'Shipment', cell: 'string', editable: false },
            { name: 'SAMPLES', label: '# Samples', cell: 'string', editable: false },
            { name: 'DCCOUNT', label: '# DCs', cell: 'string', editable: false },
            { name: 'CONTAINERTYPE', label: 'Type', cell: 'string', editable: false },
        ]
    })

})
