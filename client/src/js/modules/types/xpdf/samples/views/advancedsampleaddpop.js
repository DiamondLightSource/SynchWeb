define([
    'vue',
    'utils/vuewrapper',
    'utils/vuetable',
    'models/protein',
    'modules/types/xpdf/utils/phasecompositor',
    //'tpl!templates/types/xpdf/samples/advancedsampleaddpop.html'
    'templates/types/xpdf/samples/advancedsampleaddpop.html'
    ], function(
        Vue,
        VueWrapper,
        VueTable,
        Phase,
        phaseCompositor,
        template
    ) {
        var vueTable = VueTable.extend({
            data: function(){
                return {
                    title: 'Phases',
                    headers: ['Phase Name', 'Composition', 'Phase Fraction'],
                    items: []
                }
            },
            methods: {
                
            }
        });
        return VueWrapper.extend({
            vueView: Vue.extend({
                template: template,
                data: function(){
                    return {
                        acronym: '',
                        seq: '',
                        mass: '',
                        type: '',
                        name: '',
                        composition: '',
                        density: ''
                    }
                },

                methods: {
                    updateMolecularMass: function() {
                        this.model.set('MOLECULARMASS', phaseCompositor.molecularMassFromComposition(this.ui.seq.val()))
                        this.ui.mass.val(this.model.get('MOLECULARMASS'))
                    },
                    onsubmit:function(){

                    },
                },

                components: {
                    'vue-table': vueTable
                },

                el: '#table'
            })
        });

        /*return  FormView.extend({
            id: 'vue-wrapper',
            template: '<div id="vue-container"></div>',
            vueView: undefined,

            render: function(){
                this.$el.html(this.template);
                this.vueView = new VueView({el: this.$('#vue-container').get(0)});
                return this;
            },

            remove: function() {
                this.vueView.$destroy()
                //Marionette.LayoutView.prototype.remove.apply(this)
            },

            createModel(){this.model = new Phase()}
        });
        /*template:template,
        
        ui: {
            acronym: 'input[name=ACRONYM]',
            seq: 'input[name=SEQUENCE]',
            mass: 'input[name=MOLECULARMASS]',
        },

        events: {
            'change @ui.seq': 'updateMolecularMass',
        },

        updateMolecularMass: function() {
            this.model.set('MOLECULARMASS', phaseCompositor.molecularMassFromComposition(this.ui.seq.val()))
            this.ui.mass.val(this.model.get('MOLECULARMASS'))
        },

        createModel: function() {
            this.model = new Phase()
        },
        
        success: function(model, response, options) {
            if (this.getOption('dialog')) {
                this.trigger('phase:added', this.model)
                if (app.dialog.currentView) app.dialog.currentView.closeDialog()

            } else app.trigger('phases:view', this.model.get('PROTEINID'))
        },
        
        initialize: function(options) {
        },
        
        onRender: function(options) {
            var millis = (new Date()).getTime()
            this.ui.acronym.val('xpdf'+millis.toString())
        },
    })*/

})
