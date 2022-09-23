define(['marionette'], function(Marionette) {
    
    var GetView = Marionette.Object.extend({
        views: {},
        default: null,

        titles: {},
        default_title: '',

        get: function(type, args) {
            var views = this.getOption('views')

            if (type in views) view = views[type]
            else view = this.getOption('default')

            console.log('using view', view, type)

            return new view(args)
        },

        title: function(type) {
            var titles = this.getOption('titles')
            return type in titles ? titles[type] : this.getOption('default_title')
        },
    })

    return GetView

})