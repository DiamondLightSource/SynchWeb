define(['marionette',
    
    'utils/editable',
    'collections/datacollections',
    'modules/dc/datacollections',
    'collections/samples',
    'modules/samples/views/list',

    'collections/containers',
    'modules/shipment/views/containers',
    
    'modules/samples/collections/pdbs',
    'modules/samples/views/pdbs',
    'modules/samples/views/addpdb',

    'collections/componenttypes',
    'collections/concentrationtypes',
    'collections/elements',
    'modules/samples/views/elements',

    'modules/dc/views/getdcview',
    
    'templates/samples/protein.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Editable, DCCol, DCView, Samples, SamplesView, Containers, ContainersView, 
        PDBs, PDBView, AddPDBView, 
        ComponentTypes, ConcentrationTypes, Elements, ElementsView,
        GetDCView,
        template, Backbone) {

        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        showContainers: true,
        
        ui: {
            userInput: '#element-search',
        },

        regions: {
            pdb: '.pdb',
            element: '.element',
            smp: '.samples',
            dc: '.datacollections',
            cont: '.conts',
        },
        
        events: {
            'click a.add': 'addPDB',
            'click .btn-add': 'onAddElement',
            'keypress #element-search': 'onKeyPress',
        },

        onKeyPress: function(e) {
            if (e.which === 13) { this.onAddElement() }
        },

        onAddElement: function() {
            const userInput = this.ui.userInput.val().trim();
            if (!userInput) { return }

            const matchedElement = this.elements.find(function(model) {
                return model.get('NAME').toLowerCase() === userInput.toLowerCase();
            });

            if (matchedElement) {
                const exactDatabaseName = matchedElement.get('NAME');
                const componentId = matchedElement.get('COMPONENTID');
                const isAlreadyAdded = this.associatedElements.some(function(model) {
                    return model.get('COMPONENTID') === componentId;
                });

                if (isAlreadyAdded) {
                    app.alert({ message: exactDatabaseName + ' has already been added to this protein!' })
                    this.ui.userInput.val('');
                    return;
                }

                this.associatedElements.create({
                    NAME: exactDatabaseName,
                    COMPONENTID: componentId,
                }, {
                    wait: true,
                    success: function(model, response) {
                        app.message({ message: 'Element successfully added' })
                    },
                    error: function(model, xhr, options) {
                        app.alert({ message: 'Failed to save element to database. Please try again.' })
                    }
                });
            } else {
                app.alert({ message: 'Invalid chemical element' })
            }
            this.ui.userInput.val('');
        },
        
        addPDB: function(e) {
            e.preventDefault()
            var view = new AddPDBView({ pid: this.model.get('PROTEINID') })
            this.listenTo(view, 'pdb:success', this.getPDBs)
            app.dialog.show(view)
        },
        
        getPDBs: function() {
            this.pdbs.fetch()
        },

        getAssociatedElements: function() {
            this.associatedElements.fetch()
        },

        initialize: function(options) {
            Backbone.Validation.bind(this);

            this.types = new ComponentTypes()
            this.tr = this.types.fetch()

            this.concs = new ConcentrationTypes()
            this.cr = this.concs.fetch()

            this.samples = new Samples()
            this.samples.state.pageSize = 5
            this.samples.queryParams.pid = this.model.get('PROTEINID')
            this.samples.fetch()
            
            this.dcs = new DCCol(null, { queryParams: { pid: this.model.get('PROTEINID'), pp: 5 } })
            this.dcs.fetch()
            
            this.pdbs = new PDBs(null, { pid: this.model.get('PROTEINID') })
            this.getPDBs()

            this.elements = new Elements()
            this.elements.fetch()

            this.associatedElements = new Elements(null, { pid: this.model.get('PROTEINID') })
            this.getAssociatedElements()

            if (this.getOption('showContainers')) {
                this.containers = new Containers()
                this.containers.queryParams.pid = this.model.get('PROTEINID')
                this.containers.fetch()
            }
        },
        
        
        onRender: function() {
            var self = this
            var edit = new Editable({ model: this.model, el: this.$el })
            // If this is protein is not from user office, allow changing name
            if (this.model.get('EXTERNAL') == 0) edit.create('NAME', 'text')
            edit.create('ACRONYM', 'text', {alert: true})
            edit.create('SEQUENCE', 'markdown')
            edit.create('MOLECULARMASS', 'text')
            if (app.staff) edit.create('GLOBAL', 'select', { data: { 1: 'Yes', 0: 'No' } })

            this.tr.done(function() {
                edit.create('COMPONENTTYPEID', 'select', { data: self.types.kv({ empty: true }) })
            })
            this.cr.done(function() {
                edit.create('CONCENTRATIONTYPEID', 'select', { data: self.concs.kv({ empty: true }) })  
            })

            // Prevent cyclic dependency
            var GetSampleView = require('modules/samples/views/getsampleview')
            // var GetDCView = require('modules/dc/views/getdcview')

            this.pdb.show(new PDBView({ collection: this.pdbs }))
            this.element.show(new ElementsView({ collection: this.associatedElements }))
            this.smp.show(GetSampleView.SampleList.get(app.type, { collection: this.samples, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.dc.show(GetDCView.DCView.get(app.type, { model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            if (this.getOption('showContainers')) this.cont.show(new ContainersView({ collection: this.containers, params: {} }))
        },
        
    })
        
})
