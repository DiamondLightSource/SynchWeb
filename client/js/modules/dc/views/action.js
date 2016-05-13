define(['marionette', 'utils', 'utils/xhrimage', 'tpl!templates/dc/action.html'], function(Marionette, utils, XHRImage, template) {

    return Marionette.ItemView.extend({
        template: template,
      
        initialize: function(options) {
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
        },
        
        
        lazyLoad: function() {
            inview = this.$el.find('.lazy').not('.enabled').filter(function() {
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
    })
       
})