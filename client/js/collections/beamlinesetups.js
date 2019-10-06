define(['backbone.paginator', 'models/beamlinesetup', 'utils/kvcollection'], function(PageableCollection, BeamlineSetup, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: BeamlineSetup,
        mode: 'server',
        url: '/exp/setup',
                
        keyAttribute: 'SETUPDATE',
        valueAttribute: 'BEAMLINESETUPID',

        state: {
            pageSize: 15,
        },      

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },                      
    }))

})
