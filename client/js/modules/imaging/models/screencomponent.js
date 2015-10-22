define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'SCREENCOMPONENTID',
        urlRoot: '/imaging/screen/components',

        defaults: {
            CONCENTRATION: '',
            PH: '',
            canSave: true,
        },

        validation: {
            SCREENCOMPONENTGROUPID: {
                required: true,
                pattern: 'number',
            },

            COMPONENTID: {
                required: true,
                pattern: 'number',
            },

            CONCENTRATION: {
                required: false,
                pattern: 'number',
            },

            PH: {
                required: false,
                pattern: 'number',
            },
        },
      
    })
       
})
