define(['marionette'], function(Marionette) {
    
    var GetView = Marionette.Object.extend({
        views: {},
        default: null,

        titles: {},
        default_title: '',

        get: function(type, arguments) {
            var views = this.getOption('views')

            if (type in views) view = views[type]
            else view = this.getOption('default')

            console.log('using view', view, type)

            return new view(arguments)
        },

        title: function(type) {
            var titles = this.getOption('titles')
            if (type in titles) var title = titles[type]
            else var title = this.getOption('default_title')

            return title
        },
    })

    return GetView

})