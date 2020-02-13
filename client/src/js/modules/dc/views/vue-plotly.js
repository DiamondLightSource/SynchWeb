define(['vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'modules/dc/views/vue-plotly.vue',
    ], function(Vue, VeeValidate, Promise, VueWrapper, PlotlyChart) {

    // Promise is not used, but required for IE if we want to use vee-validate
    Vue.use(VeeValidate)

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: '<section class="content"><plotlychart></plotlychart></section>',
            components: {
                'plotlychart': PlotlyChart.default
            }
        })
    })
})

