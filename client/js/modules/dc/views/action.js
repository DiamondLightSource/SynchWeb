define(['marionette', 'utils', 'tpl!templates/dc/action.html'], function(Marionette, utils, template) {

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
                $(i).attr('src', $(i).attr('data-src')).addClass('enabled').load(function() {
                    $(this).addClass('show')
                })
                
            })
        },
    })
       
})