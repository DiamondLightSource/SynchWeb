define(['underscore', 'backbone', 'modules/projects/models/user'], function(_, Backbone, User) {

  return Backbone.Collection.extend({
    model: User,
                                    
    url: function() { return '/projects/users/pid/' + this.pid },

    initialize: function(models, options) {
      console.log('pjusers', options)
      this.pid = options.pid
    },
  })
       
})