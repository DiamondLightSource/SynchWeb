define([], function() {

    return {
     
        // Draw a circle
        circle: function(x,y,r,c,line) {
            this.ctx.beginPath()
            this.ctx.arc(x,y,r, 0, 2*Math.PI, false)
            if (line) {
                this.ctx.lineWidth = 2
                this.ctx.strokeStyle = c;
                this.ctx.stroke()
            } else {
                this.ctx.fillStyle = c
                this.ctx.fill()
            }
        },
        
        
        // Setup some defaults in the instance
        setup: function() {
            this.canvas = this.$el[0]
            this.ctx = this.canvas.getContext('2d')
        }
        
    }

})