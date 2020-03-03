define(['vue',
    'utils/vuewrapper',
    'templates/types/gen/vuetable.html'
    ], function(Vue, VueWrapper, template) {
        return Vue.component('vue-table', {
            template: template,

            data: function(){
                return {
                    title: '',
                    headers: [],
                    items: []
                }
            },

            methods: {

            }
        })
    })