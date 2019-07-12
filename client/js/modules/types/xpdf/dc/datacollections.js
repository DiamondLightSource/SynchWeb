/**
 * The view of all data collections for XPDF
 */
define([
    'modules/dc/datacollections',
    'modules/types/gen/dc/dclist',
    'modules/types/xpdf/dc/dc',
    'templates/types/xpdf/dc/dclist.html',
    ], function(
    DataCollections,
    DCList,
    DCItemView,
    template) {

    var XpdfDCList = DCList.extend({
        dcViews: {
            data: DCItemView,
        }
    })

    return DataCollections.extend({
        dcListView: XpdfDCList,
        template: template,
        filters: false,
        sampleChanger: false,
        
    })

})
