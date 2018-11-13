define([], function() {
    
    return {
        opts: function() {
            return _.map(this.list.sort(), function(s) { return '<option value="'+s+'">'+s+'</option>' }).join()
        },
        obj: function() {
            var ob = {}
            _.each(this.list.sort(), function(cm) {
                ob[cm] = cm
            })

            return ob
        },

        list: [
            '',
            'optical',
            'diffraction',
        ]
        
    }
    
})