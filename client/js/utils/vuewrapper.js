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
            // Set any passed model, collection to the vue instance
            // Declare this within the vue component's data object as m_model, m_collection
            this.vue.m_model = this.model
            this.vue.m_collection = this.collection
        },

        // Backbone View Lifecycle hook
        onDestroy: function() {
            // Destroy the Vue vm instance
            this.vue.$destroy()
        },
    })
})