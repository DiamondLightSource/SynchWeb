define([
        'modules/types/gen/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'modules/types/em/dc/dc',
        'tpl!templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, DCItemView, template) {
    
    var EMDCList = DCList.extend({
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
