define(['modules/samples/views/proteinadd',
	'tpl!templates/types/gen/samples/componentadd.html'], 
	function(ProteinAddView, template) {
	
	return ProteinAddView.extend({
		template: template,
	})

})