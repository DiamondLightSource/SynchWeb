define(['marionette', 'utils', 'utils/xhrimage', 'tpl!templates/dc/load.html'], 
    function(Marionette, utils, XHRImage, template) {

    return Marionette.ItemView.extend({
        template: template,

        ui: {
            sns: '.snapshots',
        },

        initialize: function(options) {
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
        },
        
        lazyLoad: function() {
            var inview = this.$el.find('.lazy').not('.enabled').filter(function() {
                return utils.inView($(this))
            })
            
            inview.each(function(j,i) {
                var image = new XHRImage()
                image.onload = function() {
                    $(i).attr('src', this.src)
                    // Give small amount of time for the image to be replaced
                    setTimeout(function() {
                        $(i).addClass('show')
                    }, 100)
                }
                $(i).addClass('enabled')
                image.load($(i).attr('data-src'))
            })
        },

        onRender: function() {
            this.$el.find('.snapshots a').magnificPopup({ type: 'image' })
            if (!this.model.get('X2')) this.ui.sns.hide()
        },

        onDomRefresh: function() {
            this.lazyLoad()
        },
    })
       
})