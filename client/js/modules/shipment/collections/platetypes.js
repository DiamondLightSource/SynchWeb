define(['backbone', 'modules/shipment/models/platetype', 'utils/kvcollection'], function(PageableCollection,  PlateType, KVCollection) {
    
    var plate_types = [
         { name: 'Puck', capacity: 16 },
          
         { name: 'CrystalQuickX', well_per_row: 12,
             drop_per_well_x: 2, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*2
        },/*
         { name: 'Greiner 3 Drop', well_per_row: 12,
             drop_per_well_x: 3, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*3
        },
         { name: 'MRC Maxi', well_per_row: 6,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 0.5,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 48
        },
         { name: 'Mitagen In-Situ', well_per_row: 12,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0.5,
             well_drop: -1,
             capacity: 96
        },
         { name: 'MRC 2 Drop', well_per_row: 12,
             drop_per_well_x: 1, drop_per_well_y: 2,
             drop_height: 1, drop_width: 0.5,
             drop_offset_x: 0.5, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*2
        },
         { name: 'Griener 1536', well_per_row: 12,
             drop_per_well_x: 4, drop_per_well_y: 4,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*4*4
        },
         { name: '3 Drop Square', well_per_row: 12,
             drop_per_well_x: 2, drop_per_well_y: 2,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: 3,
             capacity: 96*3
        },
      
         { name: 'SWISSCI 3 Drop', well_per_row: 12,
             drop_per_well_x: 2, drop_per_well_y: 2,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: 1,
             capacity: 96*3
        },
         { name: '1 drop', well_per_row: 12,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 0.5,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96
        },
         { name: 'LCP Glass', well_per_row: 12,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96
        },
         { name: 'Linbro 24 well', well_per_row: 6,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 24
        },*/
    ]

    var PlateTypes = Backbone.Collection.extend(_.extend({}, KVCollection, {
        model: PlateType,
      
        keyAttribute: 'name',
        valueAttribute: 'name',
        
        initialize: function(options) {
            this.on('change:isSelected', this.onSelectedChanged, this);
        },
        
        onSelectedChanged: function(model) {
            this.each(function(model) {
                if (model.get('isSelected') === true && !model._changing) {
                    model.set({isSelected: false}, { silent: true })
                }
            })
            console.log('trigger selected change')
            this.trigger('selected:change')
        },
        
        
    }))
    
    return new PlateTypes(plate_types)
})