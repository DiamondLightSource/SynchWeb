define(['marionette',
    'backbone',
    'modules/imaging/collections/inspectionimagescores',
    
    'models/subsample',
    'collections/subsamples',
    
    'modules/imaging/views/imagehistory',
    'modules/imaging/models/inspectionimage',
    
    'collections/attachments',

    'utils/editable',
    'utils',
    'utils/xhrimage',
    'heatmap',
    'templates/imaging/imageviewer.html',
    'backbone-validation',
    ], function(Marionette,
        Backbone,
        ImageScores, Subsample, Subsamples, ImageHistory, InspectionImage, Attachments,
        Editable, utils, XHRImage, HeatMap,
        template) {


    var ScoreButton = Marionette.ItemView.extend({
        tagName: 'li',
        modelEvents: {
            'change': 'render',
        },
        
        events: {
            'click': 'setSelected',
        },
        
        setSelected: function() {
            console.log('click score')
            this.model.set('isSelected', true)
        },
        
        template: _.template('<%-SCORE%>'),
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
        showBeam: false,
        showHeatmap: true,
        rankOption: null,

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
            move: 'a.move',

            pia: 'select[name=pia]',
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
            'click @ui.move': 'toggleMove',

            'click @ui.hb': 'toggleHelp',
            'change @ui.pia': 'changeHeatmap',
        },

        toggleMeasure: function(e) {
            e.preventDefault()

            if (this.ui.meas.hasClass('button-highlight')) this.ui.meas.removeClass('button-highlight')
            else this.ui.meas.addClass('button-highlight')
        },

        toggleMove: function(e) {
            e.preventDefault()

            if (this.ui.move.hasClass('button-highlight')) this.ui.move.removeClass('button-highlight')
            else this.ui.move.addClass('button-highlight')
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
                        sub.set('RID', self.subsamples.length)
                        self.subsamples.add(sub)
                        self.draw()
                        self.plotObjects()
                    },
                    
                    error: function(model, response) {
                        app.alert({ message: 'Something went wrong creating that object, please try again: '+response.responseText })
                    },
                })
            }
        },

        setAddSubsample: function(state) {
            this.add_object = state
        },

        setAddSubsampleRegion: function(state) {
            this.add_region = state
        },
        
        
        remSubsample: function() {
            this.draw()
            this.plotObjects()
        },

        getSample: function() {
            return this.model.get('BLSAMPLEID')
        },

        subSamplesSynced: function() {
            this.attachments.fetch({
                success: this.populateHeatmap.bind(this)
            })
        },

        initialize: function(options) {
            this.add_object = false
            this.add_region = false

            this.plotObjects = _.debounce(this.plotObjects, 200)
            this.drawDebounce = _.debounce(this.draw, 10)
            
            this.scores = new ImageScores()
            this.listenTo(this.scores, 'selected:change', this.setScoreButton, this)
            if (!(this.getOption('scores') !== null && this.getOption('scores') === false)) {
                this.ready = this.scores.fetch()
            }

            this.subsamples = options.subsamples
            this.listenTo(this.subsamples, 'sync', this.subSamplesSynced, this)
            this.listenTo(this.subsamples, 'change:BOXSIZEX', this.replotObjects, this)
            this.listenTo(this.subsamples, 'change:BOXSIZEY', this.replotObjects, this)
            this.listenTo(this.subsamples, 'change:PREFERREDBEAMSIZEX', this.replotObjects, this)
            this.listenTo(this.subsamples, 'change:PREFERREDBEAMSIZEY', this.replotObjects, this)
            this.listenTo(this.subsamples, 'change:isSelected', this.selectSubSample, this)
            this.listenTo(this.subsamples, 'remove', this.remSubsample, this)

            this.historyimages = options.historyimages
            if (this.historyimages) {
                this.listenTo(this.historyimages, 'selected:change', this.hChanged, this)
                this.history = new ImageHistory({ historyimages: this.historyimages })
            }
            
            this.img = new XHRImage()
            this.img.onload = this.onImageLoaded.bind(this)
            this.img.onerror = this.onImageError.bind(this)
            this.img.onprogress = this.onImageProgress.bind(this)
            
            this.attachments = new Attachments(null, { state: { pageSize: 100 }})
            this.attachments.queryParams.filetype = 'pia'
            this.attachments.queryParams.blsampleid = this.getSample.bind(this)

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

            this.drawingRegion = false
            this.isMovingObject = false
            this.movingObject = false
            this.resizeObject = false
        },

        selectSubSample: function() {
            this.draw()
            this.plotObjects()
        },

        hChanged: function(m) {
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

        setRankStatus: function(rank) {
            this.rankOption = rank
            this.draw()
            this.plotObjects()
        },
        
        updateScores: function() {
            if (this.getOption('scores') !== null && this.getOption('scores') === false) return

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

            if (this.getOption('showHeatmap')) {
                this.heatmap = new HeatMap.create({ 
                    container: this.$el[0],
                    maxOpacity: .4,
                })
            }
        },
        
        onRender: function() {
            if (this.ready) this.ready.done(this.updateScores.bind(this))
            if (this.historyimages) {
                this.hist.show(this.history)
                this.hist.$el.hide()
            } else (this.ui.hist.hide())

            if (this.getOption('move') !== null && !this.getOption('move')) this.ui.move.hide()
            if (this.getOption('scores') !== null && this.getOption('scores') === false) this.$el.find('.scoresel').hide()
            
            $(document).unbind('keypress.imviewer').bind('keypress.imviewer', this.keyPress.bind(this))
        },
        
        keyPress: function(e) {
            if ($(e.target).is('input') || $(e.target).is('select') || $(e.target).is('textarea')) return

            if (e.which > 47 && e.which < 58) {
                // The ui.score.val stores the BLSAMPLESCOREID
                // We need to determine the score from the ascii code entered, then save the BLSAMPLESCOREID in the ui
                // The updateScores method (triggered by the change event) will then get the correct score value
                const key = e.which - 48;

                // The model stores string values so need to search by string
                const sc = this.scores.findWhere({SCORE: key.toString()});

                // BLSAMPLEIMAGESCOREID is mapped to 'Clear'
                let id = 1;

                if (sc) {
                    id = sc.get('BLSAMPLEIMAGESCOREID')
                } else {
                    console.log('ImageViewer Error - could not find score model with (String) key of ' + key)
                }

                this.ui.score.val(id).trigger('change')

                return
            }

            let cur, next
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

                // o - move
                case 111:
                    this.ui.move.trigger('click')
                    break

                // s - start / stop
                case 115:
                    this.trigger('space', e)
                    break

                // a - prev
                case 97:
                    if (this.ui.hist.hasClass('button-highlight')) {
                        if (!this.historyimages) return
                        cur = this.historyimages.indexOf(this.model)
                        next = this.historyimages.at(cur-1) || this.historyimages.last()
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
                        if (!this.historyimages) return
                        cur = this.historyimages.indexOf(this.model)
                        next = this.historyimages.at(cur+1) || this.historyimages.first()
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
                        if (!this.historyimages) return
                        next = this.historyimages.first()
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
                        if (!this.historyimages) return
                        next = this.historyimages.last()
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

        drawLarge: function() {
            this.img.load(this.model.urlFor(app.mobile() ? 'full' : 'hd'))
            this.showProgressBar()
        },
        
        onImageError: function() {
            if (!this.low) {
                this.img.load(this.model.urlFor('full'))
                this.showProgressBar()
                this.low = true
            }
            
        },

        onImageProgress: function(pc) {
            if (!this.rendered) return
            this.ui.progress.text(pc+'% loaded')
        },

        showProgressBar: function() {
            if (!this.rendered) return
            this.ui.progress.text('0% loaded')
            this.ui.progress.show()
        },

        hideProgressBar: function() {
            if (!this.rendered) return
            this.ui.progress.hide()
        },
        
        onImageLoaded: function() {
            this.hideProgressBar()
            this.width = this.img.width
            this.height = this.img.height
            
            this.ui.score.val(this.model.get('BLSAMPLEIMAGESCOREID'))
            this.ui.com.text(this.model.get('COMMENTS'))
            
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('COMMENTS', 'text')
            
            this.calcZoom()

            if (this.width*this.scalef > this.canvas.width) this.offsetx = -(this.width*this.scalef - this.canvas.width) / 2
            if (this.height*this.scalef > this.canvas.height) this.offsety = -(this.height*this.scalef - this.canvas.height) / 2

            this.draw()
            this.plotObjects()
        },
        
        
        draw: function() {
            this.ctx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
            this.ctx.clearRect(0,0,this.width,this.height)
            this.ctx.drawImage(this.img, 0, 0, this.width, this.height)

            if (this.isMovingObject) this.drawMovingObject()
            else if (this.drawingRegion) this.drawNewRegion()
            else this.drawLines()
            
            if (this.getOption('showHeatmap')) {
                this.heatmap._renderer.ctx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
                this.heatmap._renderer.shadowCtx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
                this.heatmap._renderer.ctx.clearRect(0,0,this.width/this.scalef, this.height/this.scalef)
                this.heatmap._renderer.shadowCtx.clearRect(0,0,this.width/this.scalef, this.height/this.scalef)  
            }
        },
        
        resetZoom: function() {
            this.setZoom(this.ui.zoom.slider('option', 'min'))
        },

        setZoom: function(value) {
            this.ui.zoom.slider('value', value)
            this.scalef = this.ui.zoom.slider('value')/100.0
            this.clampOffsets()
        },

        
        onZoomChange: function(e) {
            this.scalef = this.ui.zoom.slider('value')/100.0
            this.ui.zval.text((this.scalef*100).toFixed(0))
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
            this.ui.zval.text((this.scalef*100).toFixed(0))
                         
            this.draw()
            this.plotObjects()
        },
        
            
        nearest: function(pos) {
            var distances = this.subsamples.map(function(m) {
                if (m.get('X2') && m.get('Y2')) {
                    if (pos.x > m.get('X') && pos.x < m.get('X2') && pos.y > m.get('Y') && pos.y < m.get('Y2')) return 0
                    else return 9999
                } else return Math.sqrt(Math.pow(pos.x-parseInt(m.get('X')), 2) + Math.pow(pos.y-parseInt(m.get('Y')), 2))
            })
            
            var min = _.min(distances)
            console.log(pos, min, distances)

            if (min < 30/this.scalef) {
                var id = distances.indexOf(min)
                var ss = this.subsamples.at(id)
                console.log(ss)
                return ss
            }
        },

        edge: function(options) {
            if (!options.obj) return

            if (options.obj.get('X2') && options.obj.get('Y2')) {
                var tol = 10/this.scalef
                if (options.pos.x > options.obj.get('X2') - tol && options.pos.x < options.obj.get('X2')) return true
                if (options.pos.y > options.obj.get('Y2') - tol && options.pos.y < options.obj.get('Y2')) return true
            }
        },


        mouseDownCanvas: function(e) {
            e.preventDefault()
            if(e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0];

            if (this.ui.move.hasClass('button-highlight')) {
                this.lineStart = this.getScaledXY(e)
                this.isMovingObject = true

            } else if (this.ui.meas.hasClass('button-highlight')) {
                this.drawingLine = true
                this.lineStart = this.getScaledXY(e)

            } else if (this.add_region) {
                this.drawingRegion = true
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
            
            if (this.record) {
                this.moved = true
                this.offsetx += e.clientX - this.startx
                this.offsety += e.clientY - this.starty
                
                this.clampOffsets()
                this.drawDebounce()
                
                this.startx = e.clientX
                this.starty = e.clientY
            }

            if (this.ui.move.hasClass('button-highlight')) {
                if (this.isMovingObject) {
                    this.lineEnd = this.getScaledXY(e)
                    this.drawDebounce()


                } else {
                    var obj = this.nearest(this.getScaledXY(e))
                    var edge = this.edge({ obj: obj, pos: this.getScaledXY(e) })
                    this.resizeObject = false
                    if (edge) {
                        document.body.style.cursor = 'se-resize'
                        this.resizeObject = true

                    } else if (obj) {
                        obj.set({ isSelected: true })
                        document.body.style.cursor = 'pointer'
                    } else {
                        document.body.style.cursor = 'default'
                        var s = this.subsamples.findWhere({ isSelected: true })
                        if (s) s.set({ isSelected: false })
                    }
                    this.movingObject = obj
                }
            }

            if (this.drawingLine) {
                this.moved = true
                this.lineEnd = this.getScaledXY(e)
                this.drawDebounce()

            } else if (this.drawingRegion) {
                this.moved = true
                this.lineEnd = this.getScaledXY(e)
                this.drawDebounce()
            }

        },
                
        mouseUpCanvas: function(e) {
            e.preventDefault()

            if (this.isMovingObject) {
                this.isMovingObject = false

                if (this.lineEnd && this.movingObject) {
                    this._calcNewPos({ obj: this.movingObject, x2: this.resizeObject })
                    this.movingObject.save(this.movingObject.changedAttributes(), { 
                        patch: true,
                        success: function() {

                        },

                        error: function(model, response) {
                            app.alert({ message: 'Something went wrong moving that object, please try again: '+response.responseText })
                        },
                    })
                }
            }

            if (this.drawingRegion) {
                // swap coords if needed
                let x1, x2, y1, y2
                if (this.lineStart.x > this.lineEnd.x) {
                    x1 = this.lineEnd.x
                    x2 = this.lineStart.x
                } else {
                    x1 = this.lineStart.x
                    x2 = this.lineEnd.x
                }

                if (this.lineStart.y > this.lineEnd.y) {
                    y1 = this.lineEnd.y
                    y2 = this.lineStart.y
                } else {
                    y1 = this.lineStart.y
                    y2 = this.lineEnd.y
                }

                this.lineStart = {}
                this.lineEnd = {}

                var length = Math.sqrt(Math.pow(Math.abs(x2-x1),2)+Math.pow(Math.abs(y2-y1),2))
                console.log('region lenght', length, x2 !== undefined, x1 !== undefined, y2 !== undefined, y1 !== undefined)
                if (length && x2 !== undefined && x1 !== undefined && y2 !== undefined && y1 !== undefined) {
                    var sub = new Subsample({
                        BLSAMPLEID: this.model.get('BLSAMPLEID'),
                        X: x1,
                        Y: y1,
                        X2: x2,
                        Y2: y2
                    })

                    var self = this
                    sub.save(null, {
                        success: function() {
                            sub.set('RID', self.subsamples.length)
                            self.subsamples.add(sub)
                        
                            self.draw()
                            self.plotObjects()
                        },
                        
                        error: function(model, response) {
                            app.alert({ message: 'Something went wrong creating that object, please try again: '+response.responseText })
                        },
                    })
                }
            }

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
            this.drawingRegion = false
        },
                

        drawLines: function() {
            if (!this.lineStart || !this.lineEnd) return

            var m = this.scalef > 1 ? 1 : 1/this.scalef

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

            this.ctx.font = parseInt(14*m)+'px Arial';
            this.ctx.fillText(dist.toFixed(0)+'\u03BCm',this.lineStart.x+xmid+5,this.lineStart.y+ymid+5);
        },


        drawNewRegion: function() {
            this.ctx.beginPath()
            this.ctx.save();
            this.ctx.setLineDash([5, 15]);
            this.ctx.rect(this.lineStart.x, this.lineStart.y, Math.abs(this.lineEnd.x-this.lineStart.x), Math.abs(this.lineEnd.y-this.lineStart.y))

            this.ctx.stroke()
            this.ctx.restore()
            this.ctx.closePath()
        },


        _calcNewPos: function(options) {
            var obj = options.obj
            var delx = this.lineEnd.x - this.lineStart.x
            var dely = this.lineEnd.y - this.lineStart.y

            var np = {}
            if (!options.x2) {
                np.X = parseInt(obj.get('X'))+delx
                np.Y = parseInt(obj.get('Y'))+dely
            }

            if (obj.get('X2') && obj.get('Y2')) {
                np.X2 = parseInt(obj.get('X2'))+delx
                np.Y2 = parseInt(obj.get('Y2'))+dely
            }

            obj.set(np)
        },


        drawMovingObject: function() {
            if (!this.movingObject) return
            this._drawObject({ o: this.movingObject })

            var no = this.movingObject.clone()
            this._calcNewPos({obj: no, x2: this.resizeObject })
            this._drawObject({ o: no, dashed: true })
        },

        
        _drawObject: function(options) {
            if (!options.o) return

            const m = this.scalef > 1 ? 1 : 1/this.scalef
            const w = 15 * m
            this.ctx.lineWidth = this.scalef > 1 ? 1 : 1/this.scalef


            if (options.dashed) {
                this.ctx.save();
                this.ctx.setLineDash([5, 15]);
            }

            var x = parseInt(options.o.get('X'))
            var y = parseInt(options.o.get('Y'))
            this.ctx.strokeStyle = options.o.get('isSelected') ? 'turquoise' : options.o.get('SOURCE') === 'auto' ? 'darkblue' : 'red'

            var colors = {
                GR: '#fdfd96',
                SC: '#fdfd96',
                AI: '#ffb347',
                DC: '#87ceeb',
                AP: '#77dd77',
            }
            
            var hasStatus = false
            _.each(colors, function(v,t) {
                if (options.o.get(t) > 0) {
                    c = v
                    hasStatus = true
                }
            }, this)
            if (hasStatus) this.ctx.strokeStyle = c

            if (options.o.get('X2') && options.o.get('Y2')) {
                var x2 = parseInt(options.o.get('X2'))
                var y2 = parseInt(options.o.get('Y2'))

                if (this.getOption('showBeam')) this.drawGrid(options.o)

                this.ctx.beginPath()
                this.ctx.rect(x, y, x2-x, y2-y)
                this.ctx.stroke()
                this.ctx.closePath()

            } else {
                if (this.getOption('showBeam')) this.drawBeam(options.o)

                if (this.rankOption) {
                    var val = (options.o.get(this.rankOption.value)-this.rankOption.paramdist[0])/(this.rankOption.paramdist[1]-this.rankOption.paramdist[0])
          
                    if (this.rankOption.min) {
                        if (this.rankOption.paramdist[0] > this.rankOption.min) this.rankOption.paramdist[0] = this.rankOption.min
                    }
          
                    if (!this.rankOption.inverted) {
                        val = 1 - val
                    }
                
                    this.ctx.strokeStyle = options.o.get(this.rankOption.value)
                        ? utils.rainbow(val/4) 
                        : (options.o.get(this.rankOption.check) > 0 ? 'yellow' : '#dfdfdf')
                }

                this.ctx.beginPath()
                this.ctx.moveTo(x-w,y)
                this.ctx.lineTo(x+w,y)
                this.ctx.stroke()
                this.ctx.beginPath()
                this.ctx.moveTo(x,y-w)
                this.ctx.lineTo(x,y+w)
                this.ctx.stroke()
            }

            if (options.dashed) this.ctx.restore()

            this.ctx.fillStyle = options.o.get('isSelected') ? 'turquoise' : options.o.get('SOURCE') === 'auto' ? 'darkblue' : 'red'
            this.ctx.font = parseInt(14*m)+'px Arial'
            this.ctx.fillText(parseInt(options.o.get('RID'))+1,x-(m*15), y-(m*6))
        },

        drawBeam: function(o) {
            if (!o.get('PREFERREDBEAMSIZEX') || !o.get('PREFERREDBEAMSIZEY')) return

            var mppx = this.model.get('MICRONSPERPIXELX') || 3
            var mppy = this.model.get('MICRONSPERPIXELY') || 3

            this.ctx.save()
            this.ctx.setLineDash([3/this.scalef,3/this.scalef])
            this.ctx.strokeStyle = 'red'
            this.ctx.lineWidth = 1
            this.ctx.beginPath()
            this.ctx.ellipse(parseInt(o.get('X')), parseInt(o.get('Y')), (parseInt(o.get('PREFERREDBEAMSIZEX'))/mppx)/2, (parseInt(o.get('PREFERREDBEAMSIZEY'))/mppy)/2, 0, 0, Math.PI*2)
            this.ctx.closePath()
            this.ctx.stroke()
            this.ctx.restore()
        },

        drawGrid: function(o) {
            let i;
            if (!o.get('BOXSIZEX') || !o.get('BOXSIZEY')) return
            if (o.get('BOXSIZEX') === 0 || o.get('BOXSIZEY') === 0) return

            const mppx = this.model.get('MICRONSPERPIXELX') || 3;
            const mppy = this.model.get('MICRONSPERPIXELY') || 3;

            const px = parseInt(o.get('BOXSIZEX')) / mppx;
            const py = parseInt(o.get('BOXSIZEY')) / mppy;

            this.ctx.save()
            this.ctx.setLineDash([5/this.scalef,5/this.scalef])
            this.ctx.strokeStyle = 'red'
            this.ctx.lineWidth = 1

            const x = parseInt(o.get('X'));
            const y = parseInt(o.get('Y'));
            const x2 = parseInt(o.get('X2'));
            const y2 = parseInt(o.get('Y2'));

            for (i = x+px; i < x2; i += px) {
                this.ctx.moveTo(i,o.get('Y'))
                this.ctx.lineTo(i,o.get('Y2'))
                this.ctx.stroke()
            }

            for (i = y+py; i < y2; i += py) {
                this.ctx.moveTo(o.get('X'),i)
                this.ctx.lineTo(o.get('X2'),i)
                this.ctx.stroke()
            }

            this.ctx.restore()
        },


        replotObjects: function() {
            this.draw()
            this.plotObjects()
        },

        plotObjects: function() {
            if (this.rankOption) {
                const values = this.subsamples.map(function(m) {
                    if (m.get(this.rankOption.value)) return m.get(this.rankOption.value) 
                }, this)
                this.rankOption.paramdist = [_.min(values), _.max(values)]
            }
            this.subsamples.each(function(o) {
                if (Number(this.model.get('BLSAMPLEIMAGEID')) === Number(o.get('BLSAMPLEIMAGEID')) || o.get('SOURCE') === 'manual') {
                    this._drawObject({ o })
                }
            }, this)

            if (this.getOption('showHeatmap')) {
                this.heatmap.repaint()
            }
        },


        changeHeatmap: function() {
            this.generateHeatmap({
                callback: this.replotObjects.bind(this)
            })
        },


        populateHeatmap: function() {
            if (this.attachments.length) this.ui.pia.show()
            else this.ui.pia.hide()

            const types = _.unique(this.attachments.pluck('FILENAME'));
            const sel = [];
            _.each(types, function(ty) {
                sel.push('<option value="'+ty+'">'+ty.replace('.json', '')+'</option>')
            })
            sel.push('<option value="">None</option>')
            this.ui.pia.html(sel.join(''))
            this.changeHeatmap()
        },


        generateHeatmap: function(options) {
            if (!this.getOption('showHeatmap')) return

            this.heatmap.setData({ data: [] })
            var ready = []
            var self = this
            var rois = this.subsamples.filter(function(m) { return m.get('X2') })
            var actual = []
            _.each(rois, function(ss) {
                var att = this.attachments.findWhere({ BLSUBSAMPLEID: ss.get('BLSUBSAMPLEID'), FILENAME: this.ui.pia.val() })
                if (att) {
                    ready.push(Backbone.ajax({
                        url: app.apiurl+'/download/attachment/id/'+att.get('DATACOLLECTIONID')+'/aid/'+att.get('DATACOLLECTIONFILEATTACHMENTID'),
                        dataType: 'json',
                    }))
                    actual.push(ss)
                }
            }, this)

            $.when.apply($, ready).done(function() {
                // this is fucking stupid, different response based on length of args
                var args = actual.length === 1 ? [arguments] : arguments

                var data = [{ x: 10, y: 10, value: 1, radius: 1 }]
                _.each(actual, function(ss, sid) {
                    var att = self.attachments.findWhere({ BLSUBSAMPLEID: ss.get('BLSUBSAMPLEID') })
                    if (att) {
                        data = data.concat(self.parseAttachment(ss, att, args[sid][0]))
                    }
                }, self)

                var max = 0
                _.each(data, function(d) {
                    max = Math.max(d.value, max)
                }, this)
                self.heatmap.setData({ data: data, max: max })
                if (options && options.callback) {
                    options.callback()
                }
            })
        },
        

        parseAttachment: function(ss, att, resp) {
            // console.log('parse', att, resp)
            var sw = att.get('DX_MM')*1000/parseFloat(this.model.get('MICRONSPERPIXELX'))
            var sh = att.get('DY_MM')*1000/parseFloat(this.model.get('MICRONSPERPIXELY'))

            var data = []
            _.each(resp, function(v,k) {
                // Account for vertical grid scans
                let xstep, ystep, x, y
                if (att.get('ORIENTATION') === 'vertical') {
                    xstep = Math.floor(k / att.get('STEPS_Y'))
                    ystep = k % att.get('STEPS_Y')

                    if (att.get('SNAKED') === 1) {
                         if (xstep % 2 === 1) ystep = (att.get('STEPS_Y')-1) - ystep
                    }

                    x = xstep * sw + sw/2 + parseInt(ss.get('X'))
                    y = ystep * sh + sh/2 + parseInt(ss.get('Y'))

                } else {
                    xstep = k % att.get('STEPS_X')
                    ystep = Math.floor(k / att.get('STEPS_X'))

                    if (att.get('SNAKED') === 1) {
                         if (ystep % 2 === 1) xstep = (att.get('STEPS_X')-1) - xstep
                    }

                    x = xstep * sw + sw/2 + parseInt(ss.get('X'))
                    y = ystep * sh + sh/2 + parseInt(ss.get('Y'))
                }

                data.push({ x: parseInt(x), y: parseInt(y), value: v < 1 ? 0 : v, 
                    radius: sw < sh ? (sh * 1.8) : (sw * 1.8)
                })
            }, this)

            return data
        },
    })


})