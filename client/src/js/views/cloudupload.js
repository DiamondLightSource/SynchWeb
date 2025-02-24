define([
    'backbone',
    'views/dialog',
    'templates/dc/cloudupload.html'
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
        
        setCookie: function(cname, cvalue, exdays) {
            const d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },

        getCookie: function(cname) {
            let name = cname + "=";
            let ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },

        upload: function() {
            if (this.ui.remember.is(':checked')) {
                this.setCookie('ccp4_username', this.ui.username.val(), 365)
                this.setCookie('ccp4_cloudrunid', this.ui.cloudrunid.val(), 365)
            }
            let data = { cloudrunid: this.ui.cloudrunid.val(), username: this.ui.username.val() }
            if (this.model.get('AUTOPROCPROGRAMATTACHMENTID')) {
                data.AUTOPROCPROGRAMATTACHMENTID = this.model.get('AUTOPROCPROGRAMATTACHMENTID')
            } else if (this.model.get('DATACOLLECTIONFILEATTACHMENTID')) {
                data.DATACOLLECTIONFILEATTACHMENTID = this.model.get('DATACOLLECTIONFILEATTACHMENTID')
            }
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/processing/upload',
                type: 'POST',
                data: data,
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
            let ccp4_username = this.getCookie('ccp4_username')
            let ccp4_cloudrunid = this.getCookie('ccp4_cloudrunid')
            if (ccp4_username) this.ui.username.val(ccp4_username)
            if (ccp4_cloudrunid) this.ui.cloudrunid.val(ccp4_cloudrunid)    
            if (ccp4_username || ccp4_cloudrunid) this.ui.remember.prop('checked', true)
        }

        
    })
    
})
