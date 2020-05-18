define([
        'modules/types/gen/dc/datacollections',
        'modules/types/gen/dc/dclist',
        'modules/types/spec/dc/dc',
        'modules/types/spec/dc/xrfmap',
        'modules/types/spec/dc/energyscan',
        'modules/types/spec/dc/mosaic',
        'templates/types/gen/dc/dclist.html',
        ],
function(DataCollections, DCList, DCItemView, XRFMapItemView, EnergyScanItemView, MosaicItemView, template) {
    
    var SpecDCList = DCList.extend({
        getChildView: function(item) {
            var ty = item.get('DCT')
            var sty = item.get('TYPE')

            if (ty in this.getOption('dcViews')) return this.getOption('dcViews')[ty]
            else if (sty in this.getOption('dcViews')) return this.getOption('dcViews')[sty]
            else return this.getOption('dcViews').data
        },

        dcViews: {
            mosaic: MosaicItemView,
            data: DCItemView,
            xrfmap: XRFMapItemView,
            'XRF map': XRFMapItemView,
            'Energy scan': EnergyScanItemView,
        }
    })
    
    return DataCollections.extend({
        dcListView: SpecDCList,
        template: template,
    })
})
