define(['marionette', 'backbone', 'modules/dc/views/edgeplot', 'modules/projects/views/addto', 'utils/editable', 
  'modules/dc/views/dcbase',
  'templates/dc/edge.html', 'backbone-validation'], function(Marionette, Backbone, EdgeView, AddToProjectView, Editable, 
    DCBase,
    template) {

  return DCBase.extend({
    template: template,
    plotView: EdgeView,
    
    onShow: function() {
      this.edgeview  = new (this.getOption('plotView'))({ id: this.model.get('ID'), el: $('.edge', this.$el) })
        
      Backbone.Validation.unbind(this)
      Backbone.Validation.bind(this)
      var edit = new Editable({ model: this.model, el: this.$el })
      edit.create('COMMENTS', 'text')
    },
                                      
    onDestroy: function() {
      this.edgeview.destroy()
    },
  })
       
})