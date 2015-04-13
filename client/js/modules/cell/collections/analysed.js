define(['backbone.paginator'], function(PageableCollection) {

    var analysed = Backbone.Model.extend({
        idAttribute: 'PDBENTRYID',

        initialize: function(options) {
            this.on('change', this.addState, this)
            this.addState()
        },

        addState: function() {
            var s = ''
            if (this.get('AUTOPROCCOUNT') == 0) s = 'No Results';
            if (this.get('AUTOPROCCOUNT') > 0 && this.get('BEAMLINEMATCH') != 1) s = 'No Match';
            if (this.get('AUTOPROCCOUNT') > 0 && this.get('BEAMLINEMATCH') != 1 && this.get('AUTHORMATCH') == 1) s = 'Mismatch';
            if (this.get('BEAMLINEMATCH') == 1) s = 'Matched';
            if (this.get('DISTANCE')) this.set('DISTANCE', parseFloat(this.get('DISTANCE')).toFixed(1))

            this.set('STATUS', s)

            this.set('BEAMLINEMATCHTEXT', this.get('BEAMLINEMATCH') == 1 ? 'Yes' : 'No')
            this.set('AUTHORMATCHTEXT', this.get('AUTHORMATCH') == 1 ? 'Yes' : 'No')
            this.set('PDBBEAMLINENAMESTRIPPED', this.get('PDBBEAMLINENAME').replace(/DIAMOND BEAMLINE /, ''))
        }

    })

    return PageableCollection.extend({
        model: analysed,
        mode: 'server',
        url: '/cell/analysed',
                                          
        state: {
            pageSize: 15,
        },
                                          
        queryParams: {
            pageSize: 'pp',
        },

        parseState: function(r, q, state, options) {
            return { totalRecords: parseInt(r[0]) }
        },
            
        parseRecords: function(r, options) {
            return r[1]
        },

    })
  
})