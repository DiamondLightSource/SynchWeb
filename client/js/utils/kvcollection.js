define(['backbone'], function(Backbone) {
    
    return {
        opts: function() {
            return this.map(function(m) { return '<option value="'+m.get(this.valueAttribute)+'">'+m.get(this.keyAttribute)+'</option>' }, this)
        },

        kv: function() {
            var kv = {}
            this.each(function(m) {
                kv[m.get(this.valueAttribute)] = m.get(this.keyAttribute)
            }, this)
            return kv
        },
    }

})