/* TODO:
   This is just a wrapper - it should become irrelevant when autoProcessing
   Is a Vue component */
define([
    'vue',
    'utils/vuewrapper',
    'modules/types/em/dc/views/motion-correction/motion-correction.vue',
], function(
    Vue,
    VueWrapper,
    MotionCorrectionView
) {
    return VueWrapper.extend({
        'modelEvents': {
            'change': 'render'
        },
        'vueView': Vue.extend({
            'components': {
                'motion-correction': MotionCorrectionView.default
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
            'template': '<motion-correction :api-url="apiUrl" :model="model" :ready="ready" />',
        })
    })
})
