define([
        'modules/types/gen/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'modules/types/saxs/dc/dc',
        'templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, DCItemView, template) {
    
    var SaxsDCList = DCList.extend({
        dcViews: {
            data: DCItemView,
        },
        apStatus: true,
    })

    return DataCollections.extend({
        dcListView: SaxsDCList,
        template: template,
    })
})
