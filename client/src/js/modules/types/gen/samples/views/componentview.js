define(['modules/samples/views/proteinview',
	'templates/types/gen/samples/component.html'], 
	function(ProteinView, template) {
	
	return ProteinView.extend({
		template: template,
		showContainers: false,
	})

})