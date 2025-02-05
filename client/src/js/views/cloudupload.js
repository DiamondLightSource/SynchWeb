define([
    'backbone',
    'views/dialog',
    'templates/dc/cloudupload.html',
    'jquery.cookie'
], function(
    Backbone,
    DialogView,
    template
) {

    return DialogView.extend({
        template: template,
        title: 'Upload to CCP4 Cloud',

        buttons: {
            'Upload': 'upload',
            'Cancel': 'closeDialog',
        },
        
        ui: {
            username: 'input[name=username]',
            cloudrunid: 'input[name=cloudrunid]',
            remember: 'input[name=remember]',
        },
        
        upload: function() {
            if (this.ui.remember.is(':checked')) {
                let cookieOpts = { expires: 365, path: '/' }
                $.cookie('ccp4_username', this.ui.username.val(), cookieOpts)
                $.cookie('ccp4_cloudrunid', this.ui.cloudrunid.val(), cookieOpts)
            }
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/processing/upload',
                type: 'POST',
                data: { id: this.model.get('AUTOPROCPROGRAMATTACHMENTID'), cloudrunid: this.ui.cloudrunid.val(), username: this.ui.username.val() },
                success: function() {
                    app.alert({ className: 'message notify', message: 'File successfully uploaded' })
                    self.closeDialog()
                    self.collection.trigger('file:uploaded')

                },
                error: function(xhr, status, error) {
                    app.alert({ message: 'Something went wrong uploading this file: '+xhr.responseText })
                },
            })
        },
        
        initialize: function(options) {
            this.collection = options.collection
        },
        
        onRender: function() {
            let ccp4_username = $.cookie('ccp4_username');
            let ccp4_cloudrunid = $.cookie('ccp4_cloudrunid');
            if (ccp4_username) this.ui.username.val(ccp4_username)
            if (ccp4_cloudrunid) this.ui.cloudrunid.val(ccp4_cloudrunid)    
            if (ccp4_username || ccp4_cloudrunid) this.ui.remember.prop('checked', true)
        }

        
    })
    
})
