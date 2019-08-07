define(['backbone.paginator', 'utils/kvcollection', 'models/user'], function(PageableCollection, KVCollection, User) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: User,
        url: '/users',
        
        keyAttribute: 'FULLNAME',
        valueAttribute: 'PERSONID',

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {                
            return r.data
        },
    }))

})