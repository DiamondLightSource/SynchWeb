define(['marionette', 'collections/pvs'], function(Marionette, PVs) {


  const PVStreamItemView = Marionette.ItemView.extend({
    template: _.template(`<h1 class="tw-font-bold"><%- NAME %></h1> <p class="tw-text-xs"><%= FORMATTEDVALUE  %></p>`),
    templateHelpers: function() {
      return {
        FORMATTEDVALUE: this.model.get('VALUE').replace(/\\n/g, '<br />')
      }
    },
    className: function() {
      return 'tw-w-full pv tw-my-4 tw-p-3 tw-rounded ' + this.model.get('CLASS')
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