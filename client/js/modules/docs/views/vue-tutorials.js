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