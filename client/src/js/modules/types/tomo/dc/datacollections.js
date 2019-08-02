define([
        'modules/types/gen/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'modules/types/tomo/dc/dc',
        'templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, DCItemView, template) {
    
    var TomoDCList = DCList.extend({
        dcViews: {
            data: DCItemView,
        }
    })
    
    return DataCollections.extend({
        dcListView: TomoDCList,
        template: template,
    })
})
