define(['marionette', 'tpl!templates/stats/details.html'], function(Marionette, template) {

    return Marionette.ItemView.extend({
        template: template,
        className: 'data_collection',
    })

})