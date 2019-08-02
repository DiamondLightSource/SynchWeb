define([
        'modules/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, template) {
      
    return DataCollections.extend({
        dcListView: DCList,
        template: template,
        
        filters: false,
        sampleChanger: false,
        
    })
})
