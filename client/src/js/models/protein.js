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
            CONCENTRATIONTYPE: '',
            // ABUNDANCE: 0,
        },
        
        refreshOptions: function() {
            if (this.get('SEQUENCE')) this.attributes.SEQUENCEMD = markdown.toHTML(this.get('SEQUENCE'))
        },

        validation: {
            NAME: {
                required: false,
                pattern: 'wwsbdash',
            },
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
            CONCENTRATIONTYPEID: {
                required: false,
                pattern: 'number',
            },
            COMPONENTTYPEID: {
                required: false,
                pattern: 'number',  
            },
            COMPONENTSUBTYPEID: {
                required: false,
                pattern: 'number',  
            },
            ABUNDANCE: {
                required: false,
                pattern: 'number',
            },
        },
    })
    
})
