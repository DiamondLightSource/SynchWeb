define(['backbone.paginator', 'models/beamcalendar', 'utils/kvcollection'], function(PageableCollection, BeamlineCalendar, KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: BeamlineCalendar,
        mode: 'server',
        url: '/proposal/calendar',
                
        keyAttribute: 'RUN',
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
