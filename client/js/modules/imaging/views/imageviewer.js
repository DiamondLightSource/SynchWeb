define(['marionette',
    'modules/imaging/collections/inspectionimagescores',
    
    'models/subsample',
    'collections/subsamples',
    
    'modules/imaging/views/imagehistory',
    'modules/imaging/models/inspectionimage',
    
    'utils/editable',
    'utils',
    'utils/xhrimage',
    'tpl!templates/imaging/imageviewer.html',
    'jquery-ui',
    'backbone-validation',
    ], function(Marionette,
        ImageScores, Subsample, Subsamples, ImageHistory, InspectionImage,
        Editable, utils, XHRImage,
        template) {


    var ScoreButton = Marionette.ItemView.extend({
        tagName: 'li',
        modelEvents: {
            'change': 'render',
        },
        
        events: {
            'click': 'setSelected',
        },
        
        setSelected: function(e) {
            console.log('click score')
            this.model.set('isSelected', true)
        },
        
        template: _.template('<%=SCORE%>'),
        onRender: function() {
            this.model.get('isSelected') ? this.$el.addClass('current') : this.$el.removeClass('current')
            console.log('render score', this.model.get('isSelected'))
            this.$el.css('background-color', this.model.get('COLOUR'))
        }
    })
            
            
    var ScoreButtons = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: ScoreButton,
    })
            
    
    return Marionette.LayoutView.extend({
        template: template,
        className: 'image_large',
        
        regions: {
            hist: '.hist',
            scb: '.scorebybutton',
        },
        
        ui: {
            canvas: 'canvas',
        
            score: 'select[name=score]',
            com: '.COMMENTS',
            zoom: '#zoom',
            zval: '#zval',
        
            hist: 'a.history',

            progress: 'span.progress',
            help: '.help_pane',
            hb: 'a.help',
            meas: 'a.measure',
        },
        
        events: {
            'slidechange @ui.zoom': 'onZoomChange',
            'mousedown @ui.canvas': 'mouseDownCanvas',
            'mousemove @ui.canvas': 'mouseMoveCanvas',
            'mouseup @ui.canvas': 'mouseUpCanvas',
            'DOMMouseScroll @ui.canvas': 'mouseWheel',
            'mousewheel @ui.canvas': 'mouseWheelCanvas',
        
            'click @ui.canvas': 'handleClick',
        
            'change @ui.score': 'updateScore',
            'click @ui.hist': 'toggleHistory',
            'click @ui.meas': 'toggleMeasure',

            'click @ui.hb': 'toggleHelp',
        },

        toggleMeasure: function(e) {
            e.preventDefault()

            if (this.ui.meas.hasClass('button-highlight')) this.ui.meas.removeClass('button-highlight')
            else this.ui.meas.addClass('button-highlight')
        },

        toggleHelp: function(e) {
            e.preventDefault()

            if (this.ui.hb.hasClass('button-highlight')) this.ui.hb.removeClass('button-highlight')
            else this.ui.hb.addClass('button-highlight')

            if (this.ui.hb.hasClass('button-highlight')) this.ui.help.addClass('enable')
            else this.ui.help.removeClass('enable')
        },
        
        toggleHistory: function(e) {
            e.preventDefault()
            
            if (this.ui.hist.hasClass('button-highlight')) {
                this.hist.$el.fadeOut()
                this.ui.hist.removeClass('button-highlight')
            } else {
                this.hist.$el.fadeIn()
                this.history.load()
                this.ui.hist.addClass('button-highlight')
            }
        },
        
        modelEvents: {
            // 'change': 'drawLarge',
        },

        
        
        handleClick: function(e) {
            var xy = utils.get_xy(e, this.ui.canvas)
            var x = parseInt(xy[0]/this.scalef-this.offsetx/this.scalef)
            var y = parseInt(xy[1]/this.scalef-this.offsety/this.scalef)
            
            console.log('click', e, xy, x, y)
            
            // Add object
            if (this.add_object) {
                var sub = new Subsample({
                    BLSAMPLEID: this.model.get('BLSAMPLEID'),
                    X: x,
                    Y: y
                })
                
                var self = this
                sub.save(null, {
                    success: function() {
                        self.subsamples.add(sub)
                        self.draw()
                        self.plotObjects()
                    },
                    
                    error: function(model, response, options) {
                        app.alert({ message: 'Something went wrong creating that object, please try again: '+response.responseText })
                    },
                })
            }
        },

        setAddSubsample: function(state) {
            this.add_object = state
        },
        
        
        remSubsample: function(e) {
            this.draw()
            this.plotObjects()
        },

        initialize: function(options) {
            this.add_object = false
            this.plotObjects = _.debounce(this.plotObjects, 200)
            this.drawDebounce = _.debounce(this.draw, 10)
            
            this.scores = new ImageScores()
            this.listenTo(this.scores, 'selected:change', this.setScoreButton, this)
            this.ready = this.scores.fetch()

            this.subsamples = options.subsamples
            this.listenTo(this.subsamples, 'sync', this.plotObjects, this)
            this.listenTo(this.subsamples, 'change:isSelected', this.selectSubSample, this)
            this.listenTo(this.subsamples, 'remove', this.remSubsample, this)
            
            this.inspectionimages = options.inspectionimages

            this.historyimages = options.historyimages
            this.listenTo(this.historyimages, 'selected:change', this.hChanged, this)

            this.history = new ImageHistory({ historyimages: this.historyimages })
            
            this.img = new XHRImage()
            this.img.onload = this.onImageLoaded.bind(this)
            this.img.onerror = this.onImageError.bind(this)
            this.img.onprogress = this.onImageProgress.bind(this)
            
            this.rendered = false
            this.scalef = 1
            this.width = null
            this.height = null
            this.offsetx = 0
            this.offsety = 0
            
            this.record = false
            this.startx = 0
            this.starty = 0
            this.moved = false
            
            this.first = false
            this.start = []

            this.drawingLine = false
            this.hasLine = false
            this.lineStart = {}
            this.lineEnd = {}
        },

        selectSubSample: function(e) {
            this.draw()
            this.plotObjects()
        },

        hChanged: function(m) {
            console.log('h changed', m)
            this.setModel(m)
        },
        

        setEmpty: function () {
            var EmptyImage = InspectionImage.extend({
                urlFor: function() {
                    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                }
            })

            var m = new EmptyImage()
            this.setModel(m)
        },
        
        setModel: function(m) {
            Backbone.Validation.unbind(this)
            this.undelegateEvents()
            this.model = m
            this.low = false
            this.delegateEvents()
            Backbone.Validation.bind(this)
            this.drawLarge()
                
            this.scores.setSelected(m.get('BLSAMPLEIMAGESCOREID'))
        },
        
        updateScores: function() {
            this.ui.score.html(this.scores.opts())
            if (this.model) this.ui.score.val(this.model.get('BLSAMPLEIMAGESCOREID'))
            this.scb.show(new ScoreButtons({ collection: this.scores }))
        },
        
        updateScore: function() {
            var sc = this.scores.findWhere({ BLSAMPLEIMAGESCOREID: this.ui.score.val() })
            this.model.set('BLSAMPLEIMAGESCOREID', this.ui.score.val())
            this.model.set('SCORECOLOUR', sc.get('COLOUR'))
            this.model.save({ BLSAMPLEIMAGESCOREID: this.ui.score.val() }, { patch: true })
            this.trigger('image:scored')
        },

        setScoreButton: function() {
            var s = this.scores.findWhere({ isSelected: true })
            if (s) {
                this.model.set('BLSAMPLEIMAGESCOREID', s.get('BLSAMPLEIMAGESCOREID'))
                this.model.save({ imagescoreid: s.get('BLSAMPLEIMAGESCOREID') }, { patch: true })
                this.trigger('image:scored')
            }
        },
        
        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            this.ctx = this.canvas.getContext('2d')

            this.canvas.width = this.$el.width()
            this.canvas.height = this.canvas.width * (app.mobile() ? 0.75 : 0.85)
            
            this.ui.zoom.slider({ min: 0, max: 200, step: 5 })

            this.rendered = true
        },
        
        onRender: function() {
            this.ready.done(this.updateScores.bind(this))
            this.hist.show(this.history)
            this.hist.$el.hide()
            
            $(document).unbind('keypress.imviewer').bind('keypress.imviewer', this.keyPress.bind(this))
        },
        
        keyPress: function(e) {
            if ($(e.target).is('input') || $(e.target).is('select') || $(e.target).is('textarea')) return

            if (e.which > 47 && e.which < 58) {
                this.ui.score.val(e.which - 48).trigger('change')
                return
            }
            console.log(e.which)
            switch (e.which) {    

                // ? toggle help
                case 63:
                    this.ui.hb.trigger('click')
                    break

                // h - history
                case 104:
                    this.ui.hist.trigger('click')
                    break

                // m - measure
                case 109:
                    this.ui.meas.trigger('click')
                    break

                // s - start / stop
                case 115:
                    this.trigger('space', e)
                    break

                // a - prev
                case 97:
                    if (this.ui.hist.hasClass('button-highlight')) {
                        var cur = this.historyimages.indexOf(this.model)
                        var next = this.historyimages.at(cur-1) || this.historyimages.last()
                        if (next) {
                            this.setModel(next)
                            next.set({ isSelected: true })
                        }
                    } else {
                        this.trigger('image:prev')
                    }
                    break

                // d - next
                case 100:
                    if (this.ui.hist.hasClass('button-highlight')) {
                        var cur = this.historyimages.indexOf(this.model)
                        var next = this.historyimages.at(cur+1) || this.historyimages.first()
                        if (next) {
                            this.setModel(next)
                            next.set({ isSelected: true })
                        }
                    } else {
                        this.trigger('image:next')
                    }
                    break

                // q - first
                case 113:
                    if (this.ui.hist.hasClass('button-highlight')) {
                        var next = this.historyimages.first()
                        if (next) {
                            this.setModel(next)
                            next.set({ isSelected: true })
                        }
                    } else {
                        this.trigger('image:first')
                    }
                    break

                // e  - last
                case 101:
                    if (this.ui.hist.hasClass('button-highlight')) {
                        var next = this.historyimages.last()
                        if (next) {
                            this.setModel(next)
                            next.set({ isSelected: true })
                        }
                    } else {
                        this.trigger('image:last')
                    }
                    break

                // z - zoom out
                case 122:
                    this.ui.zoom.slider('value', this.ui.zoom.slider('value') - 10).trigger('slidechange')
                    this.clampOffsets()
                    this.draw()
                    this.plotObjects()
                    break

                // x - zoom 100
                case 120:
                    this.ui.zoom.slider('value', 100).trigger('slidechange')
                    this.clampOffsets()
                    this.draw()
                    this.plotObjects()
                    break

                // c - zoom in
                case 99:
                    this.ui.zoom.slider('value', this.ui.zoom.slider('value') + 10).trigger('slidechange')
                    this.clampOffsets()
                    this.draw()
                    this.plotObjects()
                    break

                // v - fit
                case 118:
                    this.ui.zoom.slider('value', this.ui.zoom.slider('option', 'min')).trigger('slidechange')
                    this.clampOffsets()
                    this.draw()
                    this.plotObjects()
                    break
                      
            }
        },
        
        onDestroy: function() {
            $(document).unbind('keypress.imviewer')
        },

        drawLarge: function(options) {
            console.log('image model', this.model, this.model.urlFor('full'), 'drop', this.getOption('drop'))
            this.img.load(this.model.urlFor(app.mobile() ? 'full' : 'hd'))
            this.showProgressBar()
        },
        
        onImageError: function(options) {
            if (!this.low) {
                this.img.load(this.model.urlFor('full'))
                this.showProgressBar()
                this.low = true
            }
            
        },

        onImageProgress: function(pc) {
            if (!this.rendered) return
            this.ui.progress.html(pc+'% loaded')
        },

        showProgressBar: function() {
            if (!this.rendered) return
            this.ui.progress.html('0% loaded')
            this.ui.progress.show()
        },

        hideProgressBar: function() {
            if (!this.rendered) return
            this.ui.progress.hide()
        },
        
        onImageLoaded: function(options) {
            this.hideProgressBar()
            this.width = this.img.width
            this.height = this.img.height
            
            this.ui.score.val(this.model.get('BLSAMPLEIMAGESCOREID'))
            this.ui.com.html(this.model.get('COMMENTS'))
            
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('COMMENTS', 'text')
            
            this.calcZoom()

            if (this.width*this.scalef > this.canvas.width) this.offsetx = -(this.width*this.scalef - this.canvas.width) / 2
            if (this.height*this.scalef > this.canvas.height) this.offsety = -(this.height*this.scalef - this.canvas.height) / 2

            this.draw()
            this.plotObjects()
        },
        
        
        draw: function() {
            console.log('draw')
            this.ctx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
            this.ctx.clearRect(0,0,this.width,this.height)
            this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
            this.drawLines()
        },
        

        
        onZoomChange: function(e) {
            this.scalef = this.ui.zoom.slider('value')/100.0
            this.ui.zval.html((this.scalef*100).toFixed(0))
            if (e && e.originalEvent) {
                this.clampOffsets()
                this.draw()
                this.plotObjects()
            }
        },
        
        calcZoom: function() {
            var min = this.ui.canvas.width() < this.ui.canvas.height() ? this.ui.canvas.width()/this.width : this.ui.canvas.height()/this.height
            this.ui.zoom.slider('option', 'min', 100*min)
            this.onZoomChange()
        },
        
        clampOffsets: function() {
            if (this.offsety > 0) this.offsety = 0
            if (this.offsety < this.ui.canvas.height() - this.scalef*this.height) this.offsety = this.ui.canvas.height() - this.scalef*this.height
                          
            if (this.offsetx > 0) this.offsetx = 0
            if (this.offsetx < this.ui.canvas.width() - this.scalef*this.width) this.offsetx = this.ui.canvas.width() - this.scalef*this.width
        },
        
        
        mouseWheelCanvas: function(e) {
            e.preventDefault()

            var o = e.originalEvent
            var delta = o.wheelDelta ? o.wheelDelta : -o.detail
            this.zoom(utils.get_xy(o, this.ui.canvas), delta)
        },
        
        zoom: function(xy, delta) {
            var last_scale = this.scalef

            this.scalef += delta > 0 ? 0.1 : -0.1
            if (this.scalef < (this.ui.canvas.width()/this.width)) this.scalef = this.ui.canvas.width()/this.width
            if (this.scalef < (this.ui.canvas.height()/this.height)) this.scalef = this.ui.canvas.height()/this.height
              
            var curp = -this.offsetx + xy[0]
            var newp = curp*(this.scalef/(last_scale))
            this.offsetx -= newp-curp

            var curp = -this.offsety + xy[1]
            var newp = curp*(this.scalef/(last_scale))
            this.offsety -= newp-curp
                         
            this.clampOffsets()
            if (this.scalef < 2) this.ui.zoom.slider('value', this.scalef*100)
            this.ui.zval.html((this.scalef*100).toFixed(0))
                         
            this.draw()
            this.plotObjects()
        },
        
                
        mouseDownCanvas: function(e) {
            e.preventDefault()
            if(e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0];

            if (this.ui.meas.hasClass('button-highlight')) {
                this.drawingLine = true
                this.lineStart = this.getScaledXY(e)

            } else {
                this.record = true
                this.startx = e.clientX
                this.starty = e.clientY
            }
        },

        getScaledXY: function(e) {
            var xy = utils.get_xy(e, this.ui.canvas)
            var x = parseInt(xy[0]/this.scalef-this.offsetx/this.scalef)
            var y = parseInt(xy[1]/this.scalef-this.offsety/this.scalef)

            console.log(x,y)
            return { x: x, y: y }
        },

                
        mouseMoveCanvas: function(e) {
            e.preventDefault()
            if (e.originalEvent.touches && e.originalEvent.touches.length >  1) return
                if (e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0];
            var c = utils.get_xy(e, this.ui.canvas)
            
            if (this.record) {
                this.moved = true
                this.offsetx += e.clientX - this.startx
                this.offsety += e.clientY - this.starty
                
                this.clampOffsets()
                this.drawDebounce()
                
                this.startx = e.clientX
                this.starty = e.clientY
            }

            if (this.drawingLine) {
                this.moved = true
                this.lineEnd = this.getScaledXY(e)
                this.drawDebounce()
            }

        },
                
        mouseUpCanvas: function(e) {
            e.preventDefault()

            if (!this.moved && this.lineStart.x) {
                this.lineStart = {}
                this.lineEnd = {}
                this.draw()
                this.plotObjects()
            }

            if (this.moved) {
                this.draw()
                this.plotObjects()
                this.moved = false
            }
            this.record = false
            this.drawingLine = false
        },
                

        drawLines: function() {
            if (!this.lineStart || !this.lineEnd) return

            this.ctx.beginPath()
            this.ctx.moveTo(this.lineStart.x, this.lineStart.y)
            this.ctx.lineTo(this.lineEnd.x, this.lineEnd.y)

            this.ctx.stroke()
            this.ctx.closePath()

            var mppx = this.model.get('MICRONSPERPIXELX') || 3
            var mppy = this.model.get('MICRONSPERPIXELY') || 3

            var xmid = (this.lineEnd.x - this.lineStart.x) / 2
            var ymid = (this.lineEnd.y - this.lineStart.y) / 2
            var dist = Math.sqrt(Math.pow((this.lineEnd.x - this.lineStart.x)*mppx, 2)+Math.pow((this.lineEnd.y - this.lineStart.y)*mppy, 2))

            this.ctx.font = '14px Arial';
            this.ctx.fillText(dist.toFixed(0)+'\u03BCm',this.lineStart.x+xmid+5,this.lineStart.y+ymid+5);
        },

        
        plotObjects: function() {
            this.subsamples.each(function(o) {
                var x = parseInt(o.get('X'))
                var y = parseInt(o.get('Y'))
                this.ctx.strokeStyle= o.get('isSelected') ? 'green' : 'red'
                this.ctx.beginPath();
                this.ctx.moveTo(x-15,y)
                this.ctx.lineTo(x+15,y)
                this.ctx.stroke()
                this.ctx.beginPath();
                this.ctx.moveTo(x,y-15)
                this.ctx.lineTo(x,y+15)
                this.ctx.stroke()
            }, this)
        },
        
    })


})