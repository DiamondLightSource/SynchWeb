define(['backbone'], function(Backbone) {

    /*
     Backbone model mixin that supports uploading files
    */
    return {
        sync: function(method, model, options){
            if(method == 'create'){
                var formData = new FormData();
                
                _.each(model.attributes, function(value, key){
                    formData.append(key, value);
                });
                
                _.defaults(options || (options = {}), {
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhr: function() {
                        var xhr = new window.XMLHttpRequest()
                        xhr.upload.onprogress = function(event) {
                            if (event.lengthComputable) {
                                model.trigger('progress', (event.loaded / event.total) * 100);
                            }
                        }
                        return xhr
                    }
                })
            }
            
            return Backbone.sync.call(this, method, model, options);
        }
        
    }
    
})