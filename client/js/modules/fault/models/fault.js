define(['backbone', 'markdown', 'models/wfile'], function(Backbone, markdown, File) {
    
    return Backbone.Model.extend(_.extend({}, {
        idAttribute: 'FAULTID',
        urlRoot: '/fault',
      
        resolvedOptions: { 0: 'No', 1: 'Yes', 2: 'Partial' },
        btlOptions: { 0: 'No', 1: 'Yes' },
        
        events: {
            'change sync reset': 'refreshOptions',
        },

        initialize: function() {
            this.on('change', this.refreshOptions, this)
            this.refreshOptions()
        },
        
        defaults: {
            RESOLUTIONMD: '',
            DESCRIPTIONMD: '',
        },
        
        refreshOptions: function() {
            this.attributes.RESOLVEDTEXT = this.resolvedOptions[this.get('RESOLVED')]
            this.attributes.BEAMTIMELOSTTEXT = this.btlOptions[this.get('BEAMTIMELOST')]
            
            if (this.get('DESCRIPTION')) this.attributes.DESCRIPTIONMD = markdown.toHTML(this.get('DESCRIPTION'))
            if (this.get('RESOLUTION')) this.attributes.RESOLUTIONMD = markdown.toHTML(this.get('RESOLUTION'))
        },
        
        validation: {
            TITLE: {
                required: true,
            },
            STARTTIME: {
                required: true,
                pattern: 'datetime',
            },
            ENDTIME: {
                required: function() {
                    return this.get('RESOLVED') == 1
                },
                pattern: 'datetime',
            },
            BEAMTIMELOST_STARTTIME: {
                required: function() {
                    return this.get('BEAMTIMELOST') == 1
                },
                pattern: 'datetime',
            },
            BEAMTIMELOST_ENDTIME: {
                required: function() {
                    return this.get('BEAMTIMELOST') == 1
                },
                pattern: 'datetime',
            },
            SUBCOMPONENTID: {
                required: true,
                pattern: 'word',
            },
            BEAMTIMELOST: {
                required: true,
                pattern: 'number',
            },
            RESOLVED: {
                required: true,
                pattern: 'number',
            },
            RESOLUTION: {
                required: false,
            },
            DESCRIPTION: {
                required: true,
            },
            SESSIONID: {
                required: true,
                pattern: 'number',
            },
            ASSIGNEEID: {
                required: false,
                pattern: 'number',
            },
        },
        
    }, File))

})
