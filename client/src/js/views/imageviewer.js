define(['marionette',
    'utils',
    'utils/xhrimage',
    'backbone-validation',
    ], function(Marionette, utils, XHRImage) {
            
    
    var ImageViewer = Marionette.LayoutView.extend({
        className: 'image_large',

        _baseUI: function() {
            return {
                canvas: 'canvas',
                zoom: '.zoom',
                zval: '.zval',
                progress: 'span.progress',
            }
        },
        
        _baseEvents: function() {
            return {
                'slidechange @ui.zoom': 'onZoomChange',
                'mousedown @ui.canvas': 'mouseDownCanvas',
                'mousemove @ui.canvas': 'mouseMoveCanvas',
                'mouseup @ui.canvas': 'mouseUpCanvas',
                'DOMMouseScroll @ui.canvas': 'mouseWheelCanvas',
                'mousewheel @ui.canvas': 'mouseWheelCanvas',
                'touchstart @ui.canvas': 'mouseDownCanvas',
                'touchmove @ui.canvas': 'touchMoveCanvas',
                'touchend @ui.canvas': 'touchEndCanvas',
            }
        },

        delegateEvents: function(events) {
            this.ui = _.extend(this._baseUI(), _.result(this, 'ui'));
            this.events = _.extend(this._baseEvents(), _.result(this, 'events'));
            return ImageViewer.__super__.delegateEvents.call(this, events);
        },


        constructor: function(options) {
            ImageViewer.__super__.constructor.call(this, options)
            this.drawDebounce = _.debounce(this.draw, 10)

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
            this.lastv = null
        },
        
        
        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            this.ctx = this.canvas.getContext('2d')

            this.canvas.width = this.$el.width()
            this.canvas.height = this.$el.parent().height()//this.canvas.width * (app.mobile() ? 0.75 : 0.85)
            
            this.ui.zoom.slider({ min: 0, max: 200, step: 5 })

            this.rendered = true
        },


        onImageError: function(options) {
            
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
        
        onImageLoaded: function(options) {
            this.hideProgressBar()
            this.width = this.img.width
            this.height = this.img.height
            
            this.calcZoom()

            if (this.width*this.scalef > this.canvas.width) this.offsetx = -(this.width*this.scalef - this.canvas.width) / 2
            if (this.height*this.scalef > this.canvas.height) this.offsety = -(this.height*this.scalef - this.canvas.height) / 2

            this.draw()
        },
        
        
        draw: function() {
            console.log('draw')
            this.ctx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
            this.ctx.clearRect(0,0,this.width,this.height)
            this.ctx.drawImage(this.img, 0, 0, this.width, this.height)
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
            }
        },
        
        calcZoom: function() {
            var min = this.ui.canvas.width() > this.ui.canvas.height() ? this.ui.canvas.width()/this.width : this.ui.canvas.height()/this.height
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
        },
        
            

        mouseDownCanvas: function(e) {
            e.preventDefault()
            if(e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0];

            this.record = true
            this.startx = e.clientX
            this.starty = e.clientY
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
            if (e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0]
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
        },
                
        mouseUpCanvas: function(e) {
            e.preventDefault()

            if (this.moved) {
                this.draw()
                this.moved = false
            }

            this.record = false
        },
                
        touchMoveCanvas: function(e) {
            this.mouseMoveCanvas(e)
            if (e.originalEvent.touches && e.originalEvent.touches.length == 2) {
                x = e.originalEvent.touches[0]
                y = e.originalEvent.touches[1]
                v = Math.sqrt(Math.pow(x.pageX-y.pageX,2)+Math.pow(x.pageY-y.pageY,2))
                        
                xy = []
                xy.push((x.pageX < y.pageX ? x.pageX : y.pageX) + (Math.abs(x.pageX-y.pageX)/2))
                xy.push((x.pageY < y.pageY ? x.pageY : y.pageY) + (Math.abs(x.pageY-y.pageY)/2))
                         
                if (v && this.lastv) this.zoom(xy, v > this.lastv ? 1 : -1)
                this.lastv = v
            }
        },

        touchEndCanvas: function(e) {
            this.mouseUpCanvas(e)
            this.lastv = 0
        },
        
    })

    return ImageViewer

})