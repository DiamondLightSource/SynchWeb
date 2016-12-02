define([
        'modules/types/gen/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'modules/types/saxs/dc/dc',
        'tpl!templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, DCItemView, template) {
    
    var PowDCList = DCList.extend({
        dcViews: {
            data: DCItemView,
        }
    })
    
    return DataCollections.extend({
        dcListView: PowDCList,
        template: template,
    })
})
