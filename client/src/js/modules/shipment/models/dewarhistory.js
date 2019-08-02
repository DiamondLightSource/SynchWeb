define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
    	idAttribute: 'DEWARTRANSPORTHISTORYID',
        urlRoot: '/shipment/dewars/history',
            
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