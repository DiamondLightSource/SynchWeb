// Use this to submit multiple backbone models AND files
// If you don't need files, see multimodelwrapper.js instead
define(['backbone'], function(Backbone) {
    return Backbone.Model.extend({
        // Allows you to set a submission URL on usage, 
        // just set a urlRoot property to the model like any other data
        urlRoot: function(){return this.get('urlRoot')},

        sync: function(method, model, options){
            if(method == 'create'){
                var formData = new FormData();

                // Add any root level elements to the wrapper for submission
                _.each(model.attributes, function(value, key){
                    if(!(value instanceof Backbone.Model)){
                        formData.append(key, value);
                    }
                });

                // Add all nested backbone models to wrapper for submission as a single JSON string
                formData.append('json', JSON.stringify(model));
                
                _.defaults(options || (options = {}), {
                    data: formData,
                    processData: false,
                    contentType: false,
                })
            }
            
            return Backbone.sync.call(this, method, model, options);
        }
    })
})