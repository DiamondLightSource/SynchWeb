define(['backbone'], function(Backbone) {
    
	return Backbone.Model.extend({
		idAttribute: 'DEWARTRANSPORTHISTORYID',
		urlRoot: '/shipment/dewars/history',

		initialize(attrs, options) {
			this.formatComments()
		},

		formatComments() {
			const comments = this.get('COMMENTS')
			if (comments) {
				const parsedComment = JSON.parse(comments)
				if (parsedComment) {
					this.set('COMMENTS', parsedComment)
				} else {
					this.set('COMMENTS', comments)
				}
			}
		},

		validation: {
			BARCODE: {
				required: true,
				pattern: 'wwdash',
			},

			LOCATION: {
				required: true,
				pattern: 'wwsdash',
			}
		}
	})
})