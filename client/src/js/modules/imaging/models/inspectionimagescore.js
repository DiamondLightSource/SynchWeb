define(['backbone'], function(Backbone) {
    
  return Backbone.Model.extend({
    idAttribute: 'BLSAMPLEIMAGESCOREID',
    urlRoot: '/imaging/inspection/images/scores',
      
  })
       
})
