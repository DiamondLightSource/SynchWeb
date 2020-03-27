define(['marionette', 'utils', 'utils/xhrimage', 'templates/dc/action.html', 'jquery.mp'], function(Marionette, utils, XHRImage, template) {

    return Marionette.ItemView.extend({
        template: template,
      
        initialize: function(options) {
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
        },
        
        
        lazyLoad: function() {
            var inview = this.$el.find('.lazy').not('.enabled').filter(function() {
                return utils.inView($(this))
            })

            var self = this
            inview.each(function(j,i) {
                var image = new XHRImage()
                image.onload = function() {
                    $(i).attr('src', this.src)
                    setTimeout(function() {
                        $(i).addClass('show')
                    }, 100)
                }
                $(i).addClass('enabled')
                if (self.model.get('X'+(j+1))) image.load($(i).attr('data-src'))
            })
        },

        onRender: function() {
            this.$el.find('.snapshots a').magnificPopup({ type: 'image' })
        },

        onDomRefresh: function() {
            this.lazyLoad()
        }
    })
       
})