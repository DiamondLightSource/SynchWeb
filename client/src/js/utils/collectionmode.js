define([], function() {
    
    return {
        opts: function() {
            return _.map(this.list, function(v,s) { return '<option value="'+v+'">'+s+'</option>' }).join()
        },
        obj: function() {
            return _.invert(this.list)
        },

        key: function(value) {
            return _.invert(this.list)[value]
        },

        list: {
            'auto': 'auto',
            'manual': 'manual',
        }
        
    }
    
})
