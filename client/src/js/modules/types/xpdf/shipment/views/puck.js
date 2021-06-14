define(['modules/shipment/views/puck'
], function(Puck){

    return Puck.extend({

        centres: [
            [337,337],
            [255,235],
            [366,210],
            [455,280],
            [455,394],
            [366,464],
            [256,439],
            [207,337],
            [337,76],
            [450,102],
            [542,174],
            [592,279],
            [592,395],
            [542,500],
            [451,573],
            [338,598],
            [223,573],
            [133,500],
            [82,396],
            [82,279],
            [132,174],
            [223,102]
        ],

        initialize: function(options) {
            var self = this
            this.hover = null
            this.selected = null
            
            this.puck = new Image()
            
            this.puck.src = app.appurl+'/assets/images/xpdf_puck.png'
            this.puck.onload = function() {
                self._draw()
                console.log('puck loaded')
            }
            
            this.on('sample:selected', this.sampleSelected, this)
            this.on('sample:hover', this.sampleHover, this)
        },

        onDomRefresh: function() {
            this.setup()
            
            this.canvas.width = this.$el.parent().width()
            this.canvas.height = this.$el.parent().width()
            
            this.scale = this.canvas.width/675;
            
            this._draw()
        },
    })
})