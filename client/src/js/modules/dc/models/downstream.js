define(['backbone'], function(Backbone){
       
  return Backbone.Model.extend({
    idAttribute: 'AID',

    initialize: function(options) {
      this.addTitle()
    },

    addTitle: function() {
      this.set({
        'TITLE': this.get('TYPE') 
          + (this.get('PARENTAUTOPROCPROGRAM') ? (' (' + this.get('PARENTAUTOPROCPROGRAM') + ')') : '')
          + (!this.get('AUTOMATIC') ? ' <i class="fa fa-refresh" title="Reprocessed"></i>': '')
      })
    },
  })

})
