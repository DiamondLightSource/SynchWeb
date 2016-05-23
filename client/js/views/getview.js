define([], function() {
	
	var GetView = Marionette.Object.extend({
		views: {},
		get: function(type, arguments) {
			var views = this.getOption('views')

			if (type in views) view = views[type]
          	else view = this.getOption('default')

          	console.log('using view', view, type)

          	return new view(arguments)
		},

		// initialize: function(options) {
		// 	return this.get
		// }
	})

	return GetView

})