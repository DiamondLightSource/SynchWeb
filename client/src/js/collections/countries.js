define(['backbone.paginator', 'utils/kvcollection'], function(PageableCollection ,KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        mode: 'client',
        url: '/shipment/countries',
                                          
        state: {
            pageSize: 15,
        },

        // comparator: 'TITLE',
        comparator: function(m1,m2) {
            if (m1.get('TITLE') == 'United Kingdom') return -1
            else if (m2.get('TITLE') == 'United Kingdom') return 1
            else return m1.get('TITLE') == m2.get('TITLE') ? 0 : (m1.get('TITLE') > m2.get('TITLE') ? 1 : -1)
        },

        keyAttribute: 'TITLE',
        valueAttribute: 'TITLE',

    }))
})