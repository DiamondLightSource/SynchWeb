define(['marionette', 'backbone', 'modules/dc/views/mcaplot', 'modules/projects/views/addto', 'utils/editable', 'tpl!templates/dc/mca.html', 'backbone-validation'], function(Marionette, Backbone, MCAView, AddToProjectView, Editable, template) {

  return Marionette.ItemView.extend({
    template: template,
    plotView: MCAView,
      
      
    modelEvents: {
        'change': 'renderFlag',
    },
      
    renderFlag: function() {
      this.model.get('FLAG') ? this.$el.find('.flag').addClass('button-highlight') : this.$el.find('.flag').removeClass('button-highlight')
      this.$el.find('.COMMENTS').html(this.model.get('COMMENTS'))
    },
      
      
    events: {
      'click .atp': 'addToProject',
      'click .flag': 'flag',
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