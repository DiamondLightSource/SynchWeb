define(['backbone'], function(Backbone){

    return Backbone.Model.extend({
        urlRoot: function() { return '/cell/ap'+(this.dist ? '?dist='+_.result(this,'dist') : '') },
  
                                           
        parse: function(r, options) {
            return { tot: r[0], data: r[1] }
        },

    })

})
