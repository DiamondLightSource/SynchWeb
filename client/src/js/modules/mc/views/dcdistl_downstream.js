define(['marionette', 
    'modules/dc/collections/autointegrations',
    'modules/dc/views/distl',
    'templates/mc/datacollection.html',
    ], function(Marionette, AutoIntegrations, DISTLView, dctemplate) {


    return Marionette.ItemView.extend({
        template: dctemplate,
        className: 'dc',

        onShow: function() {
            var w = 0.175*$(window).width()*0.95
            var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
            $('.distl', this.$el).height(h*($(window).width() > 800 ? 0.4 : 1.2))
            this.plotview = new DISTLView({ selection: true, parent: this.model, el: this.$el.find('.distl') })
        },

        onDestroy: function() {
            this.plotview.destroy()
        },
    })
})
