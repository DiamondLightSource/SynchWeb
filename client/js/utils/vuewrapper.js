// This module wraps a Vue application into a Marionette view
define(['marionette'], function(Marionette) {
    return Marionette.ItemView.extend({
        vueView: null,
        // class or id?
        template: _.template('<div class="vue-container"></div>'),

        ui: {
            container: '.vue-container',
        },
        // Backbone Render method - where we attach the Vue app to the page
        onRender: function() {
            this.vue = new this.vueView({el: this.ui.container[0]})
        },

        // Backbone View Lifecycle hook
        onDestroy: function() {
            // Destroy the Vue vm instance
            this.vue.$destroy()
        },
    })
})