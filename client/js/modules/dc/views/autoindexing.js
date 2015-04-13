define(['marionette', 'modules/dc/collections/autoindexings', 'tpl!templates/dc/dc_strategy.html'], function(Marionette, AutoIndexings, template) {
       
  var AutoIndexingItem = Marionette.ItemView.extend({ template: template, modelEvents: { 'change': 'render' } })
       
  var EmptyStrategies = Marionette.ItemView.extend({ template: '<div>No strategies available for this data collection</div>' })
       
  return Marionette.CollectionView.extend({
    childView: AutoIndexingItem,
       
    emptyView: EmptyStrategies,
                                          
    initialize: function(options) {
      var self = this
      this.collection = new AutoIndexings(null, { id: options.id })
      this.collection.fetch().done(function() { self.$el.slideDown() } )
    },

  })
       
})