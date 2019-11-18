define(['backbone.paginator', 'utils/kvcollection', 'modules/admin/models/group'], function(PageableCollection, KVCollection, Group) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Group,
        mode: 'client',
        url: '/users/groups',
        
        keyAttribute: 'NAME',
        valueAttribute: 'USERGROUPID',
    }))


})