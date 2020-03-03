/**
 * The view of all data collections for SM
 */
define([
    'modules/dc/datacollections',
    'modules/types/gen/dc/dclist',
    'modules/types/sm/dc/dc',
    ], function(
    DataCollections,
    DCList,
    DCItemView) {

    var SmDCList = DCList.extend({
        apStatus: true,
        dcViews: {
            data: DCItemView,
        }
    })

    return DataCollections.extend({
        dcListView: SmDCList,
        filters: false,
        sampleChanger: false,
        
    })

})
