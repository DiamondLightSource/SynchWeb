define(['views/table'], function(TableView) {

    return TableView.extend({
        backgrid: {
            emptyText: 'No history available',
        },
        className: 'history',
        columns: [
            { name: 'ARRIVAL', label: 'Date', cell: 'string', editable: false },
            { name: 'DEWARSTATUS', label: 'Status', cell: 'string', editable: false },
            { name: 'STORAGELOCATION', label: 'Location', cell: 'string', editable: false }]
    
    })
})