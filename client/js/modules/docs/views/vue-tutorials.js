// Moved docs into templates/ and images under /assets/images/doc/ 
define(['vue', 
        'utils/vuewrapper',
        'templates/vue/docs/tutorials.html',
        'templates/vue/docs/proposal/index.html',
        'templates/vue/docs/contact/index.html',
        'templates/vue/docs/mobile/index.html',
        'templates/vue/docs/data/index.html',
        'templates/vue/docs/samples/index.html',
        'templates/vue/docs/shipment/index.html',
        'templates/vue/docs/prepare/index.html',
    ], function(Vue, VueWrapper, tmpl, 
        proposalTemplate, contactTemplate, mobileTemplate, dataTemplate,
        samplesTemplate, shipmentTemplate, experimentTemplate) {

        // Can register the components globally like this:
        // Vue.component('tutorial-proposal', { template: proposalTemplate })
        // But as we only use them here we can use a local object
        let proposalComponent = {template: proposalTemplate}
        let contactComponent = {template: contactTemplate}
        let mobileComponent = {template: mobileTemplate}
        let dataComponent = {template: dataTemplate}
        let samplesComponent = {template: samplesTemplate}
        let shipmentComponent = {template: shipmentTemplate}
        let experimentComponent = {template: experimentTemplate}
        
        return VueWrapper.extend({
            vueView: Vue.extend({
                template: tmpl,
                components: {
                    'tutorial-proposal': proposalComponent,
                    'tutorial-contact': contactComponent,
                    'tutorial-mobile': mobileComponent,
                    'tutorial-data': dataComponent,
                    'tutorial-samples': samplesComponent,
                    'tutorial-shipment': shipmentComponent,
                    'tutorial-experiment': experimentComponent,
                },
                data: function() {
                    return {
                        currentPage: 'proposals',
                    }
                },
                methods: {
                    onShowPage: function(tutorial) {
                        this.currentPage = tutorial
                    }
                }
            })
        })
    }
)