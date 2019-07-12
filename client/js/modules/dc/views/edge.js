define(['marionette', 'backbone', 'modules/dc/views/edgeplot', 'modules/projects/views/addto', 'utils/editable', 'templates/dc/edge.html', 'backbone-validation'], function(Marionette, Backbone, EdgeView, AddToProjectView, Editable, template) {

  return Marionette.ItemView.extend({
    template: template,
    plotView: EdgeView,
    
      
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
    },
      
    flag: function(e) {
        e.preventDefault()
        this.model.flag()
    },
      
    addToProject: function(e) {
        e.preventDefault()
        app.dialog.show(new AddToProjectView({ name: this.model.get('DIR')+' Edge Scan', type: 'edge', iid: this.model.get('ID') }))
    },
      
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