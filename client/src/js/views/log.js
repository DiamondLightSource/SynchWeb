define(['marionette', 'views/dialog', 'utils'], function(Marionette, DialogView, utils) {

    return DialogView.extend({
        className: 'fixedwidth',
        template: false,
        
        initialize: function(options) {
            this.url = options.url
            this.load()
            this.iframe = $(
                `<iframe style="position: absolute;" onload="this.style.height=(this.contentWindow.document.body.scrollHeight)+'px';this.style.width=(this.contentWindow.document.body.scrollWidth)+'px';"></iframe>`)
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
                var m = h.match(/^Content-Type\:\s*(.*?)$/mi)
                var mimeType = m[1] || 'image/png'

                var blob = new Blob([this.response], { type: mimeType })

                // inject sign handler
                // Note this uses an old jquery copied from src into assets dir
                var sh = '<script src="/assets/js/jquery-1.9.1.min.js"></script>\n\
                <script type="text/javascript">\n\
                    $(document).ready(function() {\n\
                        var app = { apiurl: "'+app.apiurl+'", prop: "'+app.prop+'"}\n\
                        app.token = sessionStorage.getItem(\'token\')\n\
                        var root = "'+self.url.replace(/\?token=.*/, '')+'"\n\
                        var ajax = function(options) {\n\
                            options.data.prop = app.prop\n\
                            if (app.token) {\n\
                                options.beforeSend = function(request){\n\
                                    request.setRequestHeader(\'Authorization\', \'Bearer \' + app.token);\n\
                                }\n\
                            }\n\
                            return $.ajax.call(this, options)\n\
                        }\n\
                        var Backbone = { ajax: ajax }\n\
                        var sign = '+utils.sign.toString()+'\n\
                        $("a").click(function(e) {\n\
                            var is_relative_to_page = function(href) {\n\
                                return href.match(/^\\/|(http:|https:|ftp:|mailto:|javascript:)/) === null;\n\
                            }\n\
                            var is_routable = function(href) {\n\
                                return href.indexOf("#") === -1 && is_relative_to_page(href);\n\
                            }\n\
                            var href = $(this).attr("href")\n\
                            if (!is_routable(href)) return true\n\
                            e.preventDefault()\n\
                            var url = root+\'/\'+href\n\
                            \sign({\n\
                                url: url,\n\
                                callback: function(resp) {\n\
                                    window.location = url+\'?token=\'+resp.token\n\
                                }\n\
                            })\n\
                        })\n\
                    });\n\
                </script>'

                if (mimeType == 'application/pdf' || mimeType == 'image/png') {
                    var url = URL.createObjectURL(new Blob([this.response], { type: mimeType }))
                    self.iframe[0].src = url

                } else {
                    var doc = self.iframe[0].contentWindow.document
                    var dec = new TextDecoder('utf-8')
                    var text = dec.decode(this.response)

                    if (mimeType.indexOf('text/plain') > -1) text = '<pre>'+escapeHTMLTags(text)+'</pre>'

                    doc.open()
                    doc.write(sh+text)
                    doc.close()
                }

            }

            xhr.send()
        },

        onRender: function() {
            this.$el.append(this.iframe)
            
            this.$el.find('iframe').css('width', $(window).width()*(app.mobile() ? 0.8 : 0.5))
            this.$el.find('iframe').css('height', $(window).height()*(app.mobile() ? 0.8 : 0.5))

        }
        
    })
    
})