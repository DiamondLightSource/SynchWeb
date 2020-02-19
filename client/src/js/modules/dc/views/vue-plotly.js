define(['vue',
    'utils/vuewrapper',
    'modules/dc/views/vue-plotly.vue',
    ], function(Vue, VueWrapper, PlotlyChart) {

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: '<section class="content"><plotlychart v-bind:msg="message" v-bind:data="plot.data" v-bind:layout="plot.layout"></plotlychart></section>',
            components: {
                'plotlychart': PlotlyChart.default
            },
            data: function(){
                return {
                    message: "Message from Vue",
                    plot: this.$getOption('data'),
                }
            },
        })
    })
})

