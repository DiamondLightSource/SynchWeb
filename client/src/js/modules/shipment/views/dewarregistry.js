define(['marionette', 'backgrid',
    'modules/shipment/models/dewarregistry',
    'modules/shipment/models/dewarproposal',
    'collections/proposals',
    'collections/labcontacts',
    'views/form',
    'views/filter',
    'views/table', 'utils/table', 
    'formatDate',
    'templates/shipment/dewarregistryadd.html', 
    'templates/shipment/dewarregistry.html'], 
    function(Marionette, Backgrid, DewarRegistry, DewarProposal, 
      Proposals, LabContacts,
      FormView, FilterView,
      TableView, table, formatDate, addtemplate, template) {
      
    var ClickableRow = table.ClickableRow.extend({
        event: 'rdewar:show',
        argument: 'FACILITYCODE',
      
        onClick: function(e) {
            if ($(e.target).is('i') || $(e.target).is('a') || $(e.target).is('input') || $(e.target).hasClass('editable')) return
            if (!this.model.get('PROP')) return

            if (this.model.get('PROP') && app.staff) app.cookie(this.model.get('PROP'))
            app.trigger(this.event, this.model.get(this.argument))
        },
    })
      
    var AddDewarView = FormView.extend({
        template: addtemplate,

        ui: {
            fc: 'input[name=FACILITYCODE]',
            date: 'input[name=PURCHASEDATE]',
        },

        onRender: function() {
            this.date('input[name=PURCHASEDATE]')
        },

        createModel: function() {
            this.model = new DewarRegistry()
        },
        
        success: function() {
            app.alert({message: 'New dewar registered ' + this.model.get('FACILITYCODE'), notify: true})
            this.ui.fc.val('')
            this.ui.date.val('')
            this.model.set({ DEWARS: 0, REPORTS: 0, BLTIMESTAMP: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss') })
            this.trigger('model:saved', this.model)
            this.setupValidation()
        },

        failure: function(model, response) {
            console.log(response)
            if (response.responseText.indexOf('already') > -1) app.alert({ message: 'That facility code is already registered'})
            else app.alert({ message: 'Something went wrong registering that dewar, please try again'})
        },
    })

    var LabContactCell = Backgrid.Cell.extend({
        initialize: function(options) {
          LabContactCell.__super__.initialize.call(this, options)
          this.listenTo(this.model, 'change:isGridSelected', this.render)
        },

        events: {
            'change select[name=LABCONTACTID]': 'updateLC',
        },

        updateLC: function() {
            var lc = this.$el.find('select[name="LABCONTACTID"]').val()
            console.log('LabContactCell updateLC', lc)
            this.model.set({ LABCONTACTID: lc })
        },

        render() {
            this.$el.empty()
            if (this.model.get('isGridSelected')) {
                this.column.set({ label: 'Lab Contact' })
                this.$el.html('<i class="fa fa-spin fa-spinner"></i>')

                this.labcontacts = new LabContacts()
                this.labcontacts.queryParams.prop = this.model.get('PROP')

                var self = this
                this.labcontacts.fetch().then(function() {
                    self.$el.html('<select name="LABCONTACTID"></select>')
                    self.$el.find('select[name="LABCONTACTID"]').html(self.labcontacts.opts())
                    self.updateLC()
                })
            } else {
                this.column.set({ label: '' })
            }

            return this
        }
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
        
        templateHelpers: function () {
            return { STAFF: app.staff }
        },

        events: {
          'click a.addprop': 'addProp',
        },

        selectModel: function(m, checked) {
            console.log('model seleted in grid', m)
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
            var columns = [{ name: 'FACILITYCODE', label: 'Facility Code', cell: 'string', editable: false },
                           { name: 'PROPOSALS', label: 'Proposals', cell: 'string', editable: false },
                           { name: 'BLTIMESTAMP', label: 'Created', cell: 'string', editable: false },
                           { name: 'DEWARS', label: '# Uses', cell: 'string', editable: false },
                           { name: 'LASTUSE', label: 'Last Use', cell: 'string', editable: false },
                           { name: 'REPORTS', label: 'Reports', cell: 'string', editable: false },
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
                columns: columns, tableClass: 'dewars', filter: 's', search: options.params.s, loading: true, 
                backgrid: { row: ClickableRow, emptyText: 'No dewars found' }
            })

            if (app.staff) {
                this.listenTo(this.collection, 'backgrid:selected', this.selectModel, this)

                this.proposals = new Proposals()
                this.listenTo(this.proposals, 'backgrid:selected', this.selectModel, this)
                this.proposals.fetch()

                var columns2 = [
                    { label: '', cell: 'select-row', headerCell: 'select-all', editable: false },
                    { name: '', label: '', cell: LabContactCell, editable: false },
                    { name: 'PROPOSALCODE', label: 'Code', cell: 'string', editable: false },
                    { name: 'PROPOSALNUMBER', label: 'Number', cell: 'string', editable: false },
                    { name: 'VCOUNT', label: 'Visits', cell: 'string', editable: false },
                    { name: 'TITLE', label: 'Title', cell: 'string', editable: false }
                ]

                this.table2 = new TableView({
                    collection: this.proposals,
                    columns: columns2, tableClass: 'proposals', filter: 's', loading: true, noPageUrl: true, noSearchUrl: true,
                    backgrid: { emptyText: 'No proposals found' },
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
            var models = this.proposals.where({ isGridSelected: true })
            _.each(models, function(p) {
                var chp = new DewarProposal({ PROPOSALID: p.get('PROPOSALID'), DEWARREGISTRYID: m.get('DEWARREGISTRYID'), LABCONTACTID: p.get('LABCONTACTID') })
                chp.save({}, {
                    success: function() {
                        var props = m.get('PROPOSALS')
                        props = props ? props.split(',') : []
                        props.push(p.get('PROPOSAL'))
                        m.set('PROPOSALS', props.join(','))
                        if (!m.get('PROP')) m.set('PROP', p.get('PROPOSAL'))
                        // This will be called multiple times for many proposals. Might be a cleaner method..?
                        app.alert({message: 'Added registered dewar ' + m.get('FACILITYCODE') + ' to proposal(s) ' + props, notify: true})
                    }
                })
            }, this)
        },

        onRender: function() {
            this.wrap.show(this.table)
            if (app.staff) {
                this.wrap2.show(this.table2)

                this.addview = new AddDewarView()
                this.listenTo(this.addview, 'model:saved', this.addToCollection)
                this.add.show(this.addview)
                this.type.show(this.ty)
            }
        }
    })

})
