define(['backbone.paginator', 'models/dewar', 'utils/kvcollection'], function(PagableCollection, Dewar, KVCollection) {

    return PagableCollection.extend(_.extend({}, KVCollection, {
        mode: 'server',
        model: Dewar,
        url: function() { return '/shipment/dewars'+(this.id ? '/sid/'+this.id : '')+(this.fc ? '/fc/'+this.fc : '') },
          
        state: {
            pageSize: 15,
        },

        keyAttribute: 'CODE',
        valueAttribute: 'DEWARID',

        initialize: function(models, options) {
            if (options) {
                this.id = options.id
                this.fc = options.FACILITYCODE
              }
        }, 

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },     
  }))

})
