define(['jquery', 'marionette', 
        'backbone',
        'modules/dc/models/distl',
        'modules/dc/models/grid',
        'modules/dc/models/xfm',
        'collections/attachments',
        'utils/canvas',
        'modules/dc/views/viridis',
        'templates/dc/gridplot.html',
        'heatmap',
        'utils',
        'utils/xhrimage',
        'jquery-ui',
    ], function($, Marionette, Backbone, DISTL, GridInfo, XFMap, Attachments, canvas, viridis, template, HeatMap, utils, XHRImage) {
    
    return Marionette.ItemView.extend(_.extend({}, canvas, {
        padMax: true,
        blurRadius: 1.5,
        snapshotId: 2,
        template: template,
        className: 'content',
        
        ui: {
            canvas: 'canvas',
            hmt: 'input[name=heatmap]',
            ty: 'select[name=type]',
            ty2: 'select[name=type2]',
            ty3: 'select[name=type3]',
            xfm: '.xfm',
            flu: 'input[name=fluo]',
            el: 'select[name=element]',
            sns: 'a[name=snapshots]',
        },

        events: {
            'mousemove @ui.canvas': 'mouseMove',
            'mousedown @ui.canvas': 'mouseDown',

            'change @ui.ty': 'setType',
            'change @ui.ty2': 'loadAttachment',
            'change @ui.ty3': 'loadImage',
            'change @ui.hmt': 'setHM',

            'change @ui.flu': 'toggleFluo',
            'change @ui.el': 'changeElement',
        },


        setHM: function() {
            this.heatmapToggle = this.ui.hmt.is(':checked')
            // console.log('htm', this.heatmapToggle)
            this.draw()
        },

        setType: function() {
            this.draw()
        },

        gridPromise: function() {
            return this._gridPromise
        },

        gridInfo: function() {
            return this.grid
        },


        initialize: function(options) {
            this.draw = _.debounce(this.draw, 10)
            this.statusesLoaded = false
            this.listenTo(options.imagestatuses, 'sync', this.setStatues, this)
            this.noHeatMapResult = []
            this.invertHeatMap = false

            this._ready = []

            // Distl data comes in te form of a list of 2-dimensional array that represents the index of the grid and
            // the value of diffraction for that particular grid
            this.distl = new DISTL({ id: this.getOption('ID'), nimg: this.getOption('NUMIMG'), pm: this.getOption('parent') })
            this.listenTo(this.distl, 'change', this.draw, this)
            this.grid = new GridInfo({ id: this.getOption('ID') })
            this.listenTo(this.grid, 'sync', this.afterFetchGrid)

            this.gridFetched = false
            this.onGridFetch = options.onGridFetch
            this._gridPromise = this.grid.fetch()

            this.xfm = new XFMap({ id: this.getOption('ID'), nimg: this.getOption('NUMIMG'), pm: this.getOption('parent') })
            this.listenTo(this.xfm, 'change', this.draw, this)
            this.listenTo(this.xfm, 'sync', this.populateXFM, this)

            this.attachments = new Attachments()
            this.attachments.queryParams.id = this.getOption('ID')
            this.attachments.queryParams.filetype = 'pia'

            this.hasSnapshot = false
            this.snapshot = new XHRImage()
            this.snapshot.onload = this.snapshotLoaded.bind(this)

            this.offset_w = 0
            this.offset_h = 0
            this.scale = 1
            this.current = -1
            this.image_1_width = -1

            this.heatmapToggle = false

            this.snapshotLoading = false
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
        },

        afterFetchGrid: function() {
            if (this.grid.get('STEPS_Y') > 0) {
                this.gridFetched = true
                if (this.grid.get('ORIENTATION')) this.vertical = this.grid.get('ORIENTATION') === 'vertical'
                else this.vertical = (this.grid.get('STEPS_Y') > this.grid.get('STEPS_X')) && app.config.gsMajorAxisOrientation
                // console.log('grid', this.grid.get('DATACOLLECTIONID'), this.grid.get('ORIENTATION'), 'vertical', this.vertical)
                this.noHeatMapResult = Array(this.grid.get('STEPS_Y') * this.grid.get('STEPS_X')).fill([]).map((item, index) => {
                    return [index + 1, 0]
                })

            } else {
                var self = this
                setTimeout(function() {
                    self._gridPromise = self.grid.fetch()
                }, 5000)
            }

            if (this.onGridFetch) this.onGridFetch()
        },

        loadAttachment: function() {
            var a = this.attachments.findWhere({ 'DATACOLLECTIONFILEATTACHMENTID': this.ui.ty2.val() })
            var selectedOption = this.ui.ty2.find('option:selected').text()
            this.invertHeatMap = selectedOption === 'pia_estimated_d_min'
            if (a) {
                if (!a.get('DATA')) {
                    var self = this
                    Backbone.ajax({
                        url: app.apiurl+'/download/attachment/id/'+this.getOption('ID')+'/aid/'+a.get('DATACOLLECTIONFILEATTACHMENTID'),
                        dataType: 'json',
                        success: function(resp) {
                            var d = _.map(resp, function(v,i) { return [i+1, v] })
                            a.set('DATA', d)
                            self.draw()
                        }
                    })
                } else this.draw()
            } else {
                this.draw()
            }
        },

        populateImageSelect: function() {
            opts = []
            for (let i=1; i<=4; i++) {
                if (this.getOption('parent').get('X'+i)) {
                    opts.push('<option value='+i+'>Image '+i+'</option>')
                    if (i === 1) {
                        // show button to view image full size
                        this.ui.sns.append('<a class="button" href="'+app.apiurl+'/image/id/'+this.getOption('ID')+'/n/'+i+'"><i class="fa fa-arrows"></a>')
                    } else {
                        this.ui.sns.append('<a class="hidden" href="'+app.apiurl+'/image/id/'+this.getOption('ID')+'/n/'+i+'"></a>')
                    }
                }
            }
            if (opts.length > 1) {
                this.ui.ty3.html(opts).show()
            }
        },

        loadImage: function() {
            var n = this.ui.ty3.val()
            this.snapshot.load(app.apiurl+'/image/id/'+this.getOption('ID')+'/n/'+n)
        },

        toggleFluo: function() {
            if (this.ui.flu.is(':checked')) {
                this.ui.ty.prop('disabled', true)

                var tmp = _.where(this.xfm.get('data'), { TITLE: this.ui.el.val() })
                if (tmp[0]['R'] && tmp[0]['G'] && tmp[0]['B']) {
                    this.heatmap.configure({ maxOpacity: .4, gradient: { 0: 'rgba(0,0,0,0)', 1: 'rgb('+tmp[0]['R']+','+tmp[0]['G']+','+tmp[0]['B']+')' } })
                } else if (this.getOption('colormap') === 'viridis') {
                    var vgrad = _.object(_.map(viridis, function(row, i) { return [i/255, 'rgb('+row[0]*255+','+row[1]*255+','+row[2]*255+')'] }))
                    this.heatmap.configure({ maxOpacity: .4, gradient: vgrad })
                } else {
                    this.heatmap.configure({ maxOpacity: .4, gradient: { 0.25: 'rgb(0,0,255)', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)'} })
                }
                this.draw()
            } else {
                this.ui.ty.prop('disabled', false)

                this.heatmap.configure({ maxOpacity: .4, gradient: { 0.25: 'rgb(0,0,255)', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)'} })
                this.draw()
            }
        },

        changeElement: function() {
            this.draw()
        },

        populateXFM: function() {
            this.xfmLoaded = true
            if (!this.xfm.get('data').length) return

            var opts = _.map(this.xfm.get('data'), function(m) {
                return '<option value="'+m.TITLE+'">'+m.TITLE+'</option>'
            })
            this.ui.el.html(opts.join())

            this.ui.xfm.show()
            if (this.getOption('xfm')) {
                this.ui.flu.prop('checked', true).trigger('change').hide()
                this.ui.xfm.find('label').hide()
            }
        },

        setStatues: function() {
            this.statusesLoaded = true
            this.lazyLoad()
        },

        lazyLoad: function() {
            // console.log('lazy loadjg')
            if (!this.snapshotLoading && this.statusesLoaded && utils.inView(this.$el) && !this.inView) {
                this._ready.push(this.distl.fetch())
                this._ready.push(this.attachments.fetch())
                // console.log('in view')
                this.getModel()

                $.when.apply($, this._ready).done(this.populatePIA.bind(this))
                this.inView = true
            }

            if (utils.inView(this.$el) && !this.xfmLoading) {
                this.xfmLoading = true
                this.xfm.fetch()
            }
        },

        populatePIA: function() {
            var d = this.distl.get('data')
            var defaultPIA = 'pia_total_intensity'
            if (d[0].length < 1) {
                this.ui.ty.hide()
                if (this.attachments.length) {
                    const heatMapsOptionsList = `${this.attachments.opts()} \n <option value=""> None </option>`
                    this.ui.ty2.html(heatMapsOptionsList).show()
                    var a = this.attachments.findWhere({ 'NAME': defaultPIA })
                    if (a) this.ui.ty2.val(a.get('DATACOLLECTIONFILEATTACHMENTID'))
                    this.loadAttachment()
                }
            }
            var xrcstatus = this.grid.get('XRCSTATUS')
            var result = this.grid.get('XRAYCENTRINGRESULTID')
            if (xrcstatus == 'success' && result == 0) {
                this.trigger('warning', 'No diffraction found');
            } else if (xrcstatus == 'failed') {
                this.trigger('warning', 'Xray Centring has failed');
            } else if (xrcstatus == 'pending') {
                this.trigger('warning', 'Xray Centring analysis pending');
            }
        },


        getModel: function() {
            var m = this.getOption('imagestatuses').findWhere({ ID: this.getOption('ID') })
            if (m.get('SNS').length) {
                if (m.get('SNS')[this.getOption('snapshotId')] && !this.hasSnapshot) {
                    this.snapshotLoading = true
                    this.$el.addClass('loading')
                    this.snapshot.load(app.apiurl+'/image/id/'+this.getOption('ID'))
                }
            }
        },

        snapshotLoaded: function() {
            // console.log('snapshot loaded')
            this.hasSnapshot = true
            this.$el.removeClass('loading')
            this.draw()
            if (this.ui.ty3.val() == 1) {
                this.image_1_width = this.snapshot.width
            }
            var n = this.ui.ty3.val()
            this.ui.sns.magnificPopup({ type: 'image', delegate: 'a', gallery: { enabled:true } })
        },

        onRender: function() {
            this.ui.xfm.hide()
            this.ui.ty2.hide()
            this.ui.ty3.hide()
            this.populateImageSelect()
        },


        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            this.ctx = this.canvas.getContext('2d')

            var pixelRatio = window.devicePixelRatio || 1

            var w = this.$el.parent().width()
            var h = this.$el.parent().height()

            this.canvas.style.width = w+'px'
            this.canvas.style.height = h+'px'

            this.canvas.width = w*pixelRatio
            this.canvas.height = h*pixelRatio

            this.ctx.scale(pixelRatio, pixelRatio)

            this.perceivedw = w
            this.perceivedh = h

            this.$el.find('canvas.heatmap-canvas').remove()
            this.heatmap = new HeatMap.create({ 
                container: this.$el[0],
                maxOpacity: .4,
            })

            this.ui.ty.val(1)
            
            this.lazyLoad()
            if (this.hasSnapshot && utils.inView(this.$el)) this.draw()
        },

        displayResolution: function(val) {
            if (val < 0) { return 0 }
            return 100 / val
        },

        draw: function() {
            if (!this.ctx || !this.gridFetched) return

            var bw = 1000*this.grid.get('DX_MM')/Math.abs(this.grid.get('MICRONSPERPIXELX'))
            var bh = 1000*this.grid.get('DY_MM')/Math.abs(this.grid.get('MICRONSPERPIXELY'))

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            // plot cropped snapshot
            if (this.hasSnapshot) {
                var stx = this.grid.get('SNAPSHOT_OFFSETXPIXEL')
                var sty = this.grid.get('SNAPSHOT_OFFSETYPIXEL')

                var w = bw*this.grid.get('STEPS_X')
                var h = bh*this.grid.get('STEPS_Y')

                var start_date = this.grid.get('STARTDATE')
                var scale_grid_end_date = app.options.get('scale_grid_end_date')

                var scale_grid = (app.options.get('scale_grid').indexOf(this.getOption('BL')) > -1 && (start_date < scale_grid_end_date || scale_grid_end_date == null))
                console.log("scale_grid: "+scale_grid)

                if (scale_grid) {
                    var scalef = this.snapshot.width/1024

                    stx *= scalef
                    sty *= scalef

                    w *= scalef
                    h *= scalef
                }

                if (this.image_1_width > 0 && this.snapshot.width != this.image_1_width) {
                    // Image size is different to image 1, so hide PIA results as they would be in the wrong location
                    this.ui.ty.val(-1)
                    this.ui.ty2.val('')
                    this.ui.ty.prop('disabled', true)
                    this.ui.ty2.prop('disabled', true)
                } else {
                    this.ui.ty.prop('disabled', false)
                    this.ui.ty2.prop('disabled', false)
                }

                var cvratio = this.perceivedw / this.perceivedh
                var snratio = w/h
                
                this.offset_w = 0
                this.offset_h = 0
                if (cvratio < snratio) {
                    this.offset_h = (w/cvratio)-h
                } else {
                    this.offset_w = (cvratio*h)-w
                }

                this.scale = this.perceivedw/(w+this.offset_w)

                this.ctx.globalAlpha = 1
                let sx = stx-this.offset_w/2
                let sy = sty-this.offset_h/2
                let swidth = w+this.offset_w
                let sheight = h+this.offset_h
                let dx = 0
                let dy = 0
                let dwidth = this.perceivedw
                let dheight = this.perceivedh
                // Safari ignores sx values less than zero
                if (sx < 0) {
                    dx = Math.abs(sx * this.scale)
                    sx = 0
                    swidth = Math.min(this.perceivedw/this.scale, this.snapshot.width)
                    dwidth = Math.min(this.perceivedw, this.snapshot.width*this.scale)
                }
                // Safari ignores swidth values greater than snapshot width - sx
                if (swidth > this.snapshot.width - sx) {
                    dwidth *= (this.snapshot.width - sx) / swidth
                    swidth = this.snapshot.width - sx
                }

                this.ctx.drawImage(this.snapshot, sx, sy, swidth, sheight, dx, dy, dwidth, dheight)
            }

            var d = []
            if (this.ui.flu.is(':checked')) {
                var tmp = _.findWhere(this.xfm.get('data'), { TITLE: this.ui.el.val() })
                _.each(tmp.DATA, function(r, i) {
                    var val = r
                    if (tmp.MAX && r > tmp.MAX) val = tmp.MAX
                    if (tmp.MAX && r < tmp.MIN) val = tmp.MIN
                    d.push([i+1, val])
                }, this)
            } else if (this.distl.get('data') && this.distl.get('data')[0].length) {
                if (Number(this.ui.ty.val()) > -1) {
                    d = this.distl.get('data')[Number(this.ui.ty.val())]
                } else {
                    d = this.noHeatMapResult
                }
            } else {
                var a = this.attachments.findWhere({ 'DATACOLLECTIONFILEATTACHMENTID': this.ui.ty2.val() })
                if (a && a.get('DATA')) {
                    d = a.get('DATA')
                } else {
                    d = this.noHeatMapResult
                }
            }

            if (d.length > 0) {
                let max = 0
                let val = 0

                _.each(d, function(v) {
                    if (v[1] > max) max = v[1]
                })

                max = max === 0 ? 1 : max
                if (this.getOption('padMax') && max < 10) max = max * 50

                // 1.4Å
                if (this.invertHeatMap) max = 100 / 1.4

                var sw = (this.perceivedw-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
                var sh = (this.perceivedh-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')

                // Only use width if steps in x > 1
                var radius = (sw > sh && this.grid.get('STEPS_X') > 1 ? sw : sh) * this.getOption('blurRadius')

                var data = []
                _.each(d, function(v) {
                    var k = v[0] - 1
                    val = this.invertHeatMap ? this.displayResolution(v[1]) : v[1]

                    // Account for vertical grid scans
                    let xstep, ystep, x, y
                    if (this.vertical) {
                        xstep = Math.floor(k / this.grid.get('STEPS_Y'))
                        ystep = k % this.grid.get('STEPS_Y')

                        if (this.grid.get('SNAKED') === 1) {
                            if (xstep % 2 === 1) ystep = (this.grid.get('STEPS_Y')-1) - ystep
                        }

                        x = xstep * sw + sw/2 + (this.offset_w*this.scale)/2
                        y = ystep * sh + sh/2 + (this.offset_h*this.scale)/2

                    } else {
                        xstep = k % this.grid.get('STEPS_X')
                        ystep = Math.floor(k / this.grid.get('STEPS_X'))

                        if (this.grid.get('SNAKED') === 1) {
                            if (ystep % 2 === 1) xstep = (this.grid.get('STEPS_X')-1) - xstep
                        }

                        x = xstep * sw + sw/2 + (this.offset_w*this.scale)/2
                        y = ystep * sh + sh/2 + (this.offset_h*this.scale)/2
                    }

                    // Dont zero values < 1 if data is scaled to max==1
                    data.push({
                        x: x,
                        y: y,
                        value: val < 1 && max > 1 ? 0 : val,
                        radius: radius
                    })

                    if (this.current === k) {
                        this.ctx.globalAlpha = 0.8
                        this.ctx.beginPath()
                        this.ctx.lineWidth = 2
                        this.ctx.strokeStyle = 'green'
                        this.ctx.rect(x-sw/2-2, y-sh/2-1, sw, sh)
                        this.ctx.stroke()
                    }
                }, this)

                if (max) this.heatmap.setData({ max: max, data: data })
            }
        },

        mouseDown: function(e) {
            var c = utils.get_xy(e, this.ui.canvas)
            var current = this._xyToPos(c[0], c[1])

            if (current !== this.current) {
                this.current = current
                var xyz = this._getXYZ(current)
                this.trigger('current', current, xyz[0], xyz[1], xyz[2], this._getVal(current))
                this.draw()
            }

        },

        _getXYZ: function(pos) {
            let xp, yp
            if (this.vertical) {
                xp = Math.floor(pos / this.grid.get('STEPS_Y'))
                yp = pos % this.grid.get('STEPS_Y')
                if (this.grid.get('SNAKED') === 1) {
                    if (xp % 2 === 1) yp = (this.grid.get('STEPS_Y')-1) - yp
                }
            } else {
                xp = pos % this.grid.get('STEPS_X')
                yp = Math.floor(pos / this.grid.get('STEPS_X'))
                if (this.grid.get('SNAKED') === 1) {
                    if (yp % 2 === 1) xp = (this.grid.get('STEPS_X')-1) - xp
                }
            }

            var rad = Math.PI/180

            // Assumes horizontal goniometry!
            var x = (xp*this.grid.get('DX_MM'))*1000+this.grid.get('X')
            // y & z are inverted
            var y = (-yp*this.grid.get('DY_MM'))*Math.cos(this.grid.get('AXISSTART')*rad)*1000+this.grid.get('Y')
            var z = (-yp*this.grid.get('DY_MM'))*Math.sin(this.grid.get('AXISSTART')*rad)*1000+this.grid.get('Z')

            return [x.toFixed(2),y.toFixed(2),z.toFixed(2)]
        },


        mouseMove: function(e) {

        },


        _getVal: function(pos) {
            var val = null
            let d = []
            if (this.ui.ty.is(":visible")) {
                d = Number(this.ui.ty.val()) > -1 ? this.distl.get('data')[Number(this.ui.ty.val())] : []
            }
            if (this.ui.ty2.is(":visible")) {
                let a = this.attachments.findWhere({ 'DATACOLLECTIONFILEATTACHMENTID': this.ui.ty2.val() })
                if (a && a.get('DATA')) {
                    d = a.get('DATA')
                }
            }
            _.each(d, function(v) {
                // 1 indexed array
                if (v[0] === pos+1) {
                    val = v[1]
                }
            })

            return val
        },


        _xyToPos: function(xValue, yValue) {
            var sw = (this.perceivedw-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
            var sh = (this.perceivedh-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')
        
            // if (xstep % 2 == 1) ystep = (this.grid.get('STEPS_Y')-1) - ystep

            var xa = xValue - ((this.offset_w*this.scale)/2)
            var ya = yValue - ((this.offset_h*this.scale)/2)
            let x, y, pos

            if (this.vertical) {
                x =  Math.floor(xa/sw)
                y = Math.floor(ya/sh)
                if (this.grid.get('SNAKED') === 1) {
                    if (x % 2 === 1) y = (this.grid.get('STEPS_Y') - 1) - y
                }
                pos = (x * this.grid.get('STEPS_Y')) + y
            } else {
                x =  Math.floor(xa/sw)
                y = Math.floor(ya/sh)
                if (this.grid.get('SNAKED') === 1) {
                    if (y % 2 === 1) x = (this.grid.get('STEPS_X') - 1) - x
                }
                pos = x + (y  * this.grid.get('STEPS_X'))
            }

            return pos

        },

        onDestroy: function() {
            this.distl.stop()
            this.xfm.stop()
        },

    }))

})
