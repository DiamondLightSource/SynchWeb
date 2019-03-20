// Because the docs are located outside the /client/js dir,
// a relative import is needed for the docs templates.
// We could move these into templates/ 
// Left like this at the moment so we can switch back easier if needed
define(['vue', 
        'utils/vuewrapper',
        'text!templates/docs/tutorials.html',
        'text!../../../../../doc/proposal/index.html',
        'text!../../../../../doc/contact/index.html',
        'text!../../../../../doc/mobile/index.html',
        'text!../../../../../doc/data/index.html',
        'text!../../../../../doc/samples/index.html',
        'text!../../../../../doc/shipment/index.html',
        'text!../../../../../doc/prepare/index.html',
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