define(['marionette', 'views/tabs', 
    'modules/projects/views/addto',
    'utils/editable',
    'backbone',
    'modules/dc/views/imageviewer',
    'modules/dc/views/gridplot',
    'tpl!templates/dc/grid.html', 'backbone-validation'], 
    function(Marionette, TabView, AddToProjectView, Editable, Backbone, ImageViewer, GridPlot, template) {

  return Marionette.ItemView.extend({
    template: template,

    ui: {
      temp: 'span.temp',
      exp: 'i.expand',
      di: 'div.diviewer',
      im: 'div.image',

      x: '.x',
      y: '.y',
      z: '.z',
      val: '.val',
      img: '.img',
      bx: '.boxx',
      by: '.boxy'
    },

    initialize: function(options) {
      this.fullPath = false

      this.gridplot = new GridPlot({ ID: this.model.get('ID'), NUMIMG: this.model.get('NUMIMG'), ST: this.model.get('ST'), imagestatuses: this.getOption('imagestatuses') })
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
      this.diviewer = new ImageViewer({ model: this.model, embed: true, readyText: 'Click on the grid to load a diffraction image' })      
      this.ui.di.append(this.diviewer.render().$el)
      this.ui.im.append(this.gridplot.render().$el)

      Backbone.Validation.unbind(this)
      Backbone.Validation.bind(this)
      var edit = new Editable({ model: this.model, el: this.$el })
      edit.create('COMMENTS', 'text')
        
      this.gridplot.gridPromise().done(this.showBox.bind(this))
    },


    showBox: function() {
        var gi = this.gridplot.gridInfo()
        this.ui.bx.text((gi.get('DX_MM')*1000).toFixed(0))
        this.ui.by.text((gi.get('DY_MM')*1000).toFixed(0))
    },
                                      
    onDestroy: function() {
        this.diviewer.destroy()
        this.gridplot.destroy()
    },

    onDomRefresh: function() {
      this.diviewer.triggerMethod('dom:refresh')
      this.gridplot.triggerMethod('dom:refresh')
    },  
      
    modelEvents: {
        'change': 'renderFlag',
    },
      
    renderFlag: function() {
      this.model.get('FLAG') ? this.$el.find('.flag').addClass('button-highlight') : this.$el.find('.flag').removeClass('button-highlight')
      this.$el.find('.COMMENTS').text(this.model.get('COMMENTS'))
    },
      
    events: {
      'click .atp': 'addToProject',
      'click .flag': 'flag',
      'click li.sample a': 'setProposal',
      'click @ui.exp': 'expandPath',
    },
      

    expandPath: function(e) {
        e.preventDefault()

        this.ui.temp.text(this.fullPath ? (this.model.get('DIR')+this.model.get('FILETEMPLATE')) : (this.model.get('DIRFULL')+this.model.get('FILETEMPLATE')))
        this.ui.exp.toggleClass('fa-caret-right')
        this.ui.exp.toggleClass('fa-caret-left')
        
        this.fullPath = !this.fullPath
    },


    setProposal: function(e) {
        console.log('setting proposal', this.model.get('PROP'))
        if (this.model.get('PROP')) app.cookie(this.model.get('PROP'))
    },
      

      
    flag: function(e) {
        e.preventDefault()
        this.model.flag()
    },
      
      
    addToProject: function(e) {
        e.preventDefault()
        app.dialog.show(new AddToProjectView({ name: this.model.get('DIR')+this.model.get('FILETEMPLATE'), type: 'dc', iid: this.model.get('DCG') }))
    },
      
  })

})