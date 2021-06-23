define(['backbone',
  'underscore'
  ], function(Backbone, _ ) {
    return Backbone.Model.extend({
        urlRoot: '/sample/groups/name',
        idAttribute: 'BLSAMPLEGROUPID',
        idField: null,
        ignoreSamples: false, // We are setting this flag here to maintain backward compatibility with updating or creating sample groups with samples

        validation: {
            NAME: {
                required: false,
                pattern: 'wwsbdash',
            }
        },

        save(attr, options) {
            options = _.extend({}, options)
            
            var model = this
            var success = options.success;

            options.success = function(resp) {
                model.set(resp)
                if (success) success(model, resp, options)
            }

            const { patch } = options

            let updatedModel = this
            let actionType = ''

            if (this.ignoreSamples && patch) {
                updatedModel = _.extend(this, { url: `${this.url()}?ignoreSamples=1`, attributes: attr })
                actionType = 'patch'
            } else if (this.ignoreSamples && !patch) {
                updatedModel = _.extend(this, { url: `${this.url()}?ignoreSamples=1` })
                actionType = 'create'
            }

            console.log({ options, actionType, model: this });

            return Backbone.sync(actionType, updatedModel, options)
        }
    })
  })