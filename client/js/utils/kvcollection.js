define(['backbone'], function(Backbone) {
    
    return {
        opts: function(options) {
            return (options && options.empty ? '<option value=""> - </option>' : '') +
                this.map(function(m) { 
                    var cl= ''
                    if (options && options.addClass && options.classProperty) {
                        if (m.get(options.classProperty) == options.classPropertyValue) cl = options.addClass
                    }
                    return '<option class="'+cl+'" value="'+m.get(this.valueAttribute)+'">'+m.get(this.keyAttribute)+'</option>' 
                }, this)
        },

        kv: function(options) {
            var kv = {}
            if (options && options.empty) kv[''] = ' - '
                
            this.each(function(m) {
                kv[m.get(this.valueAttribute)] = m.get(this.keyAttribute)
            }, this)

            return kv
        },
    }

})