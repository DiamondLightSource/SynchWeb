define(['backbone'], function(Backbone) {
    
    return {
	    // Updated options so you can pass a callback function.
        // The callback will receive the model and should return the class to add for that entry
        opts: function(options) {
            return (options && options.empty ? '<option value=""> - </option>' : '') +
                this.map(function(m) {
                    var cl= ''
                    if (options && options.callback instanceof Function) cl = options.callback(m)
                    else if (options && options.addClass && options.classProperty) {
                        if (m.get(options.classProperty) == options.classPropertyValue) cl = options.addClass
                    }
                    return '<option class="'+cl+'" value="'+m.escape(this.valueAttribute)+'">'+m.escape(this.keyAttribute)+'</option>'
                }, this).join('\n')
        },

        kv: function(options) {
            var kv = {}
            if (options && options.empty) kv[''] = ' - '
                
            this.each(function(m) {
                kv[m.escape(this.valueAttribute)] = m.escape(this.keyAttribute)
            }, this)

            return kv
        },

        array: function(options) {
            var arr = []
            if (options && options.none) arr.push(['-', ''])

            this.each(function(m) {
                arr.push([m.get(this.keyAttribute), m.get(this.valueAttribute)])
            }, this)

            return arr
        }
    }

})