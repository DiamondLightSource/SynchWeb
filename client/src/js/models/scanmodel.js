define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        idAttribute: 'SCANPARAMETERSMODELID',
        urlRoot: '/exp/parameters/models',
      
        defaults: {
            SEQUENCENUMBER: null,
            START: null,
            STOP: null,
            STEP: null,
            ARRAY: null,
        },

        validation: {
            DATACOLLECTIONPLANID: {
                required: true,
                pattern: 'digits',
            },
            SCANPARAMETERSSERVICEID: {
                required: true,
                pattern: 'digits',
            },
            SEQUENCENUMBER: {
                required: true,
                pattern: 'number'
            },
            START: {
                required: function() {
                    return !this.get('ARRAY')
                },
                pattern: 'number'
            },
            STOP: {
                required: function() {
                    return !this.get('ARRAY')
                },
                pattern: 'number'
            },
            STEP: {
                required: function() {
                    return !this.get('ARRAY')
                },
                pattern: 'number'
            },
            ARRAY: {
                required: function() {
                    return !(this.get('START') || this.get('STOP') || this.get('STEP'))
                },
                pattern: 'array'
            },
        },
    
    })
       
})

