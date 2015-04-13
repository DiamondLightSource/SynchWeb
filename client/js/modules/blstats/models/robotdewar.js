define(['backbone'], function(Backbone){
    
    return Backbone.Model.extend({
        idAttribute: 'visit',
        urlRoot: '/robot/profile',
                   
        parse: function(r, options) {
            return { data: r[0] }
        },
      
    })
       
})