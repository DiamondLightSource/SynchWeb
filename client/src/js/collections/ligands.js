define(['underscore', 'backbone.paginator', 'models/ligand'], function(_, PageableCollection, Ligand) {
    
    return PageableCollection.extend({
        model: Ligand,
        mode: 'server',
        url: '/sample/ligands',
            
        state: {
            pageSize: 15,
        },
            
        parseState: function(r, q, state, options) {
            return { totalRecords: r.total }
        },
            
        parseRecords: function(r, options) {
            return r.data
        },

        initialize: function(collection, options) {
            this.fetched = false
            this.on('sync', this.setFetched, this)
            if (options && options.pmodel) {
                this.pmodel = options.pmodel
                this.listenTo(this, 'change add remove', this._update_ligand_ids)
                this.listenTo(this.pmodel, 'sync', this._add_ligands)
                this._add_ligands()
            }
        },

        setFetched: function() {
          if (this.fetched) return
          this.fetched = true
          this.trigger('reset')
        },

        _update_ligand_ids: function() {
            var ligs = this.slice(0)
            var flds = { 
                LIGANDIDS: _.map(ligs, function(m) { return m.get('LIGANDID') }),
                LIGANDNAMES: _.map(ligs, function(m) { return m.get('NAME') }),
            }
            this.pmodel.set(flds)
        },

        _add_ligands: function() {
            var ids = this.pmodel.get('LIGANDIDS') || []
            var nas = this.pmodel.get('LIGANDNAMES') || []
            var ligs = _.map(ids, function(id, i) { 
                return { 
                    LIGANDID: id, 
                    NAME: nas[i],
                }
            })
            this.reset(ligs)
        },
    })
})
