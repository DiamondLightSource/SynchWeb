define(['backbone.paginator', 'models/labcontact', 'utils/kvcollection'], function(PageableCollection, LabContact ,KVCollection) {
       
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: LabContact,
        mode: 'server',
        url: '/contact',
                                          
        state: {
            pageSize: 15,
        },
                                          
        parseState: function(r, q, state, options) {
          return { totalRecords: r.total }
        },
      
        parseRecords: function(r, options) {
            return r.data
        },
        
        keyAttribute: 'CARDNAME',
        valueAttribute: 'LABCONTACTID',

    }))
})