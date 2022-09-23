define(['marionette', 'views/form', 
    'models/protein',
    'collections/componenttypes',
    'collections/concentrationtypes',
    'modules/samples/collections/pdbs', 
    'templates/samples/proteinadd.html'], 
    function(Marionette, TableView, Protein, ComponentTypes, ConcentrationTypes, PDBs, template) {
    
    
    return FormView.extend({
        template: template,

        templateHelpers: function() {
            return {
                IS_STAFF: app.staff,
                IS_CLONE: this.clone
            }
        },
        
        createModel: function() {
            if (this.model) {
                console.log("Passed protein to clone")
                // Set the passed protein id to null to indicate this will be a new instance
                this.model.set('PROTEINID', null)
            } else {
                // Normal New / Add Protein use case
                this.model = new Protein()
            }
        },
        
        ui: {
            name: 'input[name=NAME]',
            acronym: 'input[name=ACRONYM]',
            sequence: 'textarea[name=SEQUENCE]',
            mass: 'input[name=MOLECULARMASS]',

            // Why the ^ character, bug???
            exist: 'select[name^=existing_pdb]',
            pdbf: 'input[name=new_pdb]',
            type: 'select[name=COMPONENTTYPEID]',
            conc: 'select[name=CONCENTRATIONTYPEID]',
        },
        
        initialize: function(options) {
            // If this page has been created as a clone option we will have a valid this.model
            if (this.model) this.clone = true

            this.types = new ComponentTypes()
            this.types.fetch().done(this.updateTypes.bind(this))

            this.concs = new ConcentrationTypes()
            this.concs.fetch().done(this.updateConcs.bind(this))

            // Get the PDBs associated with this protein
            if (this.clone) this.pdbs = new PDBs(null, {pid: this.model.get('PROTEINID')})
            else this.pdbs = new PDBs()
            this.pdbs.fetch().done(this.updatePDBs.bind(this))
        },

        updatePDBs: function() {
            this.ui.exist.html(this.pdbs.opts())
        },

        updateTypes: function() {
            this.ui.type.html(this.types.opts({ empty: true }))
            // Set them with our cloned value if we have one
            if (this.model.get('COMPONENTTYPEID')) this.ui.type.val(this.model.get('COMPONENTTYPEID'))
        },

        updateConcs: function() {
            this.ui.conc.html(this.concs.opts({ empty: true }))
            // Set them with our cloned value if we have one
            if (this.model.get('CONCENTRATIONTYPEID')) this.ui.conc.val(this.model.get('CONCENTRATIONTYPEID'))
        },

        success: function(model, response, options) {
            console.log('success from protadd', this.model)
            let newProtein = this.model
            // Now if we are cloning, associate any existing PDBs with this protein
            if (this.clone) {
                this.pdbs.each(function(model, index, list) {
                    model.set('PROTEINID', newProtein.get('PROTEINID'))
                    model.set('PROTEINHASPDBID', null)
                    model.set('existing_pdb', model.get('PDBID'))
                    model.set('PDBID', null)
                    model.save(model.changedAttributes())
                })
            }
            app.trigger('proteins:view', model.get('PROTEINID'))
        },

        failure: function(model, xhr, options) {
            console.log(arguments)
            json = null
            if (xhr.responseText) {
                try { 
                    json = $.parseJSON(xhr.responseText)
                } catch(err) {
                    console.error("Error parsing response: ", err)
                }
            }

            if (json.message) app.alert({ message: json.message })
            else app.alert({ message: 'Something went wrong registering that protein' })
        },
        onRender: function() {
            console.log(this.ui.pdbf)
            this.ui.name.val(this.model.get('NAME'))
            this.ui.acronym.val(this.model.get('ACRONYM'))
            this.ui.sequence.val(this.model.get('SEQUENCE'))
            this.ui.mass.val(this.model.get('MOLECULARMASS'))
        }
    })

})