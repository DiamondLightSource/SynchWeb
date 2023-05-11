/**
 * The view of all data collections for SM
 */
define([
    'modules/dc/datacollections',
    'modules/types/gen/dc/dclist',
    'modules/types/sm/dc/dc',
    'modules/dc/views/load',
    ], function(
    DataCollections,
    DCList,
    DCItemView,
    RobotLoad) {

    var SmDCList = DCList.extend({
        apStatus: true,
        dcViews: {
            data: DCItemView,
            load: RobotLoad,
        }
    })

    return DataCollections.extend({
        dcListView: SmDCList,
        // Filters refers to the pills that show datacollections, grid scans, robot loads etc.
        filters: true,
        sampleChanger: false,
        
    })

})
