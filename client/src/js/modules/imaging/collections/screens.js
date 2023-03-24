define(['backbone.paginator', 'modules/imaging/models/screen', 'utils/kvcollection'], function(PageableCollection, Screen, KVCollection) {
       
      return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Screen,
        mode: 'client',
        url: '/imaging/screen',
                     
        keyAttribute: 'NAME',
        valueAttribute: 'SCREENID',

        state: {
              pageSize: 15,
        },
      }))

})