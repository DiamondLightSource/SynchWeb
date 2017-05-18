define(['backbone', 'markdown', 'models/wfile'], function(Backbone, markdown, File) {
    
    return Backbone.Model.extend(_.extend({}, {
        idAttribute: 'DEWARREPORTID',
        urlRoot: '/shipment/containers/reports',
            
        initialize: function() {
            this.on('change', this.refreshOptions, this)
            this.refreshOptions()
        },
        
        defaults: {
            REPORTMD: '',
        },
        
        refreshOptions: function() {
            if (this.get('REPORT')) this.attributes.REPORTMD = markdown.toHTML(this.get('REPORT'))
        },

        validation: {
            CONTAINERREGISTRYID: {
                required: true,
                pattern: 'number',
            },

            REPORT: {
                required: true,
            },

            ATTACHMENT: function(v) {
                if (v) {
                    var parts = v.name.split('.')
                    var ext = parts[parts.length-1]

                    if (['jpg', 'jpeg'].indexOf(ext.toLowerCase()) == -1) {
                        return 'Attachment must be a jpeg file'
                    }
                }
            }
        }
    }, File))
})
