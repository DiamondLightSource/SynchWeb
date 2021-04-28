define(['backbone', 'modules/dc/models/apstatus'], function(Backbone, DCAPStatusModel) {

  return Backbone.Collection.extend({
    model: DCAPStatusModel,
                                                           
    url: '/processing/status',
  
    parse: function(r, options) {
      var data = []
      _.each(r, function(e) {
        data.push({ ID: e[0], STATES: e[1] })
      })
      return data
    }
  })
       
})