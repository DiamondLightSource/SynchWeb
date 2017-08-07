define(['backbone', 'modules/samples/models/pdb'], function(Backbone, PDB) {

    return Backbone.Collection.extend({
        model: PDB,
        url: function() { return '/sample/pdbs'+(this.pid ? '/pid/'+this.pid : '') },
        
        initialize: function(models, options) {
            if (options) this.pid = options.pid
        },
        
        opts: function() {
            return '<option value="">N/A</option>' + this.map(function(p) { return '<option value="'+p.escape('PDBID')+'">'+p.escape('NAME')+' ('+(p.escape('CODE') ? 'Code' : 'File')+')</option>' })
        },
        
    })

})