define(['marionette', 
    'modules/shipment/models/containerregistry',
    'modules/shipment/models/containerproposal',
    'collections/proposals',
    'views/form',
    'views/filter',
    'views/table', 'utils/table', 
    'templates/shipment/containerregistryadd.html', 
    'templates/shipment/containerregistry.html'], 
    function(Marionette, ContainerRegistry, ContainerProposal, Proposals, 
      FormView, FilterView,
      TableView, table, addtemplate, template) {
      
    var ClickableRow = table.ClickableRow.extend({
        event: 'rcontainer:show',
        argument: 'CONTAINERREGISTRYID',
      
        onClick: function(e) {
            if ($(e.target).is('i') || $(e.target).is('a') || $(e.target).is('input') || $(e.target).hasClass('editable')) return
            if (this.cookie && this.model.get('PROP') && app.staff) app.cookie(this.model.get('PROP'))
            app.trigger(this.event, this.model.get(this.argument))
        },
    })
      
    var AddContainerView = FormView.extend({
        template: addtemplate,

        ui: {
            barcode: 'input[name=BARCODE]',
            comments: 'input[name=COMMENTS]',
        },

        createModel: function() {
            this.model = new ContainerRegistry()
        },
        
        success: function(model, response, options) {
            this.ui.barcode.val('')
            this.ui.comments.val('')
            this.trigger('model:saved', this.model)
            this.setupValidation()
        },

        failure: function(model, response, options) {
            console.log(response)
            if (response.responseText.indexOf('already') > -1) app.alert({ message: 'That barcode is already registered'})
            else app.alert({ message: 'Something went wrong registering that container, please try again'})
        },
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { 
            wrap: '.wrapper', 
            type: '.type',
            wrap2: '.wrapper2',
            add: '.add',
        },
        
        templateHelpers: {
            STAFF: app.staff
        },

        events: {
          'click a.addprop': 'addProp',
        },

        selectModel: function(m, checked) {
            console.log('model seleted in grid')
            m.set({ isGridSelected: checked })
        },

        addProp: function(e) {
            e.preventDefault()

            var containers = this.collection.where({ isGridSelected: true })
            console.log('addprops', containers)
            _.each(containers, function(c) {
                this.addProposalsToModel(c)
            }, this)

        },

        initialize: function(options) {
            var columns = [{ name: 'BARCODE', label: 'Barcode', cell: 'string', editable: false },
                           { name: 'PROPOSALS', label: 'Proposals', cell: 'string', editable: false },
                           { name: 'RECORDTIMESTAMP', label: 'Created', cell: 'string', editable: false },
                           { name: 'INSTANCES', label: '# Uses', cell: 'string', editable: false },
                           { name: 'LASTUSE', label: 'Last Use', cell: 'string', editable: false },
                           { name: 'REPORTS', label: 'Reports', cell: 'string', editable: false },
                           { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
                           ]
                
            if (app.staff) {
                columns.unshift({ label: '', cell: 'select-row', headerCell: 'select-all', editable: false })
            }

            if (app.mobile()) {
              _.each([2,4], function(v) {
                  columns[v].renderable = false
              })
            }
              
            this.table = new TableView({ 
                collection: options.collection, 
                columns: columns, tableClass: 'containers', filter: 's', search: options.params.s, loading: true, 
                backgrid: { row: ClickableRow, emptyText: 'No containers found' } 
            })

            if (app.staff) {
                this.listenTo(this.collection, 'backgrid:selected', this.selectModel, this)

                this.proposals = new Proposals()
                this.listenTo(this.proposals, 'backgrid:selected', this.selectModel, this)
                this.proposals.fetch()

                var columns = [
                    { label: '', cell: 'select-row', headerCell: 'select-all', editable: false },
                    { name: 'PROPOSALCODE', label: 'Code', cell: 'string', editable: false },
                    { name: 'PROPOSALNUMBER', label: 'Number', cell: 'string', editable: false },
                    { name: 'VCOUNT', label: 'Visits', cell: 'string', editable: false },
                    { name: 'TITLE', label: 'Title', cell: 'string', editable: false }
                ]

                this.table2 = new TableView({
                    collection: this.proposals,
                    columns: columns, tableClass: 'proposals', filter: 's', search: options.params.s, loading: true, noPageUrl: true, noSearchUrl: true,
                    backgrid: { emptyText: 'No proposals found' } 
                })

                this.ty = new FilterView({
                    collection: this.collection,
                    name: 't',
                    filters: [{ id: 'orphan', name: 'Orphaned'},],
                    value: options.params && options.params.ty,
                })
            }
        },
                                          
        addToCollection: function(m) {
            this.collection.add(m)
            this.addProposalsToModel(m)
        },

        addProposalsToModel: function(m) {
            var self = this
            var models = this.proposals.where({ isGridSelected: true })
            _.each(models, function(p) {
                var chp = new ContainerProposal({ PROPOSALID: p.get('PROPOSALID'), CONTAINERREGISTRYID: m.get('CONTAINERREGISTRYID') })
                chp.save({}, {
                    success: function() {
                        var props = m.get('PROPOSALS')
                        props = props ? props.split(',') : []
                        props.push(p.get('PROPOSAL'))
                        m.set('PROPOSALS', props.join(','))
                    }
                })
            }, this)
        },

        onRender: function() {
            this.wrap.show(this.table)
            if (app.staff) {
                this.wrap2.show(this.table2)

                this.addview = new AddContainerView()
                this.listenTo(this.addview, 'model:saved', this.addToCollection)
                this.add.show(this.addview)
                this.type.show(this.ty)
            }
        }
    })

})