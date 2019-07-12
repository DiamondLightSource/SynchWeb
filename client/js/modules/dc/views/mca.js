define(['marionette', 'backbone', 'modules/dc/views/mcaplot', 'modules/projects/views/addto', 'utils/editable', 'templates/dc/mca.html', 'backbone-validation'], function(Marionette, Backbone, MCAView, AddToProjectView, Editable, template) {

  return Marionette.ItemView.extend({
    template: template,
    plotView: MCAView,
      
    fullPath: false,
      
    modelEvents: {
        'change': 'renderFlag',
    },
      
    renderFlag: function() {
      this.model.get('FLAG') ? this.$el.find('.flag').addClass('button-highlight') : this.$el.find('.flag').removeClass('button-highlight')
      this.$el.find('.COMMENTS').text(this.model.get('COMMENTS'))
    },

    ui: {
      temp: 'span.temp',
      exp: 'i.expand',
    },
      
      
    events: {
      'click .atp': 'addToProject',
      'click .flag': 'flag',
      'click @ui.exp': 'expandPath',
    },

    expandPath: function(e) {
        e.preventDefault()

        this.ui.temp.text(this.fullPath ? this.model.get('DIR') : this.model.get('DIRFULL'))
        this.ui.exp.toggleClass('fa-caret-right')
        this.ui.exp.toggleClass('fa-caret-left')
        
        this.fullPath = !this.fullPath
    },
      
    flag: function(e) {
        e.preventDefault()
        this.model.flag()
    },
      
    addToProject: function(e) {
        e.preventDefault()
        app.dialog.show(new AddToProjectView({ name: 'Fluorescence Spectrum', type: 'mca', iid: this.model.get('ID') }))
    },
      
    onShow: function() {
      this.mcaview  = new (this.getOption('plotView'))({ id: this.model.get('ID'), el: $('.mca', this.$el) })
        
      Backbone.Validation.unbind(this)
      Backbone.Validation.bind(this)
      var edit = new Editable({ model: this.model, el: this.$el })
      edit.create('COMMENTS', 'text')
    },
                                      
    onDestroy: function() {
      this.mcaview.destroy()
    },
  })
       
})