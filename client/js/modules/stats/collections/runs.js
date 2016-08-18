define(['backbone.paginator', 'utils/kvcollection'], function(PageableCollection, KVCollection) {
       
  return PageableCollection.extend(_.extend({}, KVCollection, {
    mode: 'client',
    url: '/vstat/runs',
                                  
    keyAttribute: 'RUN',
    valueAttribute: 'RUNID',

    state: {
      pageSize: 15,
    },
      
  }))
})