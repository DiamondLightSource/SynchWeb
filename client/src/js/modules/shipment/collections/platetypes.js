define(['backbone', 'modules/shipment/models/platetype', 'utils/kvcollection'], function(Backbone,  PlateType, KVCollection) {
    
    var plate_types = [
         { name: 'Puck', capacity: 16 },
         { name: 'Unipuck', capacity: 16 },
         { name: 'Actorpuck', capacity: 12 },
         { name: 'Spinepuck', capacity: 10 },
         { name: 'I23puck', capacity: 4 },
        
         { name: 'ReferencePlate', well_per_row: 2,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 4
         },

         { name: 'CrystalQuickX', well_per_row: 12,
             drop_per_well_x: 2, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*2
        },
         { name: 'MitegenInSitu', well_per_row: 12,
             drop_per_well_x: 2, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*2
        },
        { name: 'FilmBatch', well_per_row: 12,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96
        },
	{ name: 'MitegenInSitu_3_Drop', well_per_row: 12,
             drop_per_well_x: 3, drop_per_well_y: 1,
             drop_height: 0.5, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 96*3
        },
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
        },/*
         { name: 'Linbro 24 well', well_per_row: 6,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 24
        },*/
         { name: 'PCRStrip', well_per_row: 9,
             drop_per_well_x: 1, drop_per_well_y: 1,
             drop_height: 1, drop_width: 1,
             drop_offset_x: 0, drop_offset_y: 0,
             well_drop: -1,
             capacity: 9
        },
    ]

    return Backbone.Collection.extend(_.extend({}, KVCollection, {
        plateTypes: plate_types,
        model: PlateType,
      
        keyAttribute: 'name',
        valueAttribute: 'name',
        
        initialize: function(models, options) {
            if (options && options.filtered && app.options.get("enabled_container_types").length) {
                var filtered = _.filter(this.plateTypes, function(pl) {
                    return app.options.get("enabled_container_types").indexOf(pl.name) > -1
                })
                this.reset(filtered)    
            } else {
                this.reset(this.plateTypes)
            }

            
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

})
