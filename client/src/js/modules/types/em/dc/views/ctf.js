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
            'props': { // TODO: not used!
                'ready': Boolean
            },
            'template': '<ctf-view />',
        })
    })
})
