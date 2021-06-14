define(['vue',
    'veevalidate',
    'promise',
    'utils/vuewrapper',
    'modules/types/xpdf/samples/views/vue-simplesample.vue',
    ], function(Vue, VeeValidate, Promise, VueWrapper, SimpleSample) {

    // Promise is not used, but required for IE if we want to use vee-validate
    Vue.use(VeeValidate)

    VeeValidate.Validator.extend('closeExp', {
        getMessage: field => field+ ' must have correctly closed brackets',
        validate: value => {
            var count = 0
            for(var i=0;i<value.length;i++){
                if(value.charAt(i) === '(')
                    count++
                else if(value.charAt(i) === ')'){
                    if(count === 0)
                        return false
                    else
                        count--
                }
            }
            if(count === 0)
                return true
            else
                return false
        }
    })

    return VueWrapper.extend({
        vueView: Vue.extend({
            template: '<section class="content"><h1>Add Simple Sample</h1><p class="help">This page allows you to add all sample information for one or more samples in a single transaction</p><simplesample></simplesample></section>',
            components: {
                'simplesample': SimpleSample.default
            },
        })
    })
})