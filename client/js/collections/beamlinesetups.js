define(['backbone.paginator', 'models/beamlinesetup'], function(PageableCollection, BeamlineSetup) {
       
    return PageableCollection.extend({
        model: BeamlineSetup,
        mode: 'server',
        url: '/exp/setup',
                                          
        state: {
            pageSize: 15,
        },      

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },                      
    })

})
