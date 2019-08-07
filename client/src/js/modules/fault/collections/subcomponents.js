define(['backbone.paginator', 'utils/kvcollection', 'modules/fault/models/subcomponent'], function(PageableCollection, KVCollection, SubComponent) {

    return PageableCollection.extend(_.extend({}, KVCollection, {
        model: SubComponent,
        url: '/fault/scom',
        
        keyAttribute: 'NAME',
        valueAttribute: 'SUBCOMPONENTID',
    }))


})