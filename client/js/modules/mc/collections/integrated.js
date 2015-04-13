define(['backbone.paginator'], function(PageableCollection) {
    
    var Integrated = Backbone.Model.extend({
        idAttribute: 'ID',
    })


    return PageableCollection.extend({
        model: Integrated,
        mode: 'client',
      
        state: {
            pageSize: 15,
        }
    })
      
})