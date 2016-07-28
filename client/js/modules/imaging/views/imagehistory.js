define(['marionette',
        'utils/xhrimage',
        'tpl!templates/imaging/imagehistory.html',
        'tpl!templates/imaging/imagehistorymin.html'
    ], function(Marionette, XHRImage, template, templatemin) {
    
        
    var ThumbView = Marionette.ItemView.extend({
        tagName: 'figure',
        template: _.template('<a href="/containers/cid/<%=CONTAINERID%>/iid/<%=CONTAINERINSPECTIONID%>/sid/<%=BLSAMPLEID%>"><img /></a><figcaption>+<%=DELTA%>d</figcaption>'),
        
        events: {
            'mouseover': 'hover',
        },

        hover: function(e) {
            console.log('hover')
            this.model.set({isSelected: true});
            this.model.collection.trigger('selected:change', this.model)
        },
        
        initialize: function(options) {
            this.model.on('change:isSelected', this.onSelectedChanged.bind(this))
            
            var self = this
            this.img = new XHRImage()
            this.img.onload = function() {
                self.$el.find('img').attr('src', self.img.src)
            }
            this.img.load(this.model.urlFor())

        },
            
        onSelectedChanged: function() {
            this.model.get('isSelected') ? this.$el.addClass('selected') : this.$el.removeClass('selected')
        },
            
        onRender: function() {
            if (this.model.get('isSelected')) this.$el.addClass('selected')
        },
        
    })
        
        
    var ThumbsView = Marionette.CollectionView.extend({
        childView: ThumbView,
    })
        
    
    return Marionette.LayoutView.extend({
        // template: template,
        getTemplate: function() {
            return this.getOption('embed') ? templatemin : template
        },

        className: function() {
            return 'img_history' + (this.getOption('embed') ? ' embed' : '')
        },
        
        regions: {
            thm: '.columns',
        },
        
        // setSampleId: function(id) {
        //     this.blsampleid = id
        //     if (id) this.images.fetch()
        // },


        // getSampleId: function() {
        //     return this.blsampleid
        // },

        
        initialize: function(options) {
            this.caching = true
            this.images = options.historyimages
            this.listenTo(this.images, 'sync', this.preCache.bind(this,1))
            //this.images.fetch()
            
        },
        
        onRender: function() {
            this.thm.show(new ThumbsView({ collection: this.images }))
        },
        
        
        preCache: function(n) {
            clearTimeout(this.cachethread)

            var self = this
            var i = this.images.at(n)
            if (this.caching && i) {
                var xhr =  new XHRImage()
                console.log('caching history', i.urlFor('hd'))
                xhr.load(i.urlFor('full'), function() {
                    self.cachethread = setTimeout(function() {
                        self.preCache(++n)
                    }, 500)
                })
            }
            
        },
        
        onDestroy: function() {
            clearTimeout(this.cachethread)
            this.caching = false
        },
        
    })


})