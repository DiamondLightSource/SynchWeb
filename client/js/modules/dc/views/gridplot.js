define(['jquery', 'marionette',
        'modules/dc/models/distl',
        'modules/dc/models/grid',
        'utils/canvas',
        'tpl!templates/dc/gridplot.html',
        'caman',
        'heatmap',
        'utils',
        'jquery-ui',
    ], function($, Marionette, DISTL, GridInfo, canvas, template, Caman, HeatMap, utils) {
    
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
            })

            this.hasSnapshot = false
            this.snapshot = new Image()
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
            if (m.get('SNS').length && this.hasSnapshot == false) {
                this.snapshot.src = app.apiurl+'/image/id/'+this.getOption('ID')+'/f/1/n/3'
                this.draw()
            }
        },

        snapshotLoaded: function() {
            this.hasSnapshot = true
            this.draw()
        },


        onDomRefresh: function() {
            this.canvas = this.ui.canvas[0]
            this.ctx = this.canvas.getContext('2d')

            this.canvas.width = this.$el.parent().width()
            this.canvas.height = this.$el.parent().height()

            this.heatmap = new HeatMap.create({ container: this.$el[0] })

            this.draw()
        },


        draw: function() {
            console.log('draw', this.ctx, this.hasSnapshot)
            if (!this.ctx || !this.gridFetched) return

            var bw = 1000*this.grid.get('DX_MM')/this.grid.get('PIXELSPERMICRONX')
            var bh = 1000*this.grid.get('DY_MM')/this.grid.get('PIXELSPERMICRONY')

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            // plot cropped snapshot
            if (this.hasSnapshot) {
                var stx = this.grid.get('SNAPSHOT_OFFSETXPIXEL')+1
                var sty = this.grid.get('SNAPSHOT_OFFSETYPIXEL')+1

                var w = bw*this.grid.get('STEPS_X')
                var h = bh*this.grid.get('STEPS_Y')

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

                var bs = 0.93
                var sw = (this.canvas.width-(this.offset_w*this.scale))/this.grid.get('STEPS_X')
                var sh = (this.canvas.height-(this.offset_h*this.scale))/this.grid.get('STEPS_Y')

                var data = []
                _.each(d, function(v,i) {
                    var k = v[0] - 1

                    var x = (k % this.grid.get('STEPS_X')) * sw + sw/2 + (this.offset_w*this.scale)/2
                    var y = Math.floor(k / this.grid.get('STEPS_X')) * sh + sh/2 + (this.offset_h*this.scale)/2
                    var r = ((v[1] < 1 ? 0 : v[1]) / max) * sw / 2

                    data.push({ x: x, y: y, value: v[1] < 1 ? 0 : v[1], radius: r*2 })

                    //if (!this.heatmapToggle) {
                    if (this.current == k) {
                        this.ctx.globalAlpha = 0.8
                        this.ctx.beginPath()
                        this.ctx.lineWidth = 2
                        this.ctx.strokeStyle = 'green'
                        this.ctx.rect(x-sw/2-2, y-sw/2-1, sw, sh)
                        this.ctx.stroke()
                        //this.ctx.arc(x, y, r, 0, 2*Math.PI, false)
                        //this.ctx.fillStyle = 'green'
                        //this.ctx.fill()
                    }
                }, this)

                //if (this.heatmapToggle) 
                this.heatmap.setData({ max: max, data: data })
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
            var xp = pos % this.grid.get('STEPS_X')
            var yp = Math.floor(pos / this.grid.get('STEPS_X'))

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

            return Math.floor(xa/sw)+(Math.floor(ya/sh)*this.grid.get('STEPS_X'))

        },

        onDestroy: function() {
            this.distl.stop()
        },

    }))

})