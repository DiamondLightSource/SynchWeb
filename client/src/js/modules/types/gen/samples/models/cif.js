/**
 * Validation and upload model for CIF files
 */

define(['backbone', 'models/wfile'], function(Backbone, File ) {

    return Backbone.Model.extend(_.extend({}, {
        
        idAttribute: 'PROTEINHASPDBID',
        urlRoot: '/sample/pdbs',
        
        validation: {
            pbd_file: function(v) {
                if(v) {
                    var parts = v.name.split('.')
                    var ext = parts[parts.length-1]
                    if (ext.toLowerCase() != 'cif') return 'This file must be a CIF file'
                }
            }
        },
        
    },

    File))

})
