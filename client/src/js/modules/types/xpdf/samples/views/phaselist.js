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

        render: function() {
            Backgrid.Row.prototype.render.call(this)

            // Highlight approved samples
            // Currently all samples with an external id are green
            // In future use Protein safetyLevel to discriminate
            if (this.model.get('EXTERNAL') == '1') this.$el.addClass('active')

            return this
        },
    })


    return ProteinList.extend({
        clickableRow: ClickableRow, 
        showFilter: false,
        title: 'Phase',
        url: 'phase',
        events: {
            'change .uas': 'showOriginalOnly'
        },
        ui: { toggleUAS: '.uas' },
        
        columns: [
            { name: 'NAME', label: 'Name', cell: 'string', editable: false },
            { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
            { name: 'MOLECULARMASS', label: 'Molecular Mass', cell: 'string', editable: false },
            { name: 'SEQUENCE', label: 'Composition', cell: 'string', editable: false },
            { name: 'DENSITY', label: 'Crystallographic Density', cell: 'string', editable: false },
            { name: 'PDBS', label: 'Has CIF', cell: table.TemplateCell, editable: false, template: '<%-(PDBS > 0 ? "Yes" : "No")%>' },
        ],
    
        hiddenColumns: [],

        // Toggle between displaying all phases or only UAS approved originals
        showOriginalOnly: function(){
            if(this.ui.toggleUAS[0].checked == true){
                this.collection.queryParams['original'] = 1
                this.collection.state['currentPage'] = 1
                this.collection.fetch()
            } else {
                delete this.collection.queryParams['original']
                this.collection.fetch()
            }
        }
    })
})
