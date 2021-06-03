define(['backbone',
  'underscore'
  ], function(Backbone, _ ) {
    return Backbone.Model.extend({
        urlRoot: '/sample/groups/name',
        idAttribute: 'BLSAMPLEGROUPID',
        idField: null,

        validation: {
            NAME: {
                required: false,
                pattern: 'wwsbdash',
            }
        },

        initialize: function(attribute, option) {
           this.idField = option[this.idAttribute]
        },

        fetch(options) {
            options = _.extend({}, options)
            
            var model = this
            var success = options.success;

            options.success = function(resp) {
                model.set(resp)
                if (success) success(model, resp, options)
            }

            const updatedModel = _.extend(this, { url: `/sample/groups/name/${this.idField}` })
            return Backbone.sync('read', updatedModel, options)
        },
    })
  })