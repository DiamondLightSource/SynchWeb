define(['vue',
    'utils/vuewrapper',
    'modules/types/xpdf/samples/views/vue-simplesample.vue',
    ], function(Vue, VueWrapper, SimpleSample) {

    return VueWrapper.extend({
        vueView: Vue.extend({
            components: {
                'simplesample': SimpleSample.default
            },
            template: '<section class="content"><h1>Add Simple Sample</h1><p class="help">This page allows you to add all sample information for one or more samples in a single transaction</p><simplesample></simplesample></section>',
        })
    })
})
