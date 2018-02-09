define(['marionette', 'utils', 'backbone-validation'], function(Marionette, utils) {
    
    return Marionette.ItemView.extend({
        template: false,
        tagName: 'canvas',
        className: 'plate',
        
        collectionEvents: {
            'change reset': 'drawPlate',
        },
        
        events: {
            'mousemove': 'hoverDrop',
            'click': 'clickDrop',
        },
                
        hoverDrop: function(e) {
            var hover = this._xy_to_drop(utils.get_xy(e,this.$el))
            if (hover != this.hover) {
                this.hover = hover
                this.drawPlate()
            }
            
        },
            
        clickDrop: function(e) {
            e.preventDefault()
            var pos = this._xy_to_drop(utils.get_xy(e,this.$el))
            if (pos) {
                var drop = this.collection.findWhere({ LOCATION: pos.toString() })
                
                this.trigger('plate:select')
                if (drop) drop.set('isSelected', true)
                this.drawPlate()
            }
        },
        
        initialize: function(options) {
            this.pt = this.getOption('type')
            this.inspectionimages = options && options.inspectionimages
            if (this.inspectionimages) this.listenTo(this.inspectionimages, 'sync', this.render, this)
            
            this.hover = {}
            this.showImageStatus = this.getOption('showImageStatus')
            this.showSampleStatus = this.getOption('showSampleStatus')
            
            Backbone.Validation.bind(this, {
                collection: this.collection
            });
        },

        setInspectionImages: function(imgs) {
            this.inspectionimages = imgs
            this.showImageStatus = true
            if (this.inspectionimages) this.listenTo(this.inspectionimages, 'sync', this.render, this)
        },

        setShowSampleStatus: function(status) {
            this.showSampleStatus = status
            this.showImageStatus = !status
            this.drawPlate()
        },
        
        
        onDomRefresh: function() {
            this.canvas = this.$el[0]
            this.ctx = this.canvas.getContext('2d')
            
            this.canvas.width = this.$el.parent().width()
            if (this.pt.get('capacity') == this.pt.get('well_per_row')) this.canvas.height = this.canvas.width*0.20
            else this.canvas.height = this.canvas.width*0.68
            console.log('type', this.getOption('type'), this.canvas, this.ctx)
            this.pt.setGeometry(this.canvas.width, this.canvas.height)
            this.drawPlate()
            
            //$(document).unbind('keydown', this.keyPress)
            //$(document).bind('keydown', this.keyPress.bind(this))
            $(document).unbind('keydown').bind('keydown', this.keyPress.bind(this))
        },

        keyPress: function(e) {
            if ($(e.target).is('input') || $(e.target).is('select') || $(e.target).is('textarea')) return
                
            var current = this.collection.findWhere({ isSelected: true })
            var pos = parseInt(current.get('LOCATION'))
            
            if (e.which == 37) {
                e.preventDefault()
                pos--
                
            } else if (e.which == 39) {
                e.preventDefault()
                pos++
                
            } else if (e.which == 38) {
                e.preventDefault()
                pos -= this.pt.get('well_per_row')*this.pt.dropTotal()

            } else if (e.which == 40) {
                e.preventDefault()
                pos += this.pt.get('well_per_row')*this.pt.dropTotal()
            }
            
            var n = this.collection.findWhere({ LOCATION: pos.toString() })
            //console.log(pos, n)
            if (n) {
                n.set('isSelected', true)
                this.drawPlate()
            }
        },
        
        
        onDestroy: function() {
            console.log('destroy plate')
            //$(document).unbind('keydown', this.keyPress.bind(this))
            $(document).unbind('keydown')
        },
        
        setType: function(type) {
            this.pt = type
            this.pt.setGeometry(this.canvas.width, this.canvas.height)
            this.drawPlate()
        },
        
        
        
        // Draw plate
        drawPlate: function() {
            console.log('draw plate')
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
          
            // Plate labels
            for (var x = 0; x < this.pt.get('well_per_row'); x++) {
                this.ctx.fillStyle = '#000000'
                this.ctx.font = (this.canvas.width > 500 ? 18 : 14) +"px Arial"
                this.ctx.lineWidth = 1
                this.ctx.fillText(x+1,this.pt.get('offset_x')+x*(this.pt.get('well_width')+this.pt.get('well_pad')),20);
            }
          
          
            for (var y = 0; y < this.pt.wellTotal()/this.pt.get('well_per_row'); y++) {
                this.ctx.fillStyle = '#000'
                this.ctx.font = (this.canvas.width > 500 ? 18 : 14) +"px Arial"
                this.ctx.lineWidth = 1
                var off = this.canvas.width > 500 ? 26 : 15
                this.ctx.fillText(String.fromCharCode(y+65),0,off+this.pt.get('offset_y')+y*(this.pt.get('well_height')+this.pt.get('well_pad')));
            }
          
            for (var i = 0; i < this.pt.wellTotal(); i++) {
                var row = i % this.pt.get('well_per_row')
                var col = Math.floor(i / this.pt.get('well_per_row'))
            
                this.ctx.beginPath()
                this.ctx.strokeStyle = '#000'
                this.ctx.rect(this.pt.get('offset_x')+row*(this.pt.get('well_width')+this.pt.get('well_pad')), this.pt.get('offset_y')+col*(this.pt.get('well_height')+this.pt.get('well_pad')), this.pt.get('well_width'), this.pt.get('well_height'))
            
                this.ctx.lineWidth = 1;            
                this.ctx.strokeStyle = '#000'
                this.ctx.stroke()
                
                for (var j = 0; j < this.pt.get('drop_per_well_x'); j++) {
                    for (var k = 0; k < this.pt.get('drop_per_well_y'); k++) {
                        var did = (k*this.pt.get('drop_per_well_x'))+j
                        if (this.pt.get('well_drop') > -1) {
                            if (did == this.pt.get('well_drop')) continue
                                if (did > this.pt.get('well_drop')) did--;
                        }
        
                        var sampleid = i*this.pt.dropTotal()+did+1
                        var sample = this.collection.findWhere({ LOCATION: sampleid.toString() })

                        if (sample && this.showImageStatus && this.inspectionimages) var im = this.inspectionimages.findWhere({ BLSAMPLEID: sample.get('BLSAMPLEID') })
                        else var im = null
                        
                        this.ctx.beginPath()
                        this.ctx.lineWidth = 1;
                        if (sample && sample.get('isSelected')) {
                            this.ctx.strokeStyle = 'cyan'
                            
                        } else if (sample && sample.get('PROTEINID') > -1) {
                            if (this.showImageStatus) {
                                if (im) {
                                    if (im.urlFor('full') in app.imagecache) this.ctx.strokeStyle = '#000'
                                    else this.ctx.strokeStyle = '#aaa'
                                } else this.ctx.strokeStyle = '#ddd'

                            } else this.ctx.strokeStyle = '#000'

                        } else this.ctx.strokeStyle = '#ddd'
          
                        this.ctx.rect(this.pt.get('drop_offset_x')+this.pt.get('offset_x')+row*(this.pt.get('well_width')+this.pt.get('well_pad'))+(j*this.pt.get('drop_widthpx')+this.pt.get('drop_pad')), this.pt.get('drop_offset_y')+this.pt.get('offset_y')+col*(this.pt.get('well_height')+this.pt.get('well_pad'))+(k*this.pt.get('drop_heightpx')+this.pt.get('drop_pad')), this.pt.get('drop_widthpx'), this.pt.get('drop_heightpx'))
                            

                        // Highlight Hovered Sample
                        if (this.hover == sampleid) {
                            this.ctx.fillStyle = '#cccccc'
                            this.ctx.fill()
                        }

                        // Highlight Selected Sample
                        if (sample && sample.get('isSelected')) {
                            this.ctx.fillStyle = '#dddddd'
                            this.ctx.fill()
                        }

                        // Show if drop is valid
                        if (sample && this.getOption('showValid')) {
                            if (sample.get('PROTEINID') > -1 || sample.get('CRYSTALID') > -1) {
                                this.ctx.fillStyle = sample.isValid(true) ? '#82d180' : '#f26c4f'
                                this.ctx.fill()
                            }
                        }
                        
                        // Show status
                        if (sample && this.showSampleStatus) {
                            var colors = {
                                GR: '#fdfd96',
                                SC: '#fdfd96',
                                AI: '#ffb347',
                                DC: '#87ceeb',
                                AP: '#77dd77',
                            }
                            
                            var hasStatus = false
                            _.each(colors, function(v,t) {
                                if (sample.get(t) > 0) {
                                    this.ctx.fillStyle = v
                                    hasStatus = true
                                }
                            }, this)
                            if (hasStatus) this.ctx.fill()
                        }

                        // Show image score
                        if (sample && this.showImageStatus) {
                            if (im) {
                                var isc = im.get('SCORECOLOUR')
                                if (isc){
                                    this.ctx.fillStyle = isc
                                    this.ctx.fill()  
                                } 
                            }

                        }
                        
                        this.ctx.stroke()
          
                        // Sample number
                        if (this.canvas.width > 400 && sample && sample.get('PROTEINID') > -1) {
                            this.ctx.fillStyle = '#000'
                            this.ctx.font = "8px Arial"
                            this.ctx.lineWidth = 1
                            this.ctx.fillText(sampleid,this.pt.get('drop_offset_x')+2+this.pt.get('offset_x')+row*(this.pt.get('well_width')+this.pt.get('well_pad'))+(j*this.pt.get('drop_widthpx')+this.pt.get('drop_pad')), this.pt.get('drop_offset_y')+10+this.pt.get('offset_y')+col*(this.pt.get('well_height')+this.pt.get('well_pad'))+(k*this.pt.get('drop_heightpx')+this.pt.get('drop_pad')));
                        }
                    }
                }
            }
        },
        
        
        
        // Convert xy position to sample id
         _xy_to_drop: function(cur) {
            var x = Math.floor((cur[0] - this.pt.get('offset_x'))/(this.pt.get('well_width')+this.pt.get('well_pad')))
            var y = Math.floor((cur[1] - this.pt.get('offset_y'))/(this.pt.get('well_height')+this.pt.get('well_pad')))
        
            var wox = cur[0] - this.pt.get('drop_offset_x') - this.pt.get('offset_x') - this.pt.get('drop_pad') - x*(this.pt.get('well_width')+this.pt.get('well_pad'))
            var woy = cur[1] - this.pt.get('drop_offset_y') - this.pt.get('offset_y') - this.pt.get('drop_pad') - y*(this.pt.get('well_height')+this.pt.get('well_pad'))
        
            if (wox > 0 && wox < this.pt.get('drop_per_well_x')*this.pt.get('drop_widthpx') && woy > 0 && woy < this.pt.get('drop_per_well_y')*this.pt.get('drop_heightpx')) {
                var dx = Math.floor(wox / this.pt.get('drop_widthpx'))
                var dy = Math.floor(woy / this.pt.get('drop_heightpx'))
                var did = dy*this.pt.get('drop_per_well_x')+dx
            
                if (this.pt.get('well_drop') != did) {
                    // skip over drop that is well
                    if (this.pt.get('well_drop') > -1 && did > this.pt.get('well_drop')) did--
                
                    if (did < this.pt.dropTotal()) {
                        return did + (x+y*this.pt.get('well_per_row'))*this.pt.dropTotal() + 1
                    }
                }
            }
        }
        
        
    })

})