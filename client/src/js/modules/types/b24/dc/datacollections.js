/**
 * The view of all data collections for B24
 * Copied directly from XPDF for easier pattern following
 * See dc-wrapper.vue for mapping file to templates
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
        },
        apStatus: true,
    })

    return DataCollections.extend({
        dcListView: XpdfDCList,
        template: template,
        filters: false,
        sampleChanger: false,

    })

})
