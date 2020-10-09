define(['marionette',
        'views/imageviewer',
        'utils/xhrimage',
        'collections/subsamples',
        'modules/dc/models/xfm',
        'modules/imaging/collections/inspections',
        'modules/imaging/collections/inspectionimages',
        'modules/dc/views/viridis',
        // 'heatmap',
        'templates/samples/sampleviewer.html'
    ], function(
        Marionette, ImageViewer,
        XHRImage,
        Subsamples,
        XFMap,
        Inspections, InspectionImages,
        viridis,
        // HeatMap,
        template) {
    
    var SampleImageViewer = ImageViewer.extend({
        template: template,
        zoomStep: 0.005,
        
        events: {
            'click canvas': 'onClick',
            'change @ui.roi': 'draw',
            'change @ui.hidden': 'toggleShowHidden',
        },

        ui: {
            controls: '.controls',
            roi: 'select[name=roi]',
            hidden: 'input[name=hidden]',
        },

        getInspectionId: function() {
            var ins = this.inspections.findWhere({ isSelected: true })
            if (ins) return ins.get('CONTAINERINSPECTIONID')
        },

        populateInspections: function() {
            if (this.inspections.length) {
                this.inspections.at(0).set({ isSelected: true })
                this.loadImages()
            } else {
                this.calculateLimits()
            }
        },

        loadImages: function() {
            this.inspectionimages.fetch().done(this.xhrImages.bind(this))
        },

        xhrImages: function() {
            var promises = []
            var loaded = 0
            var self = this
            this.inspectionimages.each(function(m, i) {
                var promise = Marionette.Deferred();
                promises.push(promise)
                var xhr =  new XHRImage()
                xhr.onload = function() {
                    promise.resolve()
                    loaded++
                    self.ui.progress.text(loaded+'/'+self.inspectionimages.length+' images loaded |')
                }
                m.set({ xhr: xhr }, { silent: true })
                xhr.load(m.urlFor('full'))
            }, this)

            $.when.apply($, promises).then(function() {
                setTimeout(function() {
                    self.ui.progress.text('')
                }, 100)
                console.log('all images loaded')
                self.calculateLimits()
            })
        },

        calculateLimits: function() {
            this.limits = {
                x1: 1e20, x2: 0, y1: 1e20, y2: 0,
            }
            this.inspectionimages.each(function(m) {
                var xhr = m.get('xhr')

                var offx = parseFloat(m.get('OFFSETX'))
                var offy = parseFloat(m.get('OFFSETY'))
                var width = xhr.width * Math.abs(m.get('MICRONSPERPIXELX')*1000)
                var height = xhr.height * Math.abs(m.get('MICRONSPERPIXELY')*1000)

                if (offx < this.limits.x1) this.limits.x1 = offx
                if ((offx + width) > this.limits.x2) this.limits.x2 = offx + width
                if (offy < this.limits.y1) this.limits.y1 = offy
                if ((offy + height) > this.limits.y2) this.limits.y2 = offy + height
            }, this)

            this.subsamples.each(function(s) {
                var arr
                if (s.get('X2')) arr = {x1: 'X', x2: 'X2', y1: 'Y', y2: 'Y2'}
                else arr = {x1: 'X', y1: 'Y', x2: 'X', y2: 'Y'}

                _.each(arr, function(v, k) {
                    var val = parseFloat(s.get(v))
                    if (k.indexOf('2') > -1) {
                        if (val > this.limits[k]) this.limits[k] = val
                    } else {
                        if (val < this.limits[k]) this.limits[k] = val
                    }
                    
                }, this)
            }, this)

            this.width = this.limits.x2 - this.limits.x1
            this.height = this.limits.y2 - this.limits.y1
            


            this.calcZoom()
            this.offsetx = -this.limits.x1 * this.scalef
            this.offsety = -this.limits.y1 * this.scalef

            this.draw()
        },

        draw: function() {
            this.ctx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
            this.ctx.clearRect(this.limits.x1, this.limits.y1, this.width, this.height)

            this.drawMaps()

            this.inspectionimages.each(function(m) {
                this.ctx.drawImage(
                    m.get('xhr'), 
                    parseInt(m.get('OFFSETX')), 
                    parseInt(m.get('OFFSETY')), 
                    Math.abs(m.get('MICRONSPERPIXELX'))*m.get('xhr').width*1000, 
                    Math.abs(m.get('MICRONSPERPIXELY'))*m.get('xhr').height*1000,
                )
            }, this)

            this.subsamples.each(function(o) {
                this._drawObject({ o: o })
            }, this)

            this.drawScroll()
        },

        populateMaps: function() {
            var rois = _.unique(_.pluck(this.xfm.get('data'), 'TITLE'))
            var opts = _.map(rois, function(title) {
                return '<option value="'+title+'">'+title+'</option>'
            })
            this.ui.roi.html(opts.join())
            this.draw()
        },

        initialize: function(options) {
            this.subsamples = options.subsamples
            this.listenTo(this.subsamples, 'change:isSelected', this.draw)

            this.sample = options.sample
            this.inspections = new Inspections()
            this.inspections.queryParams.cid = this.sample.get('CONTAINERID')
            this.inspections.queryParams.allStates = 1
            this.listenTo(this.inspections, 'sync', this.populateInspections)
            this.inspections.fetch()

            this.inspectionimages = new InspectionImages()
            this.inspectionimages.queryParams.sid = this.sample.get('BLSAMPLEID')
            this.inspectionimages.queryParams.iid = this.getInspectionId.bind(this)

            this.xfm = new XFMap({ running: false })
            this.listenTo(this.xfm, 'sync', this.populateMaps)
            this.xfm.fetch({ data: { sid: this.sample.get('BLSAMPLEID') } })

            this.showHidden = false
        },

        toggleShowHidden: function() {
            this.showHidden = !this.showHidden
            this.draw()
        },

        onRender: function() {
            this.ui.controls.hide()
        },

        clampOffsets: function() {
            if (this.offsety > -this.limits.y1*this.scalef) this.offsety = -this.limits.y1*this.scalef
            if (this.offsety < this.ui.canvas.height() - this.limits.y2*this.scalef) this.offsety = this.ui.canvas.height() - this.limits.y2*this.scalef
                          
            if (this.offsetx > -this.limits.x1*this.scalef) this.offsetx = -this.limits.x1*this.scalef
            if (this.offsetx < this.ui.canvas.width() - this.limits.x2*this.scalef) this.offsetx = this.ui.canvas.width() - this.limits.x2*this.scalef
        },

        _drawObject: function(options) {
            if (!options.o) return

            var m = this.scalef > 1 ? 1: 1/this.scalef
            var w = 15*m
            this.ctx.lineWidth = this.scalef > 1 ? 1 : 1/this.scalef

            var x = parseInt(options.o.get('X'))
            var y = parseInt(options.o.get('Y'))
            this.ctx.strokeStyle = 'red'

            var colors = {
                GR: '#fdfd96',
                SC: '#fdfd96',
                AI: '#ffb347',
                DC: '#87ceeb',
                AP: '#77dd77',
                XS: '#d287eb',
                XM: '#d287eb',
                ES: '#a087eb',
            }
            
            var c = null
            _.each(colors, function(v,t) {
                if (options.o.get(t) > 0) {
                    c = v
                }
            }, this)
            if (options.o.get('isSelected')) c = 'turquoise'
            if (c) this.ctx.strokeStyle = c

            if (options.o.get('X2') && options.o.get('Y2')) {
                var x2 = parseInt(options.o.get('X2'))
                var y2 = parseInt(options.o.get('Y2'))

                this.ctx.beginPath()
                this.ctx.rect(x, y, x2-x, y2-y)
                this.ctx.stroke()
                this.ctx.closePath()

            } else {
                this.ctx.beginPath()
                this.ctx.moveTo(x-w,y)
                this.ctx.lineTo(x+w,y)
                this.ctx.stroke()
                this.ctx.beginPath()
                this.ctx.moveTo(x,y-w)
                this.ctx.lineTo(x,y+w)
                this.ctx.stroke()
            }

            this.ctx.fillStyle = options.o.get('isSelected') ? 'turquoise' : 'red'
            this.ctx.font = parseInt(14*m)+'px Arial'
            this.ctx.fillText(parseInt(options.o.get('RID'))+1,x-(m*15), y-(m*6))
        },


        drawMaps: function() {
            this.subsamples.each(function(ss) {
                var maps = _.where(this.xfm.get('data'), { TITLE: this.ui.roi.val(), BLSUBSAMPLEID: ss.get('BLSUBSAMPLEID') })

                if (maps.length) {
                    var map = maps[0]
                    const buffer = new Uint8ClampedArray(map.STEPS_X * map.STEPS_Y * 4);

                    var max = map.MAX || _.max(map.DATA)
                    var min = map.MIN || _.min(map.DATA)

                    // Third copy of this code
                    //  Abstract me somewhere
                    _.each(map.DATA, function(v,k) {
                        // Account for vertical grid scans
                        if (map.ORIENTATION == 'vertical') {
                            var xstep = Math.floor(k / parseInt(map.STEPS_Y))
                            var ystep = k % parseInt(map.STEPS_Y)

                            if (map.SNAKED == 1) {
                                if (xstep % 2 == 1) ystep = (parseInt(map.STEPS_Y)-1) - ystep
                            }

                        } else {
                            var xstep = k % map.STEPS_X
                            var ystep = Math.floor(k / parseInt(map.STEPS_X))

                            if (map.SNAKED == 1) {
                                if (ystep % 2 == 1) xstep = (parseInt(map.STEPS_X)-1) - xstep
                            }
                        }

                        var pos = (ystep * map.STEPS_X + xstep) * 4

                        if (v == -1) {
                            buffer[pos] = 0;
                            buffer[pos + 1] = 0;
                            buffer[pos + 2] = 0;
                            buffer[pos + 3] = 0;
                        } else {
                            var scaled = Math.round((v - min) / (max - min) * 255);
                            if (scaled > 255) scaled = 255
                            var cm = viridis[scaled]

                            buffer[pos]     = Math.round(cm[0] * 255)
                            buffer[pos + 1] = Math.round(cm[1] * 255)
                            buffer[pos + 2] = Math.round(cm[2] * 255)
                            buffer[pos + 3] = Math.round((this.showHidden ? 1 : map.OPACITY) * 255);
                        }
                    }, this)

                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');

                    canvas.width = map.STEPS_X;
                    canvas.height = map.STEPS_Y;

                    var idata = ctx.createImageData(map.STEPS_X, map.STEPS_Y);
                    idata.data.set(buffer);
                    ctx.putImageData(idata, 0, 0);

                    this.ctx.imageSmoothingEnabled = false
                    this.ctx.drawImage(
                        canvas,
                        parseInt(ss.get('X')), 
                        parseInt(ss.get('Y')), 
                        parseInt(ss.get('X2')) - parseInt(ss.get('X')), 
                        parseInt(ss.get('Y2')) - parseInt(ss.get('Y')), 
                    )
                    this.ctx.imageSmoothingEnabled = true
                }

            }, this)
        },

        drawScroll: function() {
            this.ctx.strokeStyle = 'rgb(200, 200, 200, 0.7)'

            var height = (this.canvas.height/this.scalef / this.height) * this.canvas.height/this.scalef
            if (height < this.canvas.height/this.scalef) {
                var starty = -this.offsety/this.scalef
                var pcy = (-this.offsety - this.limits.y1*this.scalef) / ((this.limits.y2 - this.limits.y1)*this.scalef)
                var offsety = pcy * (this.canvas.height/this.scalef)

                this.ctx.lineWidth = 15/this.scalef
                this.ctx.beginPath()
                this.ctx.moveTo((-this.offsetx + this.canvas.width)/this.scalef, starty + offsety)
                this.ctx.lineTo((-this.offsetx + this.canvas.width)/this.scalef, starty + offsety + height)
                this.ctx.stroke()
            }

            var width = (this.canvas.width/this.scalef / this.width) * this.canvas.width/this.scalef
            if (width < this.canvas.width/this.scalef) {
                var startx = -this.offsetx/this.scalef
                var pcx = (-this.offsetx - this.limits.x1*this.scalef) / ((this.limits.x2 - this.limits.x1)*this.scalef)
                var offsetx = pcx * (this.canvas.width/this.scalef)

                this.ctx.beginPath()
                this.ctx.moveTo(startx + offsetx, (-this.offsety + this.canvas.height)/this.scalef)
                this.ctx.lineTo(startx + offsetx + width, (-this.offsety + this.canvas.height)/this.scalef)
                this.ctx.stroke()
            }
        }

    })

    return SampleImageViewer

})
