define(['marionette', 'utils', 'utils/canvas', 'jquery', 'backbone', 'backbone-validation',
], function(Marionette, utils, CanvasUtils, $, Backbone) {
       
    /* 
     Puck Canvas Object
     - mixin CanvasUtils
    */
    return Marionette.ItemView.extend(_.extend({}, CanvasUtils, Backbone.Validation.mixin, {
    tagName: 'canvas',
    template: false,
    collectionEvents: { 'sync reset change add delete': 'onRender' },
      
    centres: [
        [150,100],
        [101,136],
        [120,193],
        [180,192],
        [198,135],
        [150, 40],
        [90, 59],
        [49, 105],
        [40, 168],
        [65, 224],
        [119, 256],
        [181, 257],
        [234, 224],
        [259, 167],
        [251, 105],
        [210, 59],
    ],
        
    events: {
      'click': 'selectPosition',
      'mousemove': 'hoverPosition',
    },
      
    initialize: function(options) {
        var self = this
        this.hover = null
        this.selected = null
        
        this.puck = new Image()
        
        this.puck.src = app.appurl+'/assets/images/puck.png'
        this.puck.onload = function() {
            self._draw()
            console.log('puck loaded')
        }
        
        this.on('sample:selected', this.sampleSelected, this)
        this.on('sample:hover', this.sampleHover, this)
    },
            
    sampleSelected: function(pos){
        this.selected = pos
        this._draw()
    },

    sampleHover: function(pos){
        this.hover = pos
        this._draw()
    },
            
    onDomRefresh: function() {
        this.setup()
        
        this.canvas.width = this.$el.parent().width()
        this.canvas.height = this.$el.parent().width()
        
        this.scale = this.canvas.width/300;
        
        this._draw()
    },
      
    onRender: function() {
        console.log('render puck')
        if (this.ctx) this._draw()
    },
        
      
    selectPosition: function(e) {
        var cur = utils.get_xy(e, this.$el)
        this.selected = this._get_position(cur)
        this.trigger('sample:selected', this.selected)

        var sel = this.collection.findWhere({ LOCATION: (this.selected+1).toString() })
        if (sel) sel.set('isSelected', true)
        
        this._draw()
    },
      
      
    hoverPosition: function(e) {
        var cur = utils.get_xy(e, this.$el)
        this.hover = this._get_position(cur)
        this.trigger('sample:hover', this.hover)
        
        this._draw()
    },
        
        
    _get_position: function(cur) {
        var pos = null
        _.each(this.centres, function(c,i) {
            var r = 30*this.scale
            var minx = c[0]*this.scale - r
            var maxx = c[0]*this.scale + r
            var miny = c[1]*this.scale - r
            var maxy = c[1]*this.scale + r

            if (cur[0] < maxx && cur[0] > minx && cur[1] < maxy && cur[1] > miny) {
                pos = i
            }
        }, this)
        
        return pos
    },
      
        
    _draw_positions: function(size) {
      _.each(_.range(size), function(i) {
        var m = this.collection.findWhere({ LOCATION: (i+1).toString() })
          
        if (m && m.get('PROTEINID') > -1) this.circle(this.centres[i][0]*this.scale, this.centres[i][1]*this.scale, 28*this.scale, m.isValid(true) ? '#82d180' : '#f26c4f')
        
        if (i == this.selected) this.circle(this.centres[i][0]*this.scale, this.centres[i][1]*this.scale, 23*this.scale, 'grey', true)
        
      }, this)
  
      if (this.hover !== null) {
        this.circle(this.centres[this.hover][0]*this.scale, this.centres[this.hover][1]*this.scale, 23*this.scale, 'grey', true)
      }
    },
      
      
    _draw: function() {
        console.log('draw puck')
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this._draw_positions(this.centres.length)
        this.ctx.drawImage(this.puck, 0, 0, this.canvas.width, this.canvas.height)
    },
      
  }))
       
})