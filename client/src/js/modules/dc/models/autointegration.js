define(['backbone'], function(Backbone){
       
    return Backbone.Model.extend({
        idAttribute: 'AID',
        
        initialize: function(options) {
            this.addClasses()
            this.addIcon()
        },
        
        addClasses: function() {
            if (this.get('PROCESSINGSTATUS') == '0') return
            var shells = this.get('SHELLS')
            if (!shells) return

            this.attributes.CLASS = { RMERGE: {}, RMEAS: {}, COMPLETENESS: {} }
            _.each(['overall', 'innerShell', 'outerShell'], function(k) {
                var c = shells[k] ? shells[k].COMPLETENESS : null
                this.attributes.CLASS.COMPLETENESS[k] = c > 95 ? 'active' : (c > 80 ? 'minor' : 'inactive')

                var r = shells[k] ? shells[k].RMEAS : null
                this.attributes.CLASS.RMEAS[k] = r < 0.5 ? 'active' : (r < 0.6 ? 'minor' : 'inactive')
            }, this)
        },

        addIcon: function() {
            var icons = {
                ERROR: '<i class="fa fa-exclamation-circle red"></i>',
                WARNING: '<i class="fa fa-exclamation-triangle orange"></i>'
            }
            var priorities = ['WARNING', 'ERROR']

            var priority = -1
            var icon = ''
            _.each(this.get('MESSAGES'), function(m) {
                var p = priorities.indexOf(m.SEVERITY)
                if (p > priority) {
                    priority = p
                    if (icons[m.SEVERITY]) icon = ' '+icons[m.SEVERITY]
                }
            })

            console.log('type icon', this.get('TYPE')+icon)
            this.set({
                ICON: icon,
                'TYPEICON': this.get('TYPE')+icon
            })
        },
    })

})
