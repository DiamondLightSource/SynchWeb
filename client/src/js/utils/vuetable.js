define(['vue',
    'utils/vuewrapper',
    'templates/types/gen/vuetable.html'
    ], function(Vue, VueWrapper, template) {
        return Vue.component('VueTable', {

            data: function(){
                return {
                    title: '',
                    headers: [],
                    items: []
                }
            },

            methods: {

            },
            template: template
        })
    })