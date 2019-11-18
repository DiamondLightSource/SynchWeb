define(['backbone'], function(Backbone) {

    /*
     Peak list for DIMPLE
    */
    return Backbone.Collection.extend({
        
        parse: function(r) {
            var d = []
            
            _.each(r, function(l) {
                d.push({ X: parseFloat(l[0]), Y: parseFloat(l[1]), Z: parseFloat(l[2]), HEIGHT: parseFloat(l[3]) })
            })
            
            return d
        }
        
    })
    
})