define(['backbone.paginator', 'utils/kvcollection', 'modules/admin/models/permission'], function(PageableCollection, KVCollection, Permission) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Permission,
        url: '/users/permissions',
        
        keyAttribute: 'TYPE',
        valueAttribute: 'PERMISSIONID',

        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {                
            return r.data
        },
    }))


})