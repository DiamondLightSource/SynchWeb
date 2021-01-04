/**
 * XPDF phase list
 */

define(['marionette',
        'backgrid',
        'utils/table',
        'modules/samples/views/proteinlist'
        ], function(Marionette,
            Backgrid,
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
        events: {
            'change .uas': 'showOriginalOnly'
        },
        
        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
            { name: 'MOLECULARMASS', label: 'Molecular Mass', cell: 'string', editable: false },
            { name: 'SEQUENCE', label: 'Composition', cell: 'string', editable: false },
            { name: 'DENSITY', label: 'Crystallographic Density', cell: 'string', editable: false },
            { name: 'PDBS', label: 'Has CIF', cell: table.TemplateCell, editable: false, template: '<%-(PDBS > 0 ? "Yes" : "No")%>' },
            { name: 'SAFETYLEVEL', label: 'Risk Rating', cell: table.SafetyCell, editable: false },
        ],
    
        hiddenColumns: [],

        // Toggle between displaying all phases or only UAS approved originals
        showOriginalOnly: function(){
            if(this.ui.toggleUAS[0].checked == true){
                this.collection.queryParams['external'] = 1
                this.collection.state['currentPage'] = 1
                this.collection.fetch()
            } else {
                delete this.collection.queryParams['external']
                this.collection.fetch()
            }
        }
    })
})
