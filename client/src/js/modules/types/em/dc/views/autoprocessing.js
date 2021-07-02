/* TODO:
   This is just a wrapper - it should become irrelevant when autoProcessing
   Is a Vue component */
define([
    'vue',
    'utils/vuewrapper',
    'modules/types/em/dc/views/autoprocessing.vue',
], function(
    Vue,
    VueWrapper,
    Autoprocessing
) {
    return VueWrapper.extend({
        'modelEvents': {
            'change': 'render'
        },
        initialize: function(options) {
            this.render()
            this.getOption('el').slideToggle()
        },
        'vueView': Vue.extend({
            'components': {
                'autoprocessing': Autoprocessing.default
            },
            'computed': {
                'collectionId': function() {
                    return this.$getOption('id')
                },
            },
            'template': '<autoprocessing :collection-id="collectionId" />',
        }),
    })
})
