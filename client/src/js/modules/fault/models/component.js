define(['backbone'], function(Backbone) {

    return Backbone.Model.extend({
        defaults: {
            NAME: '',
            DESCRIPTION: '',
            BEAMLINES: '',
        },
        initialize: function(options) {
            this.on('change', this._add_id, this)
            this._add_id()
        },
        urlRoot: '/fault/com',
        idAttribute: 'COMPONENTID',

        _add_id: function() {
            this.set('ID', this.get('COMPONENTID'))
        },

    })
    
})
