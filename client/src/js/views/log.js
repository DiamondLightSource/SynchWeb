define(['marionette', 'views/dialog'], function(Marionette, DialogView) {

    return DialogView.extend({
        className: 'fixedwidth',
        template: false,
        
        initialize: function(options) {
            this.url = options.url
            this.load()
            this.iframe = $(`<iframe style="position: absolute;"></iframe>`)
        },

        // Override existing dialogOptions of Dialog View
        dialogOptions: function() {
            return _.extend({}, {
                title: this.getOption('title'),
                width: '80%',
                height: '500', // reasonable height that can be adjusted by resizing the window
                resizable: true,
                buttons: this.generateButtons(this.getOption('buttons'))
            }, this.getOption('dOptions'))
        },
        
        load: function() {
            var self = this

            var HTMLTagsToReplace = {
                '<': '&lt;',
                '>': '&gt;'
            };
            
            function replaceHTMLTag(tag) {
                return HTMLTagsToReplace[tag] || tag;
            }
            
            function escapeHTMLTags(str) {
                return str.replace(/[<>]/g, replaceHTMLTag);
            }

            var xhr = new XMLHttpRequest()
            xhr.open('GET', this.url, true)
            xhr.responseType = 'arraybuffer'

            xhr.onload = function(e) {
                if (xhr.status == 0 || xhr.status != 200) {
                    return
                }

                var h = xhr.getAllResponseHeaders()
                var m = h.match(/^Content-Type:\s*(.*?)$/mi)
                var mimeType = m[1] || 'image/png'

                if (mimeType == 'application/pdf' || mimeType == 'image/png') {
                    var url = URL.createObjectURL(new Blob([this.response], { type: mimeType }))
                    self.iframe[0].src = url

                } else {
                    var doc = self.iframe[0].contentWindow.document
                    var dec = new TextDecoder('utf-8')
                    var text = dec.decode(this.response)

                    if (mimeType.indexOf('text/plain') > -1) text = '<pre>'+escapeHTMLTags(text)+'</pre>'

                    doc.open()
                    doc.write(text)
                    doc.close()
                }

            }

            xhr.send()
        },

        render: function() {
            // Bind UI elements if not already done (render might be called multiple times)
            this.bindUIElements()
            this.$el.append(this.iframe)
            
            this.$el.find('iframe').css('width', "99%")
            this.$el.find('iframe').css('height', "98%")
            return this
        }
        
    })
    
})
