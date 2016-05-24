define(['modules/samples/views/proteinlist', 'utils/table'], function(ProteinList, table) {
	
	return ProteinList.extend({
		title: 'Component',

		columns: [
	        { name: 'NAME', label: 'Name', cell: 'string', editable: false },
	        { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
	        { name: 'MOLECULARMASS', label: 'Mass', cell: 'string', editable: false },
	        { name: 'COMPONENTTYPE', label: 'Type', cell: 'string', editable: false },
	        { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
	        { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
	        { name: ' ', cell: table.ProjectCell, itemname: 'ACRONYM', itemid: 'PROTEINID', itemtype:'protein', editable: false },
	    ],

	    hiddenColumns: [2,3],
	})

})