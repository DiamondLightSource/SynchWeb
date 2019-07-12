define(['marionette', 
    'collections/attachments',
    'uglymol', 'gzip',  
    'templates/dc/mapmodelview.html'], function(Marionette, Attachments, Uglymol, Zlib, 
        template) {

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            peaks: 'div.peaks',
        },

        events: {
            'change @ui.res': 'gotoResidue',
        },

        ui: {
            viewer: '#viewer',
            hud: '#hud',
            res: 'select[name=residue]',
        },
        

        loadData: function() {
            if (!this.attachments.length) {
                this.ui.hud.text('No reciprocal space data for this datacollection')
                return
            }

            var xhr = this.xhrWithStatus('Downloading Reciprocal Space Data')
            var self = this
            
            xhr.onload = function() {
                var gunzip = new Zlib.Gunzip(new Uint8Array(this.response))
                var plain = gunzip.decompress()
                var url = URL.createObjectURL(new Blob([plain], {type: 'text'}))
                self.viewer.load_data(url)
            }
          

            var attachment = this.attachments.at(0)
            xhr.open('GET', app.apiurl+'/download/attachment/id/'+this.model.get('ID')+'/aid/'+attachment.get('DATACOLLECTIONFILEATTACHMENTID'))
            xhr.responseType = 'arraybuffer'
            if (app.token) xhr.setRequestHeader('Authorization','Bearer ' + app.token)
            xhr.send()
        },

        initialize: function() {
            this.attachments = new Attachments()
            this.attachments.queryParams.id = this.model.get('ID')
            this.attachments.queryParams.filetype = 'recip'
            this.ready = this.attachments.fetch()
        },


        onDomRefresh: function() {
            this.$el.find('.peaks').hide()
            this.ui.res.hide()
            this.viewer = new Uglymol.ReciprocalViewer({viewer: 'viewer', hud: 'hud', help: 'help'})
            this.ready.done(this.loadData.bind(this))
        },


        xhrWithStatus: function(title) {
            var xhr = new window.XMLHttpRequest()
            var self = this
            xhr.addEventListener('progress', function(e) {
                self.ui.hud.text(title+' '+((e.loaded/e.total)*100).toFixed(0) + '%')
            })
            return xhr
        },

    })


})