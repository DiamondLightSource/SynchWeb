define(['backbone.paginator', 'utils/kvcollection', 'modules/fault/models/system'], function(PageableCollection, KVCollection, System) {

    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: System,
        url: '/fault/sys',
        
        keyAttribute: 'NAME',
        valueAttribute: 'SYSTEMID',
    }))


})