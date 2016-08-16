define(['backbone.paginator'], function(PageableCollection) {
	
	var TrackingModel = Backbone.Model.extend({
		idAttribute: 'EVENTID',
	})

	return PageableCollection.extend({
		url: '/shipment/dewars/tracking',

		parseRecords: function(r, options) {
			this.ORIGIN = r.ORIGIN
			this.DESTINATION = r.DESTINATION

			return r.EVENTS
		}

	})


})