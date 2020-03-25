define(['vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'modules/types/xpdf/samples/views/vue-simplesample.vue',
    ], function(Vue, VeeValidate, Promise, VueWrapper, SimpleSample) {

    // Promise is not used, but required for IE if we want to use vee-validate
    Vue.use(VeeValidate)

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: '<section class="content"><h1>Simple Sample Wizard</h1><simplesample></simplesample></section>',
            components: {
                'simplesample': SimpleSample.default
            },
        })
    })
})