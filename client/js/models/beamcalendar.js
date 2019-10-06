define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'BEAMCALENDARID',
        urlRoot: '/proposal/calendar',

        validation: {

        }
    })
       
})
