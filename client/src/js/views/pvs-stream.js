define(['marionette', 'collections/pvs'], function(Marionette, PVs) {


  const PVStreamItemView = Marionette.ItemView.extend({
    template: _.template(`<h1><%- NAME %></h1> <p><%- VALUE %></p>`),
    className: function() {
      return 'tw-w-full pv ' + this.model.get('CLASS')
    },

    modelEvents: {
      'change': 'render',
    },
  })


  return Marionette.CollectionView.extend({
    childView: PVStreamItemView,

    initialize: function(options) {
      this.collection = new PVs(null, { bl: options.bl, mmsg: 1 })
      this.collection.fetch()
    },

    onDestroy: function() {
      this.collection.stop()
    }
  })


})