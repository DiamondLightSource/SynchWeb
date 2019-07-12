define(['marionette', 
  'modules/dc/collections/autoindexings', 
  'templates/dc/dc_strategy.html',
  'templates/dc/dc_xoalign.html',
  ], function(Marionette, AutoIndexings, template, xotemplate) {
       
  var AutoIndexingItem = Marionette.ItemView.extend({ 
      modelEvents: { 'change': 'render' },

      getTemplate: function(m) {
          return (this.model.get('TYPE') == 'XOalign' || this.model.get('TYPE') == 'dials.align_crystal') ? xotemplate : template
      }
  })
       
  var EmptyStrategies = Marionette.ItemView.extend({ template: '<div>No strategies available for this data collection</div>' })
       
  return Marionette.CollectionView.extend({
    childView: AutoIndexingItem,
       
    emptyView: EmptyStrategies,
                                          
    initialize: function(options) {
      var self = this
      this.collection = new AutoIndexings(null, { id: options.id })
      this.collection.fetch().done(function() { self.$el.slideDown() } )
    },

    fetch: function() {
      this.collection.fetch()
    },

  })
       
})