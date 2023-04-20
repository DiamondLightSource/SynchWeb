define(['backbone.paginator', 'modules/imaging/models/plan', 'utils/kvcollection'], function(PageableCollection, Plan, KVCollection) {
       
      return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Plan,
        mode: 'client',
        url: '/sample/plan',
                     
        keyAttribute: 'COMMENTS',
        valueAttribute: 'DIFFRACTIONPLANID',

        state: {
              pageSize: 15,
        },
      }))

})