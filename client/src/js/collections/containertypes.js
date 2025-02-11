define(['backbone.paginator', 'models/containertypes', 'utils/kvcollection'], function(PageableCollection, ContainerTypes, KVCollection) {

    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: ContainerTypes,
        mode: 'client',
        url: '/shipment/containers/types',

        state: {
            pageSize: 9999,
        },

        parseState: function(r, q, state, options) {
          return { totalRecords: r.total }
        },

        parseRecords: function(r, options) {
            return r.data
        },

        keyAttribute: 'NAME',
        valueAttribute: 'CONTAINERTYPEID',

    }))
})
