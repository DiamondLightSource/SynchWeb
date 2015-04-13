define(['jquery', 'marionette',
    
        'utils/canvas',
        'tpl!templates/dc/imageviewer.html',
        'caman',
        'utils',
        'jquery-ui',
    ], function($, Marionette, canvas, template, Caman, utils) {
    
    return Marionette.ItemView.extend(_.extend({}, canvas, {
        className: 'content',
        template: template,
        
        templateHelpers: function() {
            return {
                VIS_LINK: app.prop+'-'+this.model.get('VN')
            }
        },
        
        resizeThread: null,
            
        ui: {
            canvas: '#img',
            holder: '.image_container .image',
        
            zoom: '#zoom',
            brightness: '#brightness',
            contrast: '#contrast',
            progress: '.im_progress',
            invert: 'input[name=invert]',
            num: 'input[name=num]',
        
            res: 'input[name=res]',
            ice: 'input[name=ice]',
        },
            
        events: {
            'click button[name=reset]': 'resetImage',
            'resize document': 'onResize',
        
            'click #im_zoom': 'imZoomClick',
        
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
        
            'click button[name=next]': 'next',
            'click button[name=prev]': 'prev',
        
        },
            
            
            
        initialize: function(options) {
            this.onResize = _.debounce(this.onResize, 200)
            this.draw = _.debounce(this.draw, 10)
            this.readjust = _.debounce(this.readjust, 200)
            
            console.log(this.model)

            this.n = options.n || 1
            this.img = new Image()
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
            
            this.imscale = 1;
            
            this.moved = false
            this.blocks = 0
            this.invert_change = false
            
        },
            
        
        onDestroy: function() {
        
        },
        
        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            console.log(this.canvas, this.ui.canvas)
            this.ctx = this.canvas.getContext('2d')
        
            // Setup Controls
            this.ui.zoom.slider({min: 0, max: 200, step: 5})
            this.ui.brightness.slider({min: -100, max: 100, step: 5})
            this.ui.contrast.slider({min: -100, max: 100, step: 5})
            this.ui.progress.progressbar({ value: 0 });
            
            this.c = Caman('#img')
            
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
            
            this.load(1)
            this.onResize()
        },
        
            
        resetImage: function(e) {
            e.preventDefault()
            
            this.ui.brightness.slider('value', 0)
            this.ui.contrast.slider('value', 0)
            this.ui.zoom.slider('value', 0)
            this.ui.invert.prop('checked', false)
            
            setTimeout(function() {
                this._clamp_offset()
                this.draw()
                this._recache()
                this.adjust()
            },300)
        },
            
            
        onResize: function() {
            this.ui.holder.height($(window).height()*0.65)
            
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
          this.img.src = app.apiurl+'/image/'+(this.low ? 'diff/f/1' : 'di')+'/id/'+this.model.get('ID')+'/n/'+n
            
          this.img.onload = this._onload.bind(this)
          this.img.onerror = this._onerror.bind(this,n)
        },
        
        _onload: function() {
              if (this.img.width == 0) return
        
              this.width = this.img.width
              this.height = this.img.height
              this.imscale = this.width/(this.model.get('BL') == 'i04-1' ? 1679 : 2527);
              this._calc_zoom()
              this.draw()
              this._recache()
              this.ui.canvas.fadeIn(100);
              this._plot_profiles(20,10)
  
              // Set cache point
              this.ci = this.n+1
              this.precache()
        },
                  
        _onerror: function(n,e) {
            this.$el.find('.message_box').html('<p class="message alert">These images dont look to be on disk any more. Using low resolution jpegs instead</p>')
              if (!this.low) {
                  this.low = 1;
                  this.img.src = ''
  
                  var self = this
                  setTimeout(function() {
                    self.load(n)
                  }, 500)
  
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
            val = this.ui.num.val()
            if (val > 1) {
              if (val > this.model.get('NI')) val = ni
              val--
              this.change(val)
              val = this.ui.num.val(val)
            }
        },
          
        next: function() {
            val = this.ui.num.val()
            if (val < this.model.get('NI')) {
              val++
              this.change(val)
              val = this.ui.num.val(val)
            }
        },
        
        
        // Start precaching images
        precache: function() {
            var self = this
            if ($(window).width() > 800) {
                var pro = function() {
                    console.log('loaded', self.ci)
                    setTimeout(function() {
                       if (self.ci < self.model.get('NI')) self.precache(++self.ci)
                    }, 500)
                    $('.precache').html('Precached '+self.ci+' of '+self.model.get('NI'))
                }
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
            var iw = this.img.naturalWidth, ih = this.img.naturalHeight;
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = ih;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var data = ctx.getImageData(0, 0, 1, ih).data;
            // search image edge pixel position in case it is squashed vertically.
            var sy = 0;
            var ey = ih;
            var py = ih;
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3];
                if (alpha === 0) {
                    ey = py;
                } else {
                    sy = py;
                }
                py = (ey + sy) >> 1;
            }
            var ratio = (py / ih);
            return (ratio===0)?1:ratio;
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
            $('#zval').html((this.scalef*100).toFixed(0))
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
              rad = this._res_to_dist(rings[i])/0.172*this.imscale
              this.ctx.arc(this.model.get('YBEAM')/0.172*this.imscale,this.model.get('XBEAM')/0.172*this.imscale,rad,0,2*Math.PI);
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
              this.ctx.arc(this.model.get('YBEAM')/0.172*this.imscale,this.model.get('XBEAM')/0.172*this.imscale,rad,0,2*Math.PI);
              this.ctx.stroke();
              this.ctx.fillText(this._dist_to_res(rad*0.172/this.imscale).toFixed(2) + 'A',this.model.get('YBEAM')/0.172*this.imscale-(this.low ? 10 : 40 ),this.model.get('XBEAM')/0.172*this.imscale-rad+(this.low ? 10 : 40));
            }
        },
        
                
        // Plot spot profile
        _plot_profiles: function(xp, yp) {
            if (xp < 20) xp = 20
            if (yp < 10) yp = 10
          
            this.lastx = xp
            this.lasty = yp
          
            var w = $(window).width() <= 600 ? 20 : 40
            var h = 20
          
            $('.im_highlight').offset({ left: this.ui.canvas.offset().left+xp-(w/2), top: this.ui.canvas.offset().top+yp-(h/2) })
          
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
          
            $.plot('.xprofile', [x], options)
            $.plot('.yprofile', [y], options)
          
            var zc = $('#im_zoom')[0].getContext('2d')
            zc.drawImage(this.ctx.canvas,xp-(w/2), yp-(h/2), w, h, 0, 0, 200, 100)
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
            var c = utils.get_xy(e, '#im_zoom')
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
            var c = utils.get_xy(e, '#img')
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
              var c = this._clamp_z_box(utils.get_xy(e, '#img'))
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
            this.zoom(utils.get_xy(o, '#img'), delta)
        },
                         
        zoom: function(xy, delta) {
            var last_scale = this.scalef

            this.scalef += delta > 0 ? 0.1 : -0.1
            if (this.scalef < (this.ui.canvas.width()/this.width)) this.scalef = this.ui.canvas.width()/this.width
              
            var curp = -this.offsetx + xy[0]
            var newp = curp*(this.scalef/(last_scale))
            this.offsetx -= newp-curp

            var curp = -this.offsety + xy[1]
            var newp = curp*(this.scalef/(last_scale))
            this.offsety -= newp-curp
                         
            this._clamp_offset()
            if (this.scalef < 2) this.ui.zoom.slider('value', this.scalef*100)
            $('#zval').html((this.scalef*100).toFixed(0))
                         
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
            // assume everyone is using a pilatus
            var ps = 0.172
          
            return Math.sqrt(Math.pow(Math.abs(x*ps/this.imscale-this.model.get('YBEAM')),2)+Math.pow(Math.abs(y*ps/this.imscale-this.model.get('XBEAM')),2))
        },
          
          
        // Set cursor position and resolution
        _cursor: function(x, y) {
            var posx = (x/this.scalef)-(this.offsetx/this.scalef)
            var posy = (y/this.scalef)-(this.offsety/this.scalef)
          
            var res = this._dist_to_res(this._xy_to_dist(posx,posy))
    
            $('#res').html(res.toFixed(2))
        },
                
                
                
        
                
        // Bind load image on return
        keyPressNum: function(e) {
            if(e.which == 13) {
                if (this.ui.num.val() < this.model.get('NI')) {
                    this.change(parseInt(this.ui.num.val()))
                } else this.ui.num.val(this.model.get('NI'))
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
            this.ui.contrast.prev('#cval').text(this.contrast)
            this._dra()
        },
          
        slideChangeBrightness: function( e, ui ) {
            this.brightness = this.ui.brightness.slider('value')
            this.ui.brightness.prev('#bval').text(this.brightness)
            this._dra()
        },
          
          
        // Bind zoom slider
        slideChangeZoom: function( e, ui ) {
            this.scalef = this.ui.zoom.slider('value')/100.0
            $('#zval').html((this.scalef*100).toFixed(0))
            if (e.originalEvent) {
              this._clamp_offset()
              this.draw()
            }
        },
            
        doInvert: function() {
            invert_change = true
            this._dra()
        },
            
    }))

})