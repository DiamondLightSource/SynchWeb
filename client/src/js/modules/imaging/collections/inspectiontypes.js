define(['backbone.paginator', 'modules/imaging/models/inspectiontype', 'utils/kvcollection'], function(PageableCollection, InspectionType, KVCollection) {
       
      return PageableCollection.extend(_.extend({}, KVCollection, {
        model: InspectionType,
        mode: 'client',
        url: '/imaging/inspection/types',

        keyAttribute: 'NAME',
        valueAttribute: 'INSPECTIONTYPEID',
                                          
        state: {
              pageSize: 15,
        },
      
      }))
})