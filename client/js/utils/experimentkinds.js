define([], function() {
    
    return {
        opts: function() {
            return _.map(this.list, function(v,s) { return '<option value="'+v+'">'+s+'</option>' }).join()
        },
        obj: function() {
            return this.list
        },

        key: function(value) {
            return _.invert(this.list)[value]
        },

        list: {
            '': '',
            'native': 'OSC',
            'anomalous': 'SAD',
        }
        
    }
    
})