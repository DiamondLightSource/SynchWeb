define(['marionette',
        'utils/xhrimage',
        'templates/imaging/imagehistory.html',
        'templates/imaging/imagehistorymin.html'
    ], function(Marionette, XHRImage, template, templatemin) {
    
        
    var ThumbView = Marionette.ItemView.extend({
        tagName: 'figure',
        template: _.template('<a href="/containers/cid/<%-CONTAINERID%>/iid/<%-CONTAINERINSPECTIONID%>/sid/<%-BLSAMPLEID%>"><img /></a><figcaption>+<%-DELTA%>d</figcaption>'),
        
        events: {
            'mouseover': 'hover',
        },

        hover: function() {
            this.model.set({isSelected: true});
            this.model.collection.trigger('selected:change', this.model)
        },
        
        initialize: function() {
            this.model.on('change:isSelected', this.onSelectedChanged.bind(this))
            
            var self = this
            this.img = new XHRImage()
            this.img.onload = function() {
                self.$el.find('img').attr('src', self.img.src).css('visibility', 'visible').hide().fadeIn()
            }

            if (this.getOption('autoLoad')) {
                this.loadImage()
            }
        },

        loadImage: function() {
            const idx = this.model.collection.indexOf(this.model)
            const last = this.model.collection.length === idx+1
            setTimeout(this.doLoadImage.bind(this), last ? 0 : idx*500)
        },

        doLoadImage: function() {
            this.img.load(this.model.urlFor())
        },

            
        onSelectedChanged: function() {
            this.model.get('isSelected') ? this.$el.addClass('selected') : this.$el.removeClass('selected')
        },
            
        onRender: function() {
            this.$el.width(125)
            this.$el.find('img').css('visibility', 'hidden')
            if (this.model.get('isSelected')) this.$el.addClass('selected')
        },
        
    })
        
        
    var ThumbsView = Marionette.CollectionView.extend({
        childView: ThumbView,

        childViewOptions: function() {
            return {
                autoLoad: this.getOption('autoLoad')
            }
        },

        load: function() {
            this.children.each(function(v) {
                v.loadImage()
            })
        }
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
            // this.listenTo(this.images, 'sync', this.preCache.bind(this,1))
            //this.images.fetch()
            //
            this.autoLoad = options && options.embed
            
        },
        
        onRender: function() {
            this.thumbs = new ThumbsView({ collection: this.images, autoLoad: this.getOption('autoLoad') })
            this.thm.show(this.thumbs)
        },

        load: function() {
            this.thumbs.load()
        },
        
        
        preCache: function(n) {
            clearTimeout(this.cachethread)

            var self = this
            var i = this.images.at(n)
            if (this.caching && i) {
                var xhr =  new XHRImage()
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