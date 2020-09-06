define(['marionette', 
    'views/dialog',
    'views/tabs', 
    'modules/dc/views/distl', 
    'modules/dc/views/autoindexing', 
    'modules/dc/views/autointegration', 
    'modules/dc/views/downstream',
    'utils/editable',
    'backbone',
    'modules/dc/views/imagestatusitem',
    'modules/dc/views/apstatusitem',
    'modules/dc/views/apmessagestatusitem',
    'modules/dc/views/apmessages',
    'modules/dc/views/reprocess2',
    'modules/dc/views/dcbase',
    'templates/dc/dc.html', 'backbone-validation'], function(Marionette, 
      DialogView, TabView, DCDISTLView, 
      DCAutoIndexingView, DCAutoIntegrationView, DCDownstreamView, 
      Editable, Backbone, 
      DCImageStatusItem, APStatusItem, APMessageStatusItem, APMessagesView,
      ReprocessView,
      DCBase,
      template) {


  return DCView = DCBase.extend({
    template: template,
    plotView: DCDISTLView,
    imageStatusItem: DCImageStatusItem,
    apStatusItem: APStatusItem,
    apMessageStatusItem: APMessageStatusItem,

    extraButtons: Marionette.ItemView.extend({
      template: _.template('<% if (ARCHIVED == "0") { %>\
        <a href="#" class="reprocess button button-notext" title="Reprocess"><i class="fa fa-cog"></i> <span>Reprocess</span></a>\
      <% } %>\
      <span class="message-holder"></span>')
    }),


    initialize: function(options) {
      this.strat = null
      this.ap = null
      this.dp = null
    },
      
    onShow: function() {
      // element not always available at this point?
      var w = 0.175*$(window).width()*0.95
      var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
      this.$el.find('.distl,.diffraction,.snapshots', this.$el).height(h*0.8)
        
      //var w = 0.175*this.$el.width()
      //var h = $(window).width() > 800 ? w : (w*1.65)
      //this.$el.find('.distl,.diffraction,.snapshots').height(h)
        
      if (this.getOption('plotView')) this.plotview = new (this.getOption('plotView'))({ parent: this.model, el: this.$el.find('.distl') })

      Backbone.Validation.unbind(this)
      Backbone.Validation.bind(this)
      // var edit = new Editable({ model: this.model, el: this.$el })
      // edit.create('COMMENTS', 'text')
        
      this.imagestatus = new (this.getOption('imageStatusItem'))({ ID: this.model.get('ID'), TYPE: this.model.get('DCT'), statuses: this.getOption('imagestatuses'), el: this.$el })
      this.apstatus = new (this.getOption('apStatusItem'))({ ID: this.model.get('ID'), SCREEN: (this.model.get('OVERLAP') != 0 && this.model.get('AXISRANGE')), statuses: this.getOption('apstatuses'), el: this.$el })
      this.listenTo(this.apstatus, 'status', this.updateAP, this)
      this.apmessagestatus = new (this.getOption('apMessageStatusItem'))({ ID: this.model.get('ID'), statuses: this.getOption('apmessagestatuses'), el: this.$el })

      this.updateInPlace(true)
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
      
    events: {
      'click .holder h1.strat': 'loadStrategies',
      'click .holder h1.ap': 'loadAP',
      'click .holder h1.dp': 'loadDP',
      'click .distl': 'showDistl',
      'click .diffraction': 'diViewer',
      'click a.dl': 'showDistl',
      'click @ui.rp': 'reprocess',
      'click a.messages': 'showMessages',
    },
      
    ui: {
      rp: 'a.reprocess',
    },

    showMessages: function(e) {
        e.preventDefault()

        var d = []
        if (this.model.get('DCC') > 1) d.dcg = this.model.get('DCG')
        else d.id = this.model.get('ID')

        app.dialog.show(new DialogView({ 
            title: 'Processing Messages', 
            view: new APMessagesView(d)
        }))
    },

    reprocess: function(e) {
        e.preventDefault()

        if (app.dialog.currentView instanceof ReprocessView) app.dialog.currentView.collection.add(this.model)
        else app.dialog.show(new ReprocessView({ model: this.model, visit: this.getOption('visit') }))
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
    
    loadStrategies: function(e) {
      if (!this.strat) {
        this.strat = new DCAutoIndexingView({ id: this.model.get('ID') , el: this.$el.find('div.strategies', this.$el) })
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