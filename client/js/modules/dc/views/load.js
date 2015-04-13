define(['marionette', 'tpl!templates/dc/load.html'], function(Marionette, template) {

  return Marionette.ItemView.extend({
    template: template
  })
       
})