define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        url: function() { return '/projects/check/ty/'+this.get('type')+'/pid/'+this.get('pid')+'/iid/'+this.get('iid') },
        
            
        parse: function(resp) {
            return { state: resp }
        }
    })

})