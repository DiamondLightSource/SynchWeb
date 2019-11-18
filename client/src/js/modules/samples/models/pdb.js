define(['backbone', 'models/wfile'], function(Backbone, File) {

    return Backbone.Model.extend(_.extend({}, {
        idAttribute: 'PROTEINHASPDBID',
        urlRoot: '/sample/pdbs',
        
        validation: {
            pdb_code: function(v) {
                if (v) {
                    if (!v.match(/^\w\w\w\w$/)) return 'Invalid PDB Code'
                }
            },
        
            pdb_file: function(v) {
                if (v) {
                    var parts = v.name.split('.')
                    var ext = parts[parts.length-1]
                    console.log('pdb val', parts, ext)
                    if (ext != 'pdb' && ext != 'PDB') return 'This file must be a PDB file'
                }
            }
        },
        
        
        initialize: function(options) {
            this.pid = options.pid
        },
        
    }, File))

})