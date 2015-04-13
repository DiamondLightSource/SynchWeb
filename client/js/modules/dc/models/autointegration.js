define(['backbone'], function(Backbone){
       
    return Backbone.Model.extend({
        idAttribute: 'AID',
        
        initialize: function(options) {
            this.addClasses()
        },
        
        addClasses: function() {
            this.attributes.CLASS = { RMERGE: {}, RMEAS: {}, COMPLETENESS: {} }
            _.each(['overall', 'innerShell', 'outerShell'], function(k) {
                var c = this.get('SHELLS')[k].COMPLETENESS
                this.attributes.CLASS.COMPLETENESS[k] = c > 95 ? 'active' : (c > 80 ? 'minor' : 'inactive')

                var r = this.get('SHELLS')[k].RMEAS
                this.attributes.CLASS.RMEAS[k] = r < 0.5 ? 'active' : (r < 0.6 ? 'minor' : 'inactive')
            }, this)
        },
    })

})
