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
        snapshotId: 2,
        template: template,
        className: 'content',
        
        ui: {
            canvas: 'canvas',
            hmt: 'input[name=heatmap]',
            ty: 'select[name=type]',
            ty2: 'select[name=type2]',
            xfm: '.xfm',
            flu: 'input[name=fluo]',
            el: 'select[name=element]',
        },

        events: {
            'mousemove @ui.canvas': 'mouseMove',
            'mousedown @ui.canvas': 'mouseDown',

            'change @ui.ty': 'setType',
            'change @ui.ty2': 'loadAttachment',
            'change @ui.hmt': 'setHM',

            'change @ui.flu': 'toggleFluo',
            'change @ui.el': 'changeElement',
        },


        setHM: function() {
            this.heatmapToggle = this.ui.hmt.is(':checked')
            console.log('htm', this.heatmapToggle)
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

            this._ready = []

            this.distl = new DISTL({ id: this.getOption('ID'), nimg: this.getOption('NUMIMG'), pm: this.getOption('parent') })
            this.listenTo(this.distl, 'change', this.draw, this)
            this.grid = new GridInfo({ id: this.getOption('ID') })
            this.listenTo(this.grid, 'sync', this.afterFetchGrid)

            var self = this
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

            this.heatmapToggle = false

            this.snapshotLoading = false
            this.listenTo(app, 'window:scroll', this.lazyLoad, this)
        },

        afterFetchGrid: function() {
            if (this.grid.get('STEPS_Y') > 0) {
                this.gridFetched = true
                if (this.grid.get('ORIENTATION')) this.vertical = this.grid.get('ORIENTATION') == 'vertical'
                else this.vertical = (this.grid.get('STEPS_Y') > this.grid.get('STEPS_X')) && app.config.gsMajorAxisOrientation
                console.log('grid', this.grid.get('DATACOLLECTIONID'), this.grid.get('ORIENTATION'), 'vertical', this.vertical)

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
            }
        },


        toggleFluo: function() {
            if (this.ui.flu.is(':checked')) {
                this.ui.ty.prop('disabled', true)

                var tmp = _.where(this.xfm.get('data'), { TITLE: this.ui.el.val() })
                if (tmp[0]['R'] && tmp[0]['G'] && tmp[0]['B']) {
                    this.heatmap.configure({ maxOpacity: .4, gradient: { 0: 'rgba(0,0,0,0)', 1: 'rgb('+tmp[0]['R']+','+tmp[0]['G']+','+tmp[0]['B']+')' } })
                } else if (this.getOption('colormap') == 'viridis') {
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
                console.log('in view')
                this.getModel()

                $.when.apply($, this._ready).done(this.populatePIA.bind(this))
                this.inView = true
            }

            if (utils.inView(this.$el) && !this.xfmLoading) {
                this.xfmLoading = true
                this.xfm.fetch()
            }
        },

        populatePIA: function(e) {
            var d = this.distl.get('data')
            if (!d[0].length) {
                this.ui.ty.hide()
                if (this.attachments.length) {
                    this.ui.ty2.html(this.attachments.opts()).show()
                    this.loadAttachment()
                }
            }
        },


        getModel: function() {
            var m = this.getOption('imagestatuses').findWhere({ ID: this.getOption('ID') })
            if (m.get('SNS').length) {
                if (m.get('SNS')[this.getOption('snapshotId')] && this.hasSnapshot == false) {
                    this.snapshotLoading = true
                    this.$el.addClass('loading')
                    this.snapshot.load(app.apiurl+'/image/id/'+this.getOption('ID')+'/f/1')   
                }
            }
        },

        snapshotLoaded: function() {
            console.log('snapshot loaded')
            this.hasSnapshot = true
            this.$el.removeClass('loading')
            this.draw()
        },

        onRender: function() {
            this.ui.xfm.hide()
            this.ui.ty2.hide()
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


        draw: function() {
            console.log('draw', this.ctx, this.hasSnapshot)
            if (!this.ctx || !this.gridFetched) return

            var bw = 1000*this.grid.get('DX_MM')/Math.abs(this.grid.get('PIXELSPERMICRONX'))
            var bh = 1000*this.grid.get('DY_MM')/Math.abs(this.grid.get('PIXELSPERMICRONY'))

            var radius = bh < bw ? (bh * 1.1) : (bw * 1.1)

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            // plot cropped snapshot
            if (this.hasSnapshot) {
                var stx = this.grid.get('SNAPSHOT_OFFSETXPIXEL')
                var sty = this.grid.get('SNAPSHOT_OFFSETYPIXEL')

                var w = bw*this.grid.get('STEPS_X')
                var h = bh*this.grid.get('STEPS_Y')

                if (app.options.get('scale_grid').indexOf(this.getOption('BL')) > -1) {
                    var scalef = this.snapshot.width/1024

                    stx *= scalef
                    sty *= scalef

                    w *= scalef
                    h *= scalef
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
                this.ctx.drawImage(this.snapshot, stx-this.offset_w/2, sty-this.offset_h/2, w+this.offset_w, h+this.offset_h, 0, 0, this.perceivedw, this.perceivedh)
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
                if (this.distl.get('data')) d = this.distl.get('data')[parseInt(this.ui.ty.val())] 
            } else {
                var a = this.attachments.findWhere({ 'DATACOLLECTIONFILEATTACHMENTID': this.ui.ty2.val() })
                if (a && a.get('DATA')) d = a.get('DATA')
            }

            if (!d) return

            // plot distl data
            if (d.length) {
                var max = 0
                _.each(d, function(v,i) {
                    if (v[1] > max) max = v[1]
                })

                if (this.getOption('padMax') && max < 10) max = max * 50

                var sw = (this.perceivedw-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
                var sh = (this.perceivedh-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')

                radius = (sw > sh ? sw : sh)

                var data = []
                _.each(d, function(v,i) {
                    var k = v[0] - 1

                    // Account for vertical grid scans
                    if (this.vertical) {
                        var xstep = Math.floor(k / this.grid.get('STEPS_Y'))
                        var ystep = k % this.grid.get('STEPS_Y')

                        if (this.grid.get('SNAKED') == 1) {
                             if (xstep % 2 == 1) ystep = (this.grid.get('STEPS_Y')-1) - ystep
                         }

                        var x = xstep * sw + sw/2 + (this.offset_w*this.scale)/2
                        var y = ystep * sh + sh/2 + (this.offset_h*this.scale)/2

                    } else {
                        var xstep = k % this.grid.get('STEPS_X')
                        var ystep = Math.floor(k / this.grid.get('STEPS_X'))

                        if (this.grid.get('SNAKED') == 1) {
                             if (ystep % 2 == 1) xstep = (this.grid.get('STEPS_X')-1) - xstep
                        }

                        var x = xstep * sw + sw/2 + (this.offset_w*this.scale)/2
                        var y = ystep * sh + sh/2 + (this.offset_h*this.scale)/2
                    }
                    var r = ((v[1] < 1 ? 0 : v[1]) / (max == 0 ? 1 : max)) * sw / 2

                    data.push({ x: x, y: y, value: v[1] < 1 ? 0 : v[1], 
                        radius: radius
                    })

                    if (this.current == k) {
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

            if (current != this.current) {
                this.current = current
                var xyz = this._getXYZ(current)
                this.trigger('current', current, xyz[0], xyz[1], xyz[2], this._getVal(current))
                this.draw()
            }

        },

        _getXYZ: function(pos) {
            if (this.vertical) {
                var xp = Math.floor(pos / this.grid.get('STEPS_Y'))
                var yp = pos % this.grid.get('STEPS_Y')
            } else {
                var xp = pos % this.grid.get('STEPS_X')
                var yp = Math.floor(pos / this.grid.get('STEPS_X'))
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
            var d = this.distl.get('data')[parseInt(this.ui.ty.val())] 
            _.each(d, function(v, i) {
                // 1 indexed array
                if (v[0] == pos+1) {
                    val = v[1]
                    return
                }
            })

            return val
        },


        _xyToPos: function(x, y) {
            var sw = (this.perceivedw-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
            var sh = (this.perceivedh-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')
        
            // if (xstep % 2 == 1) ystep = (this.grid.get('STEPS_Y')-1) - ystep

            var xa = x - ((this.offset_w*this.scale)/2)
            var ya = y - ((this.offset_h*this.scale)/2)

            if (this.vertical) {
                var x =  Math.floor(xa/sw) 
                var y = Math.floor(ya/sh)
                if (this.grid.get('SNAKED') == 1) {
                    if (x % 2 == 1) y = (this.grid.get('STEPS_Y') - 1) - y
                }
                var pos = (x * this.grid.get('STEPS_Y')) + y
            } else {
                var x =  Math.floor(xa/sw) 
                var y = Math.floor(ya/sh)
                if (this.grid.get('SNAKED') == 1) {
                    if (y % 2 == 1) x = (this.grid.get('STEPS_X') - 1) - x
                }
                var pos = x + (y  * this.grid.get('STEPS_X'))
            }

            return pos

        },

        onDestroy: function() {
            this.distl.stop()
            this.xfm.stop()
        },

    }))

})