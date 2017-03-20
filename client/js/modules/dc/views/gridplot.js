define(['jquery', 'marionette',
        'modules/dc/models/distl',
        'modules/dc/models/grid',
        'utils/canvas',
        'tpl!templates/dc/gridplot.html',
        'caman',
        'heatmap',
        'utils',
        'utils/xhrimage',
        'jquery-ui',
    ], function($, Marionette, DISTL, GridInfo, canvas, template, Caman, HeatMap, utils, XHRImage) {
    
    return Marionette.ItemView.extend(_.extend({}, canvas, {
        template: template,
        className: 'content',
        
        ui: {
            canvas: 'canvas',
            hmt: 'input[name=heatmap]',
            ty: 'select[name=type]',
        },

        events: {
            'mousemove @ui.canvas': 'mouseMove',
            'mousedown @ui.canvas': 'mouseDown',

            'change @ui.ty': 'setType',
            'change @ui.hmt': 'setHM',
        },


        setHM: function() {
            this.heatmapToggle = this.ui.hmt.is(':checked')
            console.log('htm', this.heatmapToggle)
            this.draw()
        },

        setType: function() {
            var types  = { 1: 0, 2: 1, 3: 3 }

            this.type = types[parseInt(this.ui.ty.val())] 
            console.log('ty', this.type)
            this.draw()
        },



        initialize: function(options) {
            this.draw = _.debounce(this.draw, 10)
            this.listenTo(options.imagestatuses, 'sync', this.getModel, this)

            var timestamp = utils._date_to_unix(this.getOption('ST'))
            this.distl = new DISTL({ id: this.getOption('ID'), nimg: this.getOption('NUMIMG'), timestamp: timestamp })
            this.listenTo(this.distl, 'change', this.draw, this)
            this.grid = new GridInfo({ id: this.getOption('ID') })


            this.distl.fetch()
            var self = this
            this.gridFetched = false
            this.grid.fetch().done(function() {
                self.gridFetched = true
                if (self.grid.get('ORIENTATION')) self.vertical = self.grid.get('ORIENTATION') == 'vertical'
                else self.vertical = (self.grid.get('STEPS_Y') > self.grid.get('STEPS_X')) && app.config.gsMajorAxisOrientation
                console.log('grid', self.grid.get('DATACOLLECTIONID'), self.grid.get('ORIENTATION'), 'vertical', self.vertical)
            })

            this.hasSnapshot = false
            this.snapshot = new XHRImage()
            this.snapshot.onload = this.snapshotLoaded.bind(this)

            this.offset_w = 0
            this.offset_h = 0
            this.scale = 1
            this.current = -1

            this.heatmapToggle = false
            this.type = 1
        },

        getModel: function() {
            var m = this.getOption('imagestatuses').findWhere({ ID: this.getOption('ID') })
            if (m.get('SNS').length)
                if (m.get('SNS')[2] && this.hasSnapshot == false) {
                this.snapshot.load(app.apiurl+'/image/id/'+this.getOption('ID')+'/f/1/n/3')
                //this.draw()
            }
        },

        snapshotLoaded: function() {
            console.log('snapshot loaded')
            this.hasSnapshot = true
            this.draw()
        },


        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            this.ctx = this.canvas.getContext('2d')

            this.canvas.width = this.$el.parent().width()
            this.canvas.height = this.$el.parent().height()

            this.heatmap = new HeatMap.create({ 
                container: this.$el[0],
                maxOpacity: .4,
            })
        },


        draw: function() {
            console.log('draw', this.ctx, this.hasSnapshot)
            if (!this.ctx || !this.gridFetched) return

            var bw = 1000*this.grid.get('DX_MM')/this.grid.get('PIXELSPERMICRONX')
            var bh = 1000*this.grid.get('DY_MM')/this.grid.get('PIXELSPERMICRONY')

            var radius = bw * 1.1

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            // plot cropped snapshot
            if (this.hasSnapshot) {
                var scalef = this.snapshot.width/1024

                var stx = (Math.floor(this.grid.get('SNAPSHOT_OFFSETXPIXEL'))+1)*scalef
                var sty = (Math.floor(this.grid.get('SNAPSHOT_OFFSETYPIXEL'))+1)*scalef

                var w = bw*this.grid.get('STEPS_X')*scalef
                var h = bh*this.grid.get('STEPS_Y')*scalef

                var cvratio = this.canvas.width / this.canvas.height
                var snratio = w/h
                
                if (cvratio < snratio) {
                    this.offset_h = (w/cvratio)-h
                } else {
                    this.offset_w = (cvratio*h)-w
                }

                this.scale = this.canvas.width/(w+this.offset_w)

                this.ctx.globalAlpha = 1
                this.ctx.drawImage(this.snapshot, stx-this.offset_w/2, sty-this.offset_h/2, w+this.offset_w, h+this.offset_h-1, 0, 0, this.canvas.width, this.canvas.height)
            }

            // plot distl data
            if (this.distl.get('data')) {
                var d = this.distl.get('data')[this.type] 

                var max = 0
                _.each(d, function(v,i) {
                    if (v[1] > max) max = v[1]
                })

                var sw = (this.canvas.width-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
                var sh = (this.canvas.height-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')

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

                    //if (!this.heatmapToggle) {
                    if (this.current == k) {
                        this.ctx.globalAlpha = 0.8
                        this.ctx.beginPath()
                        this.ctx.lineWidth = 2
                        this.ctx.strokeStyle = 'green'
                        this.ctx.rect(x-sw/2-2, y-sh/2-1, sw, sh)
                        this.ctx.stroke()
                        //this.ctx.arc(x, y, r, 0, 2*Math.PI, false)
                        //this.ctx.fillStyle = 'green'
                        //this.ctx.fill()
                    }
                }, this)

                //if (this.heatmapToggle) 
                if (max) this.heatmap.setData({ max: max, data: data })
                //else this.heatmap.setData({ data: [] })
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
            var d = this.distl.get('data')[this.type] 
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
            var sw = (this.canvas.width-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
            var sh = (this.canvas.height-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')
        

            var xa = x - ((this.offset_w*this.scale)/2)
            var ya = y - ((this.offset_h*this.scale)/2)

            if (this.vertical) {
                var pos = Math.floor(xa/sw) * this.grid.get('STEPS_Y') + Math.floor(ya/sh)
            } else {
                var pos = Math.floor(xa/sw) + (Math.floor(ya/sh) * this.grid.get('STEPS_X'))
            }

            return pos

        },

        onDestroy: function() {
            this.distl.stop()
        },

    }))

})