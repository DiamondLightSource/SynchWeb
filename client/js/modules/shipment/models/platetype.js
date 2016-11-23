define(['backbone'], function(Backbone) {
    
    return Backbone.Model.extend({
        idAttribute: 'platetypeid',
        urlRoot: '/plates/types',
        
        dropTotal: function() {
            return this.get('drop_per_well_x') * this.get('drop_per_well_y') - (this.get('well_drop') > -1 ? 1 : 0)
        },
        
        wellTotal: function() {
            return this.get('capacity') / this.dropTotal()
        },

        getWell: function(pos) {
            return Math.floor( (parseInt(pos)-1) / this.dropTotal() )
        },
        
        getName: function(pos) {
            var p = this.getRowColDrop(pos)
            return String.fromCharCode(p.row+65)+(p.col+1)
        },

        getDrop: function(pos) {
            return ((pos-1) % this.dropTotal())+1
        },

        getRowColDrop: function(pos) {
            var wellpos = Math.floor((parseInt(pos)-1) / this.dropTotal())
            var drop = ((pos-1) % this.dropTotal())+1
            
            var col = wellpos % this.get('well_per_row')
            var row = Math.floor(wellpos / this.get('well_per_row'))
            
            return { row: row, col: col, drop: drop, pos: pos }
        },
        
        calcParams: function() {
            this.set('well_pad', this.width / 130)
            this.set('drop_pad', this.width / 130)
            //console.log('well_pad', this.get('well_pad'), 'drop_pad', this.get('drop_pad'))
            
            this.set('well_width', ((this.width-this.get('offset_x')) / this.get('well_per_row')) - this.get('well_pad'))
            // this.set('well_height', ((this.width*(1/1.5))-this.get('offset_y')) / (this.get('capacity')/(this.get('well_per_row')*this.dropTotal())) - this.get('well_pad'))
            this.set('well_height', (this.height-this.get('offset_y')) / (this.get('capacity')/(this.get('well_per_row')*this.dropTotal())) - this.get('well_pad'))
            
            this.set('drop_widthpx', (this.get('well_width')-this.get('drop_pad')*2) / (this.get('drop_per_well_x') / this.get('drop_width')))
            this.set('drop_heightpx', (this.get('well_height')-this.get('drop_pad')*2) / (this.get('drop_per_well_y') / this.get('drop_height')))
            
            this.set('drop_offset_x', this.get('drop_offset_x')*(this.get('well_width')-this.get('drop_pad')*2))
            this.set('drop_offset_y', this.get('drop_offset_y')*(this.get('well_height')-this.get('drop_pad')*2))
        },
        
        setGeometry: function(width, height, ofx, ofy) {
            this.width = width
            this.height = height
            this.set('offset_x', ofx || 25)
            this.set('offset_y', ofy || 25)
            
            this.calcParams()
        },
        
    })
    
})
