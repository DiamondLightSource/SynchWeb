define(['backbone.paginator', 'utils/kvcollection'], function(PageableCollection ,KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        mode: 'client',
        url: '/shipment/countries',
                                          
        state: {
            pageSize: 15,
        },

        comparator: 'TITLE',

        keyAttribute: 'TITLE',
        valueAttribute: 'TITLE',

    }))
})