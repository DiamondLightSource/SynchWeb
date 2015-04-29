define(['backbone', 'markdown'], function(Backbone, markdown) {
    
    return Backbone.Model.extend({
        idAttribute: 'PROTEINID',
        urlRoot: '/sample/proteins',
        
        initialize: function() {
            this.on('change', this.refreshOptions, this)
            this.refreshOptions()
        },
        
        defaults: {
            SEQUENCEMD: '',
        },
        
        refreshOptions: function() {
            if (this.get('SEQUENCE')) this.attributes.SEQUENCEMD = markdown.toHTML(this.get('SEQUENCE'))
        },

        validation: {
            ACRONYM: {
                required: true,
                pattern: 'wwdash',
            },
            SEQUENCE: {
                required: false,
                pattern: 'sequence',
            },
            MOLECULARMASS: {
                required: false,
                pattern: 'number',
            },
        },
    })
    
})
