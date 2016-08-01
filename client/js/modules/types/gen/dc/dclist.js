define([
        'modules/dc/dclist',
        'modules/types/gen/dc/collections/imagestatuses',
        'modules/types/gen/dc/dc',
        ],
function(DCList, DCImageStatusCollection, DCItemView) {
          
    return DCList.extend({
        imageStatusCollection: DCImageStatusCollection,
        apStatus: false,
        rpStatus: false,
        dcViews: {
            data: DCItemView,
        },
    })
             

})
