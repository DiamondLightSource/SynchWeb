define(['marionette', 
  'modules/dc/collections/autoindexings', 
  'tpl!templates/dc/dc_strategy.html',
  'tpl!templates/dc/dc_xoalign.html',
  ], function(Marionette, AutoIndexings, template, xotemplate) {
       
  var AutoIndexingItem = Marionette.ItemView.extend({ 
      // template: template, 
      modelEvents: { 'change': 'render' },

      getTemplate: function(m) {
        console.log('st type', this.model.get('TYPE'), this.model.get('TYPE') == 'XOAlign')
          return this.model.get('TYPE') == 'XOAlign' ? xotemplate : template
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

  })
       
})