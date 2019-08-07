define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'NAME',
        
        initialize: function(options) {
            this.on('change', this.addClass(), this)
            this.addClass()
        },
        
        addClass: function() {
            var k = this.get('NAME')
            var v = this.get('VALUE')
            if (k == 'Ring Current') c = v < 10 ? 'off' : 'on'
            else if (k == 'Ring State') c = v == 'User' ? 'on' : 'off'
            else if (k == 'Hutch') c = v == 'Locked' ? 'on' : 'off'
            else if (k == 'Refil') c = v == -1 ? 'off' : 'on'
            else c = v == 'Closed' ? 'off' : 'on'
            this.attributes.CLASS = c
        }
    })
    
})
