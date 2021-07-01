/* TODO:
   This is just a wrapper - it should become irrelevant when autoProcessing
   Is a Vue component */
define([
    'vue',
    'utils/vuewrapper',
    'modules/types/em/dc/views/ctf/ctf.vue',
], function(Vue, VueWrapper, CtfView) {
    return VueWrapper.extend({
        'modelEvents': {
            'change': 'render'
        },
        'vueView': Vue.extend({
            'components': {
                'ctf-view': CtfView.default
            },
            'props': {
                'ready': Boolean
            },
            'data': function(){
                return {
                    'apiUrl': app.apiurl,
                    'model': this.$getOption('model'),
                }
            },
            'template': '<ctf-view :api-url="apiUrl" :model="model" :ready="ready" />',
        })
    })
})
