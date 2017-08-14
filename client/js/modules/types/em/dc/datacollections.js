define([
        'modules/types/gen/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'modules/types/em/dc/dc',
        'modules/types/em/collections/apstatuses',
        'tpl!templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, DCItemView, EMAPStatuses, template) {
    
    var EMDCList = DCList.extend({
        apStatusCollection: EMAPStatuses,
        dcViews: {
            data: DCItemView,
        },
        apStatus: true,
    })
    
    return DataCollections.extend({
        dcListView: EMDCList,
        template: template,
    })
})
