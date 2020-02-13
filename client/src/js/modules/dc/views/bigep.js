define(['marionette',
    'collections/autoprocattachments',
    'modules/dc/views/autoprocattachments',
    'templates/dc/dc_bigep.html',
    'utils/xhrimage'], function(Marionette, AutoProcAttachments, AutoProcAttachmentsView,
        template, XHRImage) {
    
    return Marionette.ItemView.extend({
        template: template,
        modelEvents: { 'change': 'render' },
        
        events: {
            'click a.apattach': 'showAttachments',
        },
        
        showAttachments: function(e) {
            e.preventDefault()

            var aid = e.currentTarget.id.split('-bigep-files')[0]
            this.attachments = new AutoProcAttachments()
            this.attachments.queryParams.AUTOPROCPROGRAMID = aid
            this.attachments.fetch()

            app.dialog.show(new DialogView({ 
                title: 'Auto Processing Attachments: '+this.model.escape('TYPE'),
                view: new AutoProcAttachmentsView({ collection: this.attachments}), 
                autosize: true 
            }))
        },

        showThumbnail: function() {
            for (const aid in this.images) {
                for (const ppl in this.images[aid]) {
                    this.$el.find(`#${ aid }${ ppl }-thumb`).attr('src', this.images[aid][ppl].src)
                }
            }
        },

        onDomRefresh: function() {
            this.images = {}
            var autoproc_data = this.model.get('AID')
            for (const aid in autoproc_data) {
                this.images[aid] = {}
                for (const ppl in autoproc_data[aid]['PROC']) {
                    this.images[aid][ppl] = new XHRImage()
                    this.images[aid][ppl].onload = this.showThumbnail.bind(this)
                    this.images[aid][ppl].load(app.apiurl+'/image/bigep/aid/' + aid + '/ppl/' + ppl)
                }
            }
        }
    })
})