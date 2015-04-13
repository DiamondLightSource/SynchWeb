define([], function() {
    
    return {
        opts: function() {
            return _.map(this.list, function(s) { return '<option value="'+s+'">'+s+'</option>' }).join()
        },
        obj: function() {
            var ob = {}
            _.each(this.list, function(sg) {
                ob[sg] = sg
            })

            return ob
        },

        list: ['',
        "Mn", 
        "Se", 
        "S",
        "Zn"
        ]
        
    }
    
})