// Moved docs into templates/ and images under /assets/images/doc/ 
define(['vue', 
        'utils/vuewrapper',
        'text!templates/docs/tutorials.html',
        'text!templates/docs/proposal/index.html',
        'text!templates/docs/contact/index.html',
        'text!templates/docs/mobile/index.html',
        'text!templates/docs/data/index.html',
        'text!templates/docs/samples/index.html',
        'text!templates/docs/shipment/index.html',
        'text!templates/docs/prepare/index.html',
    ], function(Vue, VueWrapper, tmpl, 
        proposalTemplate, contactTemplate, mobileTemplate, dataTemplate,
        samplesTemplate, shipmentTemplate, experimentTemplate) {

        // Register the component wrappers for each tutorial
        // Crude but simple method
        Vue.component('tutorial-proposal', { template: proposalTemplate })
        Vue.component('tutorial-contact', { template: contactTemplate })
        Vue.component('tutorial-mobile', { template: mobileTemplate })
        Vue.component('tutorial-data', { template: dataTemplate })
        Vue.component('tutorial-sample', { template: samplesTemplate })
        Vue.component('tutorial-shipment', { template: shipmentTemplate })
        Vue.component('tutorial-experiment', { template: experimentTemplate })

        return VueWrapper.extend({
            vueView: Vue.extend({
                template: tmpl,
                components: [
                    'tutorial-proposal',
                    'tutorial-contact',
                    'tutorial-mobile',
                    'tutorial-data',
                    'tutorial-samples',
                    'tutorial-shipment',
                    'tutorial-prepare',
                ],
                data: function() {
                    return {
                        currentPage: 'proposals',
                    }
                },
                methods: {
                    onShowPage(tutorial) {
                        this.currentPage = tutorial
                    }
                }
            })
        })
    }
)