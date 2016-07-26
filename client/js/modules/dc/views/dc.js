define(['marionette', 'views/tabs', 'modules/dc/views/dccomments', 'modules/dc/views/distl', 'modules/dc/views/autoindexing', 'modules/dc/views/autointegration', 'modules/dc/views/downstream',
    'modules/projects/views/addto',
    'utils/editable',
    'backbone',
    'modules/dc/views/imagestatusitem',
    'modules/dc/views/apstatusitem',
    'modules/dc/views/reprocess',
    'tpl!templates/dc/dc.html', 'backbone-validation'], function(Marionette, TabView, DCCommentsView, DCDISTLView, DCAutoIndexingView, DCAutoIntegrationView, DCDownstreamView, AddToProjectView, Editable, Backbone, DCImageStatusItem, APStatusItem, 
      ReprocessView,
      template) {

  return Marionette.ItemView.extend({
    template: template,
    plotView: DCDISTLView,
    imageStatusItem: DCImageStatusItem,
    apStatusItem: APStatusItem,

    initialize: function(options) {
      this.strat = null
      this.ap = null
      this.dp = null

      this.fullPath = false
    },
      
    onShow: function() {
      // element not always available at this point?
      var w = 0.175*$(window).width()*0.95
      var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
      $('.distl,.diffraction,.snapshots', this.$el).height(h*0.8)
        
      //var w = 0.175*this.$el.width()
      //var h = $(window).width() > 800 ? w : (w*1.65)
      //this.$el.find('.distl,.diffraction,.snapshots').height(h)
        
      if (this.getOption('plotView')) this.plotview = new (this.getOption('plotView'))({ parent: this.model, el: this.$el.find('.distl') })

      Backbone.Validation.unbind(this)
      Backbone.Validation.bind(this)
      var edit = new Editable({ model: this.model, el: this.$el })
      edit.create('COMMENTS', 'text')
        
      this.imagestatus = new (this.getOption('imageStatusItem'))({ ID: this.model.get('ID'), TYPE: this.model.get('DCT'), statuses: this.getOption('imagestatuses'), el: this.$el })
      this.apstatus = new (this.getOption('apStatusItem'))({ ID: this.model.get('ID'), SCREEN: (this.model.get('OVERLAP') != 0 && this.model.get('AXISRANGE')), statuses: this.getOption('apstatuses'), el: this.$el })
      this.listenTo(this.apstatus, 'status', this.updateAP, this)

    },

    updateAP: function(e) {
        setTimeout(this.doUpdateAP.bind(this), 1000)
    },

    doUpdateAP: function() {
        if (this.ap) this.ap.fetch()
        if (this.strat) this.strat.fetch()
        if (this.dp) this.dp.fetch()
    },
                                      
    onDestroy: function() {
      if (this.getOption('plotView')) this.plotview.destroy()
      if (this.strat) this.strat.destroy()
      if (this.ap) this.ap.destroy()
          
      this.imagestatus.destroy()
      this.apstatus.destroy()
    },
      
    modelEvents: {
        'change': 'renderFlag',
    },
      
    renderFlag: function() {
      this.model.get('FLAG') ? this.$el.find('.flag').addClass('button-highlight') : this.$el.find('.flag').removeClass('button-highlight')
      this.$el.find('.COMMENTS').html(this.model.get('COMMENTS'))

      this.ui.cc.html(this.model.get('DCCC'))
    },
      
    events: {
      'click .holder h1.strat': 'loadStrategies',
      'click .holder h1.ap': 'loadAP',
      'click .holder h1.dp': 'loadDP',
      'click .distl': 'showDistl',
      'click .diffraction': 'diViewer',
      'click .atp': 'addToProject',
      'click .flag': 'flag',
      'click .comments': 'showComments',
      'click a.dl': 'showDistl',
      'click a.sn': 'showSnapshots',
      'click li.sample a': 'setProposal',
      'click @ui.exp': 'expandPath',
      'click a.reprocess': 'reprocess',
    },
      
    ui: {
      temp: 'span.temp',
      exp: 'i.expand',
      cc: '.dcc',
    },

    reprocess: function(e) {
        e.preventDefault()
        app.dialog.show(new ReprocessView({ model: this.model, visit: this.getOption('visit') }))
    },

    expandPath: function(e) {
        e.preventDefault()

        this.ui.temp.html(this.fullPath ? (this.model.get('DIR')+this.model.get('FILETEMPLATE')) : (this.model.get('DIRFULL')+this.model.get('FILETEMPLATE')))
        this.ui.exp.toggleClass('fa-caret-right')
        this.ui.exp.toggleClass('fa-caret-left')
        
        this.fullPath = !this.fullPath
    },


    setProposal: function(e) {
        console.log('setting proposal', this.model.get('PROP'))
        if (this.model.get('PROP')) app.cookie(this.model.get('PROP'))
    },
      
      
    showSnapshots: function(e) {
        e.preventDefault()
        this.$el.find('.snapshots a').eq(0).trigger('click')
    },
      
    flag: function(e) {
        e.preventDefault()
        this.model.flag()
    },
      
      
    addToProject: function(e) {
        e.preventDefault()
        app.dialog.show(new AddToProjectView({ name: this.model.get('DIR')+this.model.get('FILETEMPLATE'), type: 'dc', iid: this.model.get('DCG') }))
    },
    
      
    diViewer: function() {
        var self = this
        require(['modules/dc/views/imageviewer'], function(ImageViewer) {
            app.dialog.show(new DialogView({ title: 'Diffraction Image Viewer', view: new ImageViewer({ model: self.model, dialog: true
            }) }))
        })
        
        return false
    },
      
      
    showDistl: function(e) {
      e.preventDefault()
      app.dialog.show(new DialogView({ title: 'DISTL Plot', view: new DCDISTLView({ parent: this.model }), autoSize: true }))
    },

    showComments: function(e) {
      e.preventDefault()
      app.dialog.show(new DialogView({ title: 'Data Collection Comments', view: new DCCommentsView({ model: this.model }), autoSize: true }))
    },
      
    
    loadStrategies: function(e) {
      if (!this.strat) {
        this.strat = new DCAutoIndexingView({ id: this.model.get('ID') , el: $('div.strategies', this.$el) })
        this.strat.render()
      } else this.strat.$el.slideToggle()
    },
                            
    loadAP: function(e) {
      if (!this.ap) {
        this.ap = new DCAutoIntegrationView({ id: this.model.get('ID'), el: this.$el.find('div.autoproc') })
      } else this.ap.$el.slideToggle()
    },
      
      
    loadDP: function(e) {
      if (!this.dp) {
        this.dp = new DCDownstreamView({ id: this.model.get('ID'), el: this.$el.find('div.downstream'), holderWidth: this.$el.find('.holder').width() })
      } else this.dp.$el.slideToggle()
    },
                                      
    /*render: function() {
      //console.log('changed atts', this.model.changedAttributes())
      //if (this.model.hasChanged('RUNSTATUS')) return
    },*/
  })

})