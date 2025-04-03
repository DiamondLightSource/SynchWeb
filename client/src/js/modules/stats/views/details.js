define(['marionette', 'templates/stats/details.html'], function(Marionette, template) {

    return Marionette.View.extend({
        template: template,
        className: 'data_collection',
    })

})