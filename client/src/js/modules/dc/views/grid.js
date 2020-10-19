define(['marionette', 
    'modules/dc/views/dcbase',
    'views/tabs', 
    'modules/projects/views/addto',
    'utils/editable',
    'backbone',
    'modules/dc/views/imageviewer',
    'modules/dc/views/gridplot',
    'views/dialog',
    'modules/dc/views/dccomments', 
    'modules/dc/views/attachments',
    'modules/dc/views/apstatusitem',
    'modules/dc/models/gridxrc',
    'templates/dc/grid.html', 'backbone-validation'], 
    function(Marionette, DCBase, TabView, AddToProjectView, Editable, Backbone, ImageViewer, GridPlot, 
      DialogView, DCCommentsView, AttachmentsView, APStatusItem, GridXRC,
      template) {

  return DCBase.extend({
    template: template,

    apStatusItem: APStatusItem,

    events: {
      'click @ui.zoom': 'toggleZoom'
    },

    ui: {
      di: 'div.diviewer',
      im: 'div.image',

      x: '.x',
      y: '.y',
      z: '.z',
      val: '.val',
      img: '.img',
      bx: '.boxx',
      by: '.boxy',
      zoom: 'a.zoom',

      holder: '.holder h1',
    },

    toggleZoom: function(e) {
      e.preventDefault()

      var i = this.ui.zoom.find('i')
      var s = this.ui.zoom.find('span')
      if (i.hasClass('fa-search-plus')) {
        this.ui.di.height(this.ui.di.height()*2)
        this.ui.im.height(this.ui.im.height()*2)
        i.removeClass('fa-search-plus').addClass('fa-search-minus')
        s.text('Shrink')

      } else {
        this.ui.di.height(this.ui.di.height()/2)
        this.ui.im.height(this.ui.im.height()/2)
        i.removeClass('fa-search-minus').addClass('fa-search-plus')
        s.text('Expand')
      }
      this.onDomRefresh()
    },


    initialize: function(options) {
      this.xrc = null
      this.hasXRC = false

      this.gridplot = new GridPlot({ BL: this.model.get('BL'), ID: this.model.get('ID'), NUMIMG: this.model.get('NUMIMG'), parent: this.model, imagestatuses: this.getOption('imagestatuses') })
      this.listenTo(this.gridplot, 'current', this.loadImage, this)
    },

    // should be an event
    loadImage: function(number, x, y, z, val) {
      console.log('set currnet', arguments)
      this.diviewer.change(number+1)

      this.ui.x.text(x)
      this.ui.y.text(y)
      this.ui.z.text(z)
      this.ui.val.text(val)
      this.ui.img.text(number+1)
    },
      

    onShow: function() {
      this.ui.holder.hide()
      this.ui.zoom.hide()

      this.diviewer = new ImageViewer({ model: this.model, embed: true, readyText: 'Click on the grid to load a diffraction image' })      
      this.ui.di.append(this.diviewer.render().$el)
      this.ui.im.append(this.gridplot.render().$el)

      Backbone.Validation.unbind(this)
      Backbone.Validation.bind(this)
      // var edit = new Editable({ model: this.model, el: this.$el })
      // edit.create('COMMENTS', 'text')
        
      this.gridplot.gridPromise().done(this.showBox.bind(this))
      this.apstatus = new (this.getOption('apStatusItem'))({ ID: this.model.get('ID'), XRC: true, statuses: this.getOption('apstatuses'), el: this.$el })
      this.listenTo(this.apstatus, 'model:change', this.checkXRC)

      this.updateInPlace(true)
    },


    showBox: function() {
        var gi = this.gridplot.gridInfo()
        if (this.ui.bx.text) this.ui.bx.text((gi.get('DX_MM')*1000).toFixed(0))
        if (this.ui.bx.text) this.ui.by.text((gi.get('DY_MM')*1000).toFixed(0))

        if (gi.get('STEPS_Y') > 10 && this.ui.zoom.show) this.ui.zoom.show()
    },

    checkXRC: function() {
        if (!this.xrc) {
            var state = this.apstatus.getStatus({ type: 'XrayCentring' })
            console.log('xrc state', state)
            if (state >= 1 && !this.hasXRC) {
                this.ui.holder.show()
                this.hasXRC = true
            }

            if (state == 2) {
                this.xrc = new GridXRC({ id: this.model.get('ID') })
                this.xrc.fetch({
                    success: this.showXRC.bind(this)
                })
            }
        }
    },

    showXRC: function() {
        this.ui.holder.prepend('Method: '+this.xrc.get('METHOD')+' - X Pos: '+this.xrc.get('X')+' Y Pos: '+this.xrc.get('Y'))
    },
                                      
    onDestroy: function() {
        this.diviewer.destroy()
        this.gridplot.destroy()
    },

    onDomRefresh: function() {
      this.diviewer.triggerMethod('dom:refresh')
      this.gridplot.triggerMethod('dom:refresh')
    },
 
  })

})