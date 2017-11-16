/**
 * XPDF 'plate' types: sample changers and ordered sets of samples
 */
define(['modules/shipment/collections/platetypes'], function(GenericPlateTypes) {
    

    var xpdfPlateTypes = [
        { name: 'Box', well_per_row: 5,
            drop_per_well_x: 1, drop_per_well_y: 1,
            drop_height:1, drop_width: 1,
            drop_offset_x: 0, drop_offset_y: 0,
            well_drop: -1,
            capacity: 25,
        },
        
        { name: 'XpdfSampleChanger15', well_per_row: 15,
            drop_per_well_x: 1, drop_per_well_y:1,
            drop_height: 1, drop_width: 1,
            drop_offset_x: 0, drop_offset_y: 0,
            well_drop: -1,
            capacity: 15,
        },
        { name: 'XpdfSampleChanger7', well_per_row: 7,
            drop_per_well_x: 1, drop_per_well_y:1,
            drop_height: 1, drop_width: 1,
            drop_offset_x: 0, drop_offset_y: 0,
            well_drop: -1,
            capacity: 7,
        },
        { name: 'XpdfSingleSample', well_per_row: 1,
            drop_per_well_x: 1, drop_per_well_y:1,
            drop_height: 1, drop_width: 1,
            drop_offset_x: 0, drop_offset_y: 0,
            well_drop: -1,
            capacity: 1,
        },
        { name: 'XpdfGasFlowCell', well_per_row: 1,
            drop_per_well_x: 1, drop_per_well_y:1,
            drop_height: 1, drop_width: 1,
            drop_offset_x: 0, drop_offset_y: 0,
            well_drop: -1,
            capacity: 1,
        },
    ]
    
    return GenericPlateTypes.extend({
        plateTypes: xpdfPlateTypes,
    })

})
