define(['backbone', 'modules/dc/models/imagestatus'], function(Backbone, DCImageStatusModel) {
       
  return Backbone.Collection.extend({
    model: DCImageStatusModel,
                                                           
    url: '/dc/chi',
  
    parse: function(r, options) {
      var data = []
      _.each(r, function(e) {
        data.push({ ID: e[0], DI: e[1][0], SN: e[1][2], SNS: e[1][1] })
      })
      return data
    }
  })
       
})