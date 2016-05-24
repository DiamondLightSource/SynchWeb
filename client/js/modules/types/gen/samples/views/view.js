define(['modules/samples/views/view',
	'tpl!templates/types/gen/samples/sample.html'], function(SampleView, template) {

	return SampleView.extend({
		template: template,
	})

})