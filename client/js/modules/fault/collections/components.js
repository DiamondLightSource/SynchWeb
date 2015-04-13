define(['backbone.paginator', 'utils/kvcollection', 'modules/fault/models/component'], function(PageableCollection, KVCollection, Component) {
    
    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: Component,
        url: '/fault/com',
        
        keyAttribute: 'NAME',
        valueAttribute: 'COMPONENTID',
    }))


})