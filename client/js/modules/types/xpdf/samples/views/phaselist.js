/**
 * XPDF phase list
 */

define(['marionette',
        'utils/table',
        'modules/samples/views/proteinlist'
        ], function(Marionette,
            table,
            ProteinList) {
    

    var ClickableRow = table.ClickableRow.extend({
        event: 'phases:view',
        argument: 'PROTEINID',
        cookie: true,
    })


    return ProteinList.extend({
        clickableRow: ClickableRow, 
        showFilter: false,
        title: 'Phase',
        url: 'phase',
        
        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'MOLECULARMASS', label: 'Molecular Mass', cell: 'string', editable: false },
            { name: 'SEQUENCE', label: 'Composition', cell: 'string', editable: false },
            { name: 'DENSITY', label: 'Crystallographic Density', cell: 'string', editable: false },
            { name: 'PDBS', label: 'Has CIF', cell: table.TemplateCell, editable: false, template: '<%-(PDBS > 0 ? "Yes" : "No")%>' },
        ],
    
        hiddenColumns: [],
        
    })
})
