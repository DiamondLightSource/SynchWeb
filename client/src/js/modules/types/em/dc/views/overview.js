define(['marionette',
        'views/imageviewer',
        'modules/dc/models/distl',
        'modules/dc/models/grid',
        'modules/dc/collections/gridmap',
        'heatmap',
        'templates/types/em/dc/overview.html'
    ], function(Marionette, ImageViewer, DISTL, GridInfo, GridMap, 
        HeatMap,
        template) {
    
    var Overview = ImageViewer.extend({
        template: template,
        

        events: {
            'click canvas': 'onClick',
        },

        initialize: function(options) {
            this.draw = _.debounce(this.draw, 10)
            this.listenTo(options.imagestatuses, 'sync', this.getModel, this)
            this.pm = options.pm

            this.distl = new DISTL({ id: this.pm.get('ID'), nimg: this.pm.get('NUMIMG'), pm: this.pm })
            this.listenTo(this.distl, 'change', this.draw, this)
            
            this.grid = new GridInfo({ id: this.pm.get('ID') })
            
            var self = this
            this.gridFetched = false
            this.grid.fetch().done(function() {
                self.gridFetched = true
            })

            this.gridmap = new GridMap()
            this.gridmap.queryParams.id = this.pm.get('ID')
            this.listenTo(this.gridmap, 'change', this.draw, this)


            this.ready = []
            this.ready.push(this.gridmap.fetch())
            this.ready.push(this.distl.fetch())

            this.current = 1
            this.hasSnapshot = false
        },

        onDomRefresh: function() {
            Overview.__super__.onDomRefresh.call(this)

            this.heatmap = new HeatMap.create({ 
                container: this.$el[0],
                maxOpacity: .4,
            })
        },


        getModel: function() {
            var m = this.getOption('imagestatuses').findWhere({ ID: this.pm.get('ID') })
            if (m.get('SNS').length) {
                if (m.get('SNS')[0] && this.hasSnapshot == false) {
                    this.img.load(app.apiurl+'/image/id/'+this.pm.get('ID')+'/f/1')
                    this.showProgressBar()
                }
            }
        },


        onImageLoaded: function() {
            Overview.__super__.onImageLoaded.call(this)
            this.hasSnapshot = true
        },


        draw: function() {
            Overview.__super__.draw.call(this)

            this.heatmap._renderer.shadowCtx.setTransform(this.scalef,0,0,this.scalef,this.offsetx,this.offsety)
            this.heatmap._renderer.shadowCtx.clearRect(0,0,this.width/this.scalef, this.height/this.scalef)
            this.drawObjects()
        },


        // plot movie positions
        drawObjects: function() {
            
            var m = this.scalef > 1 ? 1: 1/this.scalef
            var w = 10*m
            this.ctx.lineWidth = this.scalef > 1 ? 1 : 1/this.scalef

            var dvs = this.distl.get('data')
            var data = []
            this.gridmap.each(function(p) {
                var x = p.get('POSITIONX')/parseFloat(this.grid.get('PIXELSPERMICRONX'))
                var y = p.get('POSITIONY')/parseFloat(this.grid.get('PIXELSPERMICRONY'))

                this.ctx.strokeStyle = this.current == p.get('IMAGENUMBER') ? 'green' : 'red'

                this.ctx.beginPath()
                this.ctx.moveTo(x-w,y)
                this.ctx.lineTo(x+w,y)
                this.ctx.stroke()
                this.ctx.beginPath()
                this.ctx.moveTo(x,y-w)
                this.ctx.lineTo(x,y+w)
                this.ctx.stroke()

                if (dvs[3].length) {
                    _.each(dvs[3], function(dv) {
                        if (dv[0] == p.get('IMAGENUMBER')) data.push({ 
                            x: x, y: y, 
                            value: dv[1], 
                            // radius: radius
                        })
                    }, this)
                }

            }, this)

            // plot distl data
            if (data.length) {
                this.heatmap.setData({ 
                    // max: max, 
                    data: data 
                })
            }
        },

        onClick: function(e) {
            var current = this._nearest(this.getScaledXY(e))

            if (current != this.current) {
                this.current = current
                this.trigger('current', current)
                this.draw()
            }

        },


        _nearest: function(pos) {
            var distances = this.gridmap.map(function(m) {
                return Math.sqrt(
                    Math.pow(pos.x - ( parseFloat(m.get('POSITIONX'))/parseFloat(this.grid.get('PIXELSPERMICRONX')) ), 2) + 
                    Math.pow(pos.y - ( parseFloat(m.get('POSITIONY'))/parseFloat(this.grid.get('PIXELSPERMICRONY')) ), 2))
            }, this)
            
            var min = _.min(distances)
            if (min < 30/this.scalef) {
                var id = distances.indexOf(min)
                var im = this.gridmap.at(id)
                return im.get('IMAGENUMBER')
            }
        },

        onDestroy: function() {
            this.distl.stop()
            this.gridmap.stop()
        },

    })

    return Overview

})