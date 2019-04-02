define(['jquery', 'marionette',
    
        'utils/canvas',
        'tpl!templates/dc/imageviewer.html',
        'tpl!templates/dc/imageviewer_embedded.html',
        'caman',
        'utils',
        'utils/xhrimage',
        'jquery-ui',
    ], function($, Marionette, canvas, template, embed, Caman, utils, XHRImage) {
    
    return Marionette.ItemView.extend(_.extend({}, canvas, {
        className: function() {
            return 'content' + (this.getOption('embed') ? ' embed' : '')
        },

        getTemplate: function() {
            return this.getOption('embed') ? embed : template
        },
        
        templateHelpers: function() {
            return {
                VIS_LINK: app.prop+'-'+this.model.get('VN')
            }
        },
        
        resizeThread: null,
            
        ui: {
            canvas: '.img',
            holder: '.image_container .image',
        
            zoom: '.zoom',
            brightness: '.brightness',
            bval: '.bval',
            contrast: '.contrast',
            cval: '.cval',
            progress: '.im_progress',
            invert: 'input[name=invert]',
            threshold: 'input[name=threshold]',
            num: 'input[name=num]',
        
            res: 'input[name=res]',
            ice: 'input[name=ice]',

            resc: '.res',
            imz: '.im_zoomc',
            zval: '.zval',
            high: '.im_highlight',

            xp: '.xprofile',
            yp: '.yprofile',

            loadprog: 'span.progress',
        },
            
        events: {
            'click button[name=reset]': 'resetImage',
            'resize document': 'onResize',
        
            'click @ui.imz': 'imZoomClick',
        
            'touchstart @ui.canvas': 'mouseDown',
            //'touchmove @ui.canvas': 'mouseMove',
            //'touchend @ui.canvas': 'mouseUp',
            'mousedown @ui.canvas': 'mouseDown',
            'mousemove @ui.canvas': 'mouseMove',
            'mouseup @ui.canvas': 'mouseUp',
        
            'mousewheel @ui.canvas': 'mouseWheel',
            'DOMMouseScroll @ui.canvas': 'mouseWheel',
            'touchmove @ui.canvas': 'touchMove',
            'touchend @ui.canvas': 'touchEnd',
        
            'slidechange @ui.brightness': 'slideChangeBrightness',
            'slidechange @ui.contrast': 'slideChangeContrast',
            'slidechange @ui.zoom': 'slideChangeZoom',
            'keypress @ui.num': 'keyPressNum',
        
            'click @ui.res': '_dra',
            'click @ui.ice': '_dra',
            'click @ui.invert': 'doInvert',
            'click @ui.threshold': 'doThreshold',
        
            'click button[name=next]': 'next',
            'click button[name=prev]': 'prev',
        },
            
            
            
        initialize: function(options) {
            this.onResize = _.debounce(this.onResize, 200)
            this.draw = _.debounce(this.draw, 10)
            this.readjust = _.debounce(this.readjust, 200)
            
            // console.log(this.model)

            this.n = options.n || 1
            this.img = new XHRImage()
            this.img.onload = this._onload.bind(this)
            this.img.onprogress = this.onImageProgress.bind(this)

            this.cache = new Image()
            this.width = 0
            this.height = 0
            
            this.offsetx = 0
            this.offsety = 0
            
            this.brightness = 0
            this.contrast = 0
            
            this.scalef = 1
            
            this.record = 0
            this.startx = 0
            this.starty = 0
            
            this.lastx = 0
            this.lasty = 0
            this.lastv = 0
            
            this.imscale = 1
            
            this.moved = false
            this.blocks = 0
            this.invert_change = false

            this.ps = this.model.get('DETECTORPIXELSIZEHORIZONTAL') || 0.172
            this.diwidth = this.model.get('DETECTORNUMBEROFPIXELSX') || 2527
        },
            
        
        
        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            // console.log(this.canvas, this.ui.canvas)
            this.ctx = this.canvas.getContext('2d')
        
            // Setup Controls
            this.ui.zoom.slider({min: 0, max: 200, step: 5})
            this.ui.brightness.slider({min: -100, max: 100, step: 5})
            this.ui.contrast.slider({min: -100, max: 100, step: 5})
            this.ui.progress.progressbar({ value: 0 });
            
            this.c = Caman(this.canvas)
            
            // Bind CamanJS Status
            var self = this
            Caman.Event.listen(this.c, 'blockFinished', function (info) {
                self.blocks++
                var tot = self.ui.invert.is(':checked') ? 12 : 8
                self.ui.progress.progressbar('value', 100*(self.blocks/tot))
            })

            Caman.Event.listen(this.c, 'renderStart', function (info) {
                self.blocks = 0
                self.ui.progress.progressbar('value', 0)
                self.ui.progress.fadeIn(100)
            })
            
            if (!this.getOption('embed')) this.load(1)
            else if (this.getOption('readyText')) {
                this.ui.loadprog.text(this.getOption('readyText'))
                this.ui.loadprog.show()
            }
            this.onResize()

            $(document).unbind('keypress.diviewer').bind('keypress.diviewer', this.keyPress.bind(this))
        },


        keyPress: function(e) {
            //console.log(e)
            switch (e.which) {
              // ,
              case 44:
                this.prev()
                break
                  
              // .
              case 46:
                this.next()
                break
                     
              // i
              case 105:
                this.ui.invert.prop('checked', !this.ui.invert.is(':checked'))
                this.doInvert()
                break
                    
              // w
              case 119:
                this.ui.ice.prop('checked', !this.ui.ice.is(':checked'))
                this._dra()
                break
                  
              // r
              case 114:
                this.ui.res.prop('checked', !this.ui.res.is(':checked'))
                this._dra()
                break
                               
              // z / Z
              case 122:
                this.ui.zoom.slider('value', this.ui.zoom.slider('value')+5)
                this._clamp_offset()
                this._dra()
                break

              case 90:
                this.ui.zoom.slider('value', this.ui.zoom.slider('value')-5)
                this._clamp_offset()
                this._dra()
                break
                               
              // c / C
              case 99:
                this.ui.contrast.slider('value', this.ui.contrast.slider('value')+5)
                break
                               
              case 67:
                this.ui.contrast.slider('value', this.ui.contrast.slider('value')-5)
                break
            
              // b / B
              case 98:
                this.ui.brightness.slider('value', this.ui.brightness.slider('value')+5)
                break
                               
              case 66:
                this.ui.brightness.slider('value', this.ui.brightness.slider('value')-5)
                break
                               
              default: return;
            }
        },


        onDestroy: function() {
            clearTimeout(this.cache_thread)
            $(document).unbind('keypress.diviewer')
        },

        
            
        resetImage: function(e) {
            e.preventDefault()
            
            this.ui.brightness.slider('value', 0)
            this.ui.contrast.slider('value', 0)
            this.ui.zoom.slider('value', 0)
            this.ui.invert.prop('checked', false)
            
            var self = this
            setTimeout(function() {
                self._clamp_offset()
                self.draw()
                self._recache()
                self.adjust()
            },300)
        },
            
            
        onResize: function() {
            var h = this.getOption('embed') ? this.$el.parent().height() -5 : (this.getOption('dialog') ? $(window).height()*0.45 : $(window).height()*0.65)
            this.ui.holder.height(h)
            
            this.canvas.width = this.ui.holder.width()
            this.canvas.height = this.ui.holder.height()-3
            
            var left = this.ui.holder.offset().left + (this.ui.canvas.width()/2) - 125
            var top = this.ui.canvas.offset().top + (this.ui.canvas.height()/2) - 10
            this.ui.progress.offset({ left: 0, top: 0 }).show()
            this.ui.progress.offset({ left: left, top: top }).hide()
            
            this._calc_zoom()
            this.draw()
            this._recache()
        },
        
        
        // Load image from remote source
        load: function(n) {
            this.n = n
            this.showProgressBar()
            this.img.onerror = this._onerror.bind(this,n)
            this.img.load(app.apiurl+'/image/'+(this.low ? 'diff' : 'di')+'/id/'+this.model.get('ID')+(this.low ? '/f/1' : '')+(this.ui.threshold.is(':checked') ? '/thresh/1' : '')+('/n/'+n))
        },

        onImageProgress: function(pc) {
            this.ui.loadprog.text(pc+'% loaded')
        },

        showProgressBar: function() {
            this.ui.loadprog.text('0% loaded')
            this.ui.loadprog.show()
        },

        hideProgressBar: function() {
            this.ui.loadprog.hide()
        },
        
        _onload: function() {
            if (this.img.width == 0) return
        
            this.width = this.img.width
            this.height = this.img.height
            this.imscale = this.width/this.diwidth
            // (this.model.get('BL') == 'i04-1' ? 1679 : 2527);
            this._calc_zoom()

            if (this.width*this.scalef > this.canvas.width) this.offsetx = -(this.width*this.scalef - this.canvas.width) / 2
            if (this.height*this.scalef > this.canvas.height) this.offsety = -(this.height*this.scalef - this.canvas.height) / 2

            this.draw()
            this._recache()
            this.ui.canvas.fadeIn(100);
            this._plot_profiles(20,10)
  
            this.hideProgressBar()

            // Set cache point
            this.ci = this.n+1
            this.cistart = this.ci
            this.precache()
        },
                  
        _onerror: function(n,e) {
            if (!this.getOption('embed')) {
                this.$el.find('.message_box').html('<p class="message alert">These images dont look to be on disk any more. Using low resolution jpegs instead</p>')
                if (!this.low) {
                    this.low = 1;
                    this.img.src = ''
      
                    var self = this
                    setTimeout(function() {
                        self.load(n)
                    }, 500)
      
                } else {
                    this.ui.loadprog.text('This image is not available.')
                    var r = this.detectVerticalSquash(this.img)
                    this.ctx.clearRect(0, 0, this.width, this.height/r)
                }
            } else {
                this.ui.loadprog.text('These images dont look to be on disk any more.')
            }
        },
        
        
        // Change image
        change: function(n) {
            var self = this
            this.ui.canvas.fadeOut(100,function() {
              self.load(n)
            })
        },
        
        
        // Next / prev image functions
        prev: function() {
            val = parseInt(this.ui.num.val())
            if (val > 1) {
              if (val > parseInt(this.model.get('NUMIMG'))) val = ni
              val--
              this.change(val)
              this.ui.num.val(val)
            }
        },
          
        next: function() {
            val = parseInt(this.ui.num.val())
            if (val < parseInt(this.model.get('NUMIMG'))) {
              val++
              this.change(val)
              this.ui.num.val(val)
            }
        },
        
        
        // Start precaching images
        precache: function() {
            clearTimeout(this.cache_thread)
            return
            
            var self = this
            if (!app.mobile() && ((this.ci - this.cistart) < 10)) {
                var url = app.apiurl+'/image/'+(this.low ? 'diff' : 'di')+'/id/'+this.model.get('ID')+(this.low ? '/f/1' : '')+'/n/'+self.ci
                var img = new XHRImage()
                img.onload = function() {
                    self.ui.loadprog.text('Cached Image '+self.ci)
                    self.ui.loadprog.show()
                    if (self.ci < self.model.get('NUMIMG')) {
                        self.ci++
                        self.cache_thread = setTimeout(self.precache.bind(self), 500)
                    }
                }
                img.load(url)
            }
        },
        
        
        // Draw image at correct scale / position
        draw: function(adjust) {
            this.ctx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
            var r = this.detectVerticalSquash(this.img)
            this.ctx.drawImage(this.img, 0, 0, this.width, this.height/r)
          
            if (this.ui.res.is(':checked')) this._draw_res_rings()
            if (this.ui.ice.is(':checked')) this._draw_ice_rings()
        },
               
                
        // iOS Bug with large images, detect squished image and rescale it
        detectVerticalSquash: function(img) {
            var ih = this.img.naturalHeight
            if (ih == 0) return 1
            var canvas = document.createElement('canvas')
            canvas.width = 1
            canvas.height = ih
            var ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            var data = ctx.getImageData(0, 0, 1, ih).data
            // search image edge pixel position in case it is squashed vertically.
            var sy = 0
            var ey = ih
            var py = ih
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3]
                if (alpha === 0) {
                    ey = py
                } else {
                    sy = py
                }
                py = (ey + sy) >> 1
            }
            var ratio = (py / ih)
            return (ratio===0)?1:ratio
        },
        
        
        // Apply image adjustments
        adjust: function() {
            if (this.brightness == 0 && this.contrast == 0 && !(this.invert_change || this.ui.invert.is(':checked'))) return
          
            this.c.revert()
            if (this.ui.invert.is(':checked')) {
              this.c.invert()
              //_plot_profiles(lastx, lasty)
            }
            this.invert_change = false

            var self = this
            this.c.brightness(this.brightness).contrast(this.contrast).render(function() {
                self.ui.progress.fadeOut(100)
            })
        },
        
        
        // Calculate zoom factor for current window size
        _calc_zoom: function() {
            this.ui.zoom.slider('option', 'min', 100*this.ui.canvas.width()/this.width)
            this.scalef = this.ui.zoom.slider('value')/100
            this.ui.zval.text((this.scalef*100).toFixed(0))
        },

                
        // Recache canvas to caman
        _recache: function() {
            this.c.reloadCanvasData()
            this.c.resetOriginalPixelData()
        },
    
                
                
        // Draw ice rings
        _draw_ice_rings: function() {
            rings = [3.897, 3.669,3.441,2.671,2.249,2.07,1.95,1.92,1.88,1.72]
          
            this.ctx.strokeStyle='blue';
            for (var i = 0; i < rings.length; i++) {
              this.ctx.beginPath();
              rad = this._res_to_dist(rings[i])/this.ps*this.imscale
              this.ctx.arc(this.model.get('YBEAM')/this.ps*this.imscale,this.model.get('XBEAM')/this.ps*this.imscale,rad,0,2*Math.PI);
              this.ctx.stroke();
            }
        },
          
        // Draw resolution rings
        _draw_res_rings: function() {
            this.ctx.strokeStyle = 'black';
            this.ctx.font = this.imscale < 1 ? '10px Arial' : '30px Arial';
          
            for (var i = 0; i < 5; i++) {
              rad = (((this.height-10)/2)/5)*(i+1)
              this.ctx.beginPath();
              this.ctx.arc(this.model.get('YBEAM')/this.ps*this.imscale,this.model.get('XBEAM')/this.ps*this.imscale,rad,0,2*Math.PI);
              this.ctx.stroke();
              this.ctx.fillText(this._dist_to_res(rad*this.ps/this.imscale).toFixed(2) + 'A',this.model.get('YBEAM')/this.ps*this.imscale-(this.low ? 10 : 40 ),this.model.get('XBEAM')/this.ps*this.imscale-rad+(this.low ? 10 : 40));
            }
        },
        
                
        // Plot spot profile
        _plot_profiles: function(xp, yp) {
            if (xp < 20) xp = 20
            if (yp < 10) yp = 10
          
            this.lastx = xp
            this.lasty = yp
          
            var w = $(window).width() <= 600 || this.getOption('embed') ? 20 : 40
            var h = 20
          
            this.ui.high.offset({ left: this.ui.canvas.offset().left+xp-(w/2), top: this.ui.canvas.offset().top+yp-(h/2) })
          
            var xdat = this.ctx.getImageData(xp-w/2, yp, w, 1).data
            var ydat = this.ctx.getImageData(xp, yp-h/2, 1, h).data
          
            var x = []
            for (var i = 0; i < w; i++) {
                var val = (xdat[i*4] + xdat[i*4+1] + xdat[i*4+2])
                if (!this.ui.invert.is(':checked')) val = 765-val
                x.push([i,val])
            }

            var y = []
            for (var i = 0; i < h; i++) {
                var val = (ydat[i*4] + ydat[i*4+1] + ydat[i*4+2])
                if (!this.ui.invert.is(':checked')) val = 765-val
                y.push([val,h-1-i])
            }
          
            var options = {
                yaxis: {
                    ticks: []
                },
                xaxis: {
                    ticks: []
                },
                grid: {
                    borderWidth: 0,
                },
            }
          
            $.plot(this.ui.xp, [x], options)
            $.plot(this.ui.yp, [y], options)
          
            var zc = this.ui.imz[0].getContext('2d')
            zc.drawImage(this.ctx.canvas,xp-(w/2), yp-(h/2), w, h, 0, 0, this.ui.imz[0].width, this.ui.imz[0].height)
            zc.strokeStyle='blue'
            zc.beginPath();
            zc.moveTo(95,50)
            zc.lineTo(105,50)
            zc.stroke()
            zc.beginPath();
            zc.moveTo(100,45)
            zc.lineTo(100,55)
            zc.stroke()
        },
            
                
        imZoomClick: function(e) {
            var c = utils.get_xy(e, this.ui.imz)
            var newx = Math.round((100-c[0])/5)
            var newy = Math.round((50-c[1])/5)
            this._plot_profiles(this.lastx-newx, this.lasty-newy-1)
        },
                
                
        // Scrolling around diffraction image
        mouseDown: function(e) {
            e.preventDefault()
            if(e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0];
            this.record = 1
            this.startx = e.clientX
            this.starty = e.clientY
        },
        
        mouseMove: function(e) {
            e.preventDefault()
            if (e.originalEvent.touches && e.originalEvent.touches.length >  1) return
            if (e.originalEvent.touches && e.originalEvent.touches.length) e = e.originalEvent.touches[0];
            var c = utils.get_xy(e, this.ui.canvas)
            this._cursor(c[0], c[1])
                         
            if (this.record) {
                this.moved = true
                this.offsetx += e.clientX - this.startx
                this.offsety += e.clientY - this.starty
                         
                this._clamp_offset()
                this.draw()

                this.startx = e.clientX
                this.starty = e.clientY
            }
        },
                              
        mouseUp: function(e) {
            e.preventDefault()
            if (this.moved) {
              this.draw()
              this.readjust()
              this.moved = false
            } else {
              if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) e = e.originalEvent.changedTouches[0];
              var c = this._clamp_z_box(utils.get_xy(e, this.ui.canvas))
              this._plot_profiles(c[0], c[1]-2)
            }
            this.record = 0
        },
        
        
        readjust: function() {
            this._recache()
            this.adjust()
            this._plot_profiles(this.lastx, this.lasty)
        },
                
                        
        touchMove: function(e) {
            this.mouseMove(e)
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

        touchEnd: function(e) {
            this.mouseUp(e)
            this.lastv = 0
        },
          
        // Bind mousewheel to zoom in / out
        mouseWheel: function(e) {
            e.preventDefault()
            var o = e.originalEvent
            var delta = o.wheelDelta ? o.wheelDelta : -o.detail
            //this.zoom(utils.get_xy(e, '#img'), e.originalEvent.wheelDelta)
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
                         
            this._clamp_offset()
            if (this.scalef < 2) this.ui.zoom.slider('value', this.scalef*100)
            this.ui.zval.text((this.scalef*100).toFixed(0))
                         
            this.draw()
            this.readjust()
                         
            //return false
        },
            
                
          
          
        // Clamp zoom box
        _clamp_z_box: function(c) {
            if (c[0]+20 > this.ui.canvas.width()) c[0] = this.ui.canvas.width()-20
            if (c[1]+10 > this.ui.canvas.height()) c[1] = this.ui.canvas.height()-10
          
            return c
        },
          
        // Clamp offsets for zooming / panning
        _clamp_offset: function() {
            if (this.offsety > 0) this.offsety = 0
            if (this.offsety < this.ui.canvas.height() - this.scalef*this.height) this.offsety = this.ui.canvas.height() - this.scalef*this.height
                          
            if (this.offsetx > 0) this.offsetx = 0
            if (this.offsetx < this.ui.canvas.width() - this.scalef*this.width) this.offsetx = this.ui.canvas.width() - this.scalef*this.width
        },
                
                
                
                
                
                
                
                
        // Convert distance from centre to resolution and back
        _dist_to_res: function(dist) {
            return this.model.get('WAVELENGTH') / (2*Math.sin(Math.atan(dist/this.model.get('DET'))/2))
        },
          
        _res_to_dist: function(res) {
            return Math.tan(2*Math.asin(this.model.get('WAVELENGTH') / (2*res)))*this.model.get('DET')
        },
          
                
        // Convert xy coord on image to distance from centre
        _xy_to_dist: function(x, y) {
            return Math.sqrt(Math.pow(Math.abs(x*this.ps/this.imscale-this.model.get('YBEAM')),2)+Math.pow(Math.abs(y*this.ps/this.imscale-this.model.get('XBEAM')),2))
        },
          
          
        // Set cursor position and resolution
        _cursor: function(x, y) {
            var posx = (x/this.scalef)-(this.offsetx/this.scalef)
            var posy = (y/this.scalef)-(this.offsety/this.scalef)
          
            var res = this._dist_to_res(this._xy_to_dist(posx,posy))
    
            this.ui.resc.text(res.toFixed(2))
        },
                
                
                
        
                
        // Bind load image on return
        keyPressNum: function(e) {
            var n = parseInt(this.ui.num.val())
            if(e.which == 13) {
                if (n < this.model.get('NUMIMG')) {
                    this.change(n)
                } else this.ui.num.val(this.model.get('NUMIMG'))
            }
        },
          
                
        // Draw, recache, adjust
        _dra: function() {
            this.draw()
            this._recache()
            this.adjust()
        },
          
        // Bind image adjustments
        slideChangeContrast: function( e, ui ) {
            this.contrast = this.ui.contrast.slider('value')
            this.ui.cval.text(this.contrast)
            this._dra()
        },
          
        slideChangeBrightness: function( e, ui ) {
            this.brightness = this.ui.brightness.slider('value')
            this.ui.bval.text(this.brightness)
            this._dra()
        },
          
          
        // Bind zoom slider
        slideChangeZoom: function( e, ui ) {
            this.scalef = this.ui.zoom.slider('value')/100.0
            this.ui.zval.text((this.scalef*100).toFixed(0))
            if (e.originalEvent) {
              this._clamp_offset()
              this.draw()
            }
        },
            
        doInvert: function() {
            invert_change = true
            this._dra()
        },


        doThreshold: function() {
            this.load(this.n)
        }


            
    }))

})