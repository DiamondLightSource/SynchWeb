define([
    'backbone',
    'vue',
    'utils/vuewrapper',
    'veevalidate',
    'promise',
    'models/protein',
    'models/crystal',
    'collections/crystals',
    'models/container',
    'models/multimodelfilewrapper',
    'modules/types/xpdf/utils/phasecompositor',
    'modules/types/xpdf/collections/capillaries',
    'templates/vue/types/xpdf/samples/simplesampleaddpop.html'
    ], function(
        Backbone,
        Vue,
        VueWrapper,
        VeeValidate,
        Promise,
        Phase,
        Crystal,
        Crystals,
        Container,
        MultiModelFileWrapper,
        phaseCompositor,
        Capillaries,
        template
    ) {

        Vue.use(VeeValidate)

        return VueWrapper.extend({
            vueView: Vue.extend({
                template: template,

                data: function(){
                    return {
                        // Probably shouldn't be getting from the prototype...
                        capillaries: new Capillaries().__proto__.capillaries,
                        existingCapillaryID: null,
                        seq: '',
                        mass: 0,
                        type: '',
                        capacity: 25,
                        name: '',
                        density: '',
                        fraction: null,
                        containers: null,
                        showUploadDialog: false,
                        cifFiles: [],
                        comments: '',
                        isLoading: false,
                        containerless: false,
                        hasExistingCapillaries: false,
                        defaultDewarId: null
                    }
                },

                created: function(){
                    // async:false probably not the best way (locks UI thread) but it seems to work well
                    let existingCapillaries = new Crystals().fetch({async:false})
                    let self = this

                    var caps = JSON.parse(existingCapillaries.responseText)
                    
                    var exists = []
                    var count = 0
                    var lastCapillaryId = 0
                    for(var i=0; i<caps.data.length; i++){
                        if(caps.data[i].NAME.includes('Capillary')){
                            exists[count] = caps.data[i].CRYSTALID + ':' + caps.data[i].NAME

                            if(caps.data[i].CRYSTALID > lastCapillaryId)
                                lastCapillaryId = caps.data[i].CRYSTALID;

                            count++
                        }
                    }

                    if(exists.length > 0){
                        this.hasExistingCapillaries = true;

                        exists.forEach(function(item, index){
                            if(item.startsWith(lastCapillaryId))
                                self.type = item;
                        });

                    }

                    var stored = []
                    for(var i=0;i<this.capillaries.length;i++){
                        stored[i] = this.capillaries[i].name
                    }

                    this.containers = stored.concat(exists);

                    // Try to retrieve the default dewar for this proposal/visit
                    // Uses the special session-0 because at this point we are not necesarily on a session
                    Backbone.ajax({
                        url: app.apiurl+'/shipment/dewars/default',
                        data: { visit: app.prop + '-0'},

                        success: function(did) {
                            console.log("Retrieved Default Dewar for this visit " + did)
                            self.defaultDewarId = did
                        },
                        error: function() {
                            app.alert({ title: 'Error', message: 'The default dewar for this visit could not be created (no session-0?)' })
                        },
                    })
                },

                methods: {
                    onSubmit: function(e){
                        e.preventDefault()
                        let self = this
                        this.$validator.validateAll().then(function(result){
                            if(result && self.defaultDewarId){
                                self.submitSimpleSample()
                            } else {
                                console.log('Form submission prevented, validation failed');
                                app.alert({ title: 'Error', message: 'Form validation failed, or default dewar for this visit could not be created' })
                            }
                        });
                    },

                    submitSimpleSample: function(){

                        this.isLoading = true

                        if(this.type.includes('Capillary'))
                            this.existingCapillaryID = this.type.substring(0, this.type.indexOf(':'))

                        let capillaryPhase = new Phase({
                            NAME: this.name + '_Capillary_Material',
                            ACRONYM: 'xpdfCapillary'+(new Date().getTime().toString()),
                            DENSITY: this.getCapillaryInfo('density') != null ? this.getCapillaryInfo('density') : null,
                            SEQUENCE: this.getCapillaryInfo('sequence') != null ? this.getCapillaryInfo('sequence') : null,
                            MOLECULARMASS: this.getCapillaryInfo('sequence') != null ? phaseCompositor.molecularMassFromComposition(this.getCapillaryInfo('sequence')) : null
                        })

                        let capillaryCrystal = new Crystal({
                            CRYSTALID: this.existingCapillaryID,
                            NAME: this.name + '_' + this.type +'_Capillary',
                            COMMENTS: this.comments,
                            THEORETICALDENSITY: this.getCapillaryInfo('density') != null ? this.getCapillaryInfo('density') : null,
                            ABUNDANCE: 1,
                            CONTAINERLESS: this.containerless,
                            OUTERDIAMETER: this.getCapillaryInfo('outer_diameter') != null ? this.getCapillaryInfo('outer_diameter') : null,
                            INNERDIAMETER: this.getCapillaryInfo('inner_diameter') != null ? this.getCapillaryInfo('inner_diameter') : null,
                            LENGTH: this.getCapillaryInfo('length') != null ? this.getCapillaryInfo('length') : null,
                            SHAPE: 'cylinder'
                        })

                        let phase = new Phase({
                            NAME: this.name,
                            ACRONYM: 'xpdfPhase'+(new Date().getTime().toString()),
                            DENSITY: this.density,
                            MOLECULARMASS: this.mass,
                            SEQUENCE: this.seq
                        })

                        let crystal = new Crystal({
                            NAME: this.name,
                            COMMENTS: this.comments,
                            THEORETICALDENSITY: this.density,
                            ABUNDANCE: 1
                        })

                        let container = new Container({
                            NAME: this.name,
                            CAPACITY: this.capacity,
                            CONTAINERTYPE: 'Box',
                            COMMENTS: this.comments
                        })

                        let model = new MultiModelFileWrapper({
                            urlRoot: '/sample/simple',
                            capillaryPhase: capillaryPhase,
                            phase: phase,
                            crystal: crystal,
                            capillary: capillaryCrystal,
                            container: container,
                            PACKINGFRACTION: this.fraction,
                            DEWARID: this.defaultDewarId
                        })

                        for(var i=0; i < this.cifFiles.length; i++){
                            var name = 'pdb_file_'+i
                            model.set(name, this.cifFiles[i]);
                        }


                        let self = this

                        model.save({}, {
                            success: function(){
                                app.triggerMethod('sample:reloadSampleTable')
                                app.alert({className: 'message notify', message: "Successfully added sample and relevant capillary data."})
                                self.isLoading = false
                                if (app.dialog.currentView) 
                                    app.dialog.currentView.closeDialog()
                                
                            },
                            error: function(model, response, options){
                                let alertMessage = "Failed to add Simple Sample information"

                                let responseObj = JSON.parse(response.responseText)

                                if('message' in responseObj){
                                    alertMessage = alertMessage + ': ' + responseObj.message
                                }

                                app.alert({message: alertMessage})
                                self.isLoading = false
                                if (app.dialog.currentView) 
                                    app.dialog.currentView.closeDialog()
                            }
                        })
                    },

                    updateMolecularMass: function() {
                        this.mass = phaseCompositor.molecularMassFromComposition(this.seq)
                    },

                    getCapillaryInfo: function(field) {
                        for(var i=0;i<this.capillaries.length;i++){
                            if(this.capillaries[i].name == this.type){
                                return this.capillaries[i][field];
                            }
                        }
                        return null
                    },

                    showCifFileDialog: function() {
                        this.showUploadDialog ? this.showUploadDialog = false : this.showUploadDialog = true
                    },

                    setCifFile: function(event){
                        for(var i=0; i < event.target.files.length; i++){
                            this.cifFiles[i] = event.target.files[i]
                        }
                    },

                    closeDialog: function(){
                        app.dialog.currentView.closeDialog()
                    },

                    toggleSelectEnabled: function(){
                        this.containerless ? document.getElementById('containerSelect').disabled = true : document.getElementById('containerSelect').disabled = false;
                    }
                }
            })
        });
})
