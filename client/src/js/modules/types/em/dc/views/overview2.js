define(['marionette',
        'heatmap',
        'utils/xhrimage',
    ], function(Marionette, HeatMap, XHRImage) {


    return Marionette.LayoutView.extend({
        tagName: 'a',
        template: _.template('<img></img>'),

        ui: {
            img: 'img'
        },

        initialize: function(options) {
            this.draw = _.debounce(this.draw, 10)
            this.listenTo(options.imagestatuses, 'sync', this.getModel, this)
            this.pm = options.pm

            this.ready = []

            this.current = 1
            this.hasSnapshot = false

            this.img = new XHRImage()
            this.img.onload = this.onImageLoaded.bind(this)
            // this.img.onerror = this.onImageError.bind(this)
            // this.img.onprogress = this.onImageProgress.bind(this)
        },

        onImageLoaded: function() {
            this.ui.img.attr('src', this.img.src).addClass('show')
        },


        getModel: function() {
            var m = this.getOption('imagestatuses').findWhere({ ID: this.pm.get('ID') })
            if (m.get('SNS').length) {
                if (m.get('SNS')[1] && this.hasSnapshot == false) {
                    this.img.load(app.apiurl+'/image/id/'+this.pm.get('ID')+'/f/1/n/2')
                }
            }
        },


    })


})