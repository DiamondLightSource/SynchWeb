/**
 * The view of all data collections for XPDF
 */
define([
    'modules/dc/datacollections',
    'modules/types/gen/dc/dclist',
    'tpl!templates/types/xpdf/dc/dclist.html',
    ], function(
    DataCollections,
    DCList,
    template) {

    return DataCollections.extend({
        dcListView: DCList,
        template: template,
        filters: false,
        sampleChanger: false,
        
    })

})
