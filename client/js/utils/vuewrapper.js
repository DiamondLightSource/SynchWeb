// This module wraps a Vue application into a Marionette view
define(['marionette', 'vue'], function(Marionette, Vue) {
    return Marionette.ItemView.extend({
        vueView: null,
        // class or id?
        template: _.template('<div class="vue-container"></div>'),

        ui: {
            container: '.vue-container',
        },
        // Backbone Render method - where we attach the Vue app to the page
        onRender: function() {
            // This allows the vue component to access any constructor arguments
            // They can then be accessible in the created lifecycle hook
            // Works with the assumption we only have a single vue instance per page
            let self = this
            Vue.prototype.$getOption = function(option) {
                return self.getOption(option)
            }

            this.vue = new this.vueView({el: this.ui.container[0]})
        },

        // Backbone View Lifecycle hook
        onDestroy: function() {
            // Destroy the Vue vm instance
            this.vue.$destroy()
        },
    })
})