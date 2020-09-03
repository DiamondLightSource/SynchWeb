define(['marionette', 'backbone', 'modules/dc/views/mcaplot', 'modules/projects/views/addto', 'utils/editable', 
  'modules/dc/views/dcbase',
  'templates/dc/mca.html', 'backbone-validation'], function(Marionette, Backbone, MCAView, AddToProjectView, Editable, 
    DCBase,
    template) {

  return DCBase.extend({
    template: template,
    plotView: MCAView,
      
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
