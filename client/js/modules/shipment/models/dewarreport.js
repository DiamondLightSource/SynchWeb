define(['backbone', 'markdown', 'models/wfile'], function(Backbone, markdown, File) {
    
    return Backbone.Model.extend(_.extend({}, {
    	idAttribute: 'DEWARREPORTID',
        urlRoot: '/shipment/dewars/reports',
            
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
            FACILITYCODE: {
                required: true,
                pattern: 'wwdash',
            },

            REPORT: {
                required: true,
            },

            ATTACHMENT: function(v) {
                if (v) {
                    var ext = v.substr(v.lastIndexOf('.')+1)
                    if (['png', 'jpg', 'jpeg'].indexOf(ext.toLower()) == -1) {
                        return 'Attachment must be a png or jpeg file'
                    }
                }
            }
        }
    }, File))
})