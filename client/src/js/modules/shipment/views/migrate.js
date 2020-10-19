define(['marionette',
    'collections/proposals',
    'collections/labcontacts',
    'collections/proteins',

    'views/table',
    'templates/shipment/migrate.html'
    ], function(Marionette,
        Proposals, LabContacts, Proteins,
        TableView,
        template) {


    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',

        templateHelpers: function() {
	        var validOnly = app.options.get('valid_components')
            return {
                proposal: app.prop,
                // Proteins can only be migrated if we are not using approved samples from user office
                CAN_MIGRATE_PROTEINS: !validOnly, 
            }
        },

        regions: {
            rprots: '.rproteins',
            rconts: '.rcontacts',
        },

        events: {
            'change @ui.lc': 'displayLabContact',
            'click button[name=lc]': 'migrateContact',
            'click button[name=protein]': 'migrateProtein',
        },


        ui: {
            prop: 'input[name=PROPOSAL]',
            lc: 'select[name=LABCONTACT]',
            olc: 'select[name=OLABCONTACT]',

            prot: 'select[name=PROTEIN]',

            ti: '.TITLE',
            st: '.START',

            cn: '.CARDNAME',
            ln: '.LABNAME',
            ad: '.ADDRESS',

            ncn: '.NCARDNAME',
            nln: '.NLABNAME',
            nad: '.NADDRESS',
        },


        migrateContact: function() {
            var contacts = this.contacts.where({ isGridSelected: true })

            if (!this.ui.prop.val()) {
                app.alert({ message: 'You must select a proposal to migrate to' })
                return
            }
            if (!contacts.length) {
                app.alert({ message: 'You must select at least one contact to copy' })
                return
            }

            var ready = []
            _.each(contacts, function(c) {
                var nc = c.clone()
                nc.set({ 
                    LABCONTACTID: null,
                    prop: this.ui.prop.val(),
                })

                ready.push(nc.save())
            }, this)

            var self = this
            $.when.apply($, ready).done(function() {
                app.alert({ message: 'Lab Contact(s) copied to: '+self.ui.prop.val() })
            })
        },


        migrateProtein: function() {
            var ready = []
            var proteins = this.proteins.where({ isGridSelected: true })

            if (!this.ui.prop.val()) {
                app.alert({ message: 'You must select a proposal to migrate to' })
                return
            }
            if (!proteins.length) {
                app.alert({ message: 'You must select at least one protein to copy' })
                return
            }

            _.each(proteins, function(p) {
                var np = p.clone()
                np.set({ 
                    PROTEINID: null,
                    prop: this.ui.prop.val(),
                })

                ready.push(np.save())

            }, this)

            var self = this
            $.when.apply($, ready).done(function() {
                app.alert({ message: 'Protein(s) copied to: '+self.ui.prop.val() })
            })
        },

        reset: function() {
            this.ui.prop.val('')
            this.ui.lc.html('').val('')
            this.displayLabContact()
            this.displayProposal()
        },



        initialize: function(options) {
            this.proposals = new Proposals()
            this.ready = this.proposals.fetch()

            // The list of lab contacts used in the drop down
            this.labcontacts = new LabContacts([], {state: {pageSize: 9999}})

            this.contacts = new LabContacts()
            this.listenTo(this.contacts, 'backgrid:selected', this.selectModel, this)
            this.contacts.fetch()

            this.proteins = new Proteins()
            this.listenTo(this.proteins, 'backgrid:selected', this.selectModel, this)
            this.proteins.queryParams.seq = 1
            this.proteins.fetch()
        },


        selectModel: function(m, checked) {
            m.set({ isGridSelected: checked })
        },

        updateLabContacts: function() {
            this.ui.lc.html(this.labcontacts.opts())
            this.displayLabContact()
        },

        displayLabContact: function() {
            var lc = this.labcontacts.findWhere({ LABCONTACTID: this.ui.lc.val() })
            if (lc) {
                this.ui.ncn.text(lc.get('CARDNAME'))
                this.ui.nln.text(lc.get('LABNAME'))
                this.ui.nad.text(lc.get('ADDRESS'))
            } else {
                this.ui.ncn.text('')
                this.ui.nln.text('')
                this.ui.nad.text('')
            }
        },

        displayProposal: function() {
            var p = this.proposals.findWhere({ PROPOSAL: this.ui.prop.val() })
            if (p) {
                this.ui.ti.text(p.get('TITLE'))
                this.ui.st.text(p.get('ST'))
            } else {
                this.ui.ti.text('')
                this.ui.st.text('')
            }
        },


        getProposals: function(req, resp) {
            this.proposals.queryParams.s = req.term

            var self = this
            this.proposals.fetch().done(function() {
                resp(self.proposals.map(function(p) {
                    return {
                        label: p.get('PROPOSAL')+': '+p.get('TITLE'),
                        value: p.get('PROPOSAL'),
                    }
                }))
            })
        },

        selectProposal: function(e, ui) {
            this.labcontacts.queryParams.prop = ui.item.value
            this.labcontacts.fetch()
            this.ui.prop.val(ui.item.value)
            this.displayProposal()
        },


	// Registered Dewars can now belong to multiple proposals so dewar functions are not required
        onRender: function() {
            this.listenTo(this.labcontacts, 'sync', this.updateLabContacts)
            this.updateLabContacts()

            this.ui.prop.autocomplete({ 
                source: this.getProposals.bind(this), 
                select: this.selectProposal.bind(this)
            })


            var columns = [
                { label: '', cell: 'select-row', headerCell: 'select-all', editable: false },
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
                { name: 'MOLECULARMASS', label: 'Mass', cell: 'string', editable: false },
                { name: 'HASSEQ', label: 'Sequence', cell: 'string', editable: false },
                { name: 'PDBS', label: 'PDBs', cell: 'string', editable: false },
                { name: 'SCOUNT', label: 'Samples', cell: 'string', editable: false },
                { name: 'DCOUNT', label: 'Data Collections', cell: 'string', editable: false },
            ]


	    var validOnly = app.options.get('valid_components')
	    
            if (!validOnly) {
		this.rprots.show(new TableView({ 
                	collection: this.proteins, 
               		columns: columns, 
                	tableClass: 'proteins', 
                	filter: 's', 
                	loading: true, 
                	noSearchUrl: false,
                	backgrid: { emptyText: 'No proteins found' } 
            	}))
	    }


            var columns = [
                { label: '', cell: 'select-row', headerCell: 'select-all', editable: false },
                { name: 'CARDNAME', label: 'Card Name', cell: 'string', editable: false },
                { name: 'GIVENNAME', label: 'First Name', cell: 'string', editable: false },
                { name: 'FAMILYNAME', label: 'Surname', cell: 'string', editable: false },
                { name: 'ADDRESS', label: 'Address', cell: 'string', editable: false },
                { name: 'CITY', label: 'City', cell: 'string', editable: false },
                { name: 'POSTCODE', label: 'Postcode', cell: 'string', editable: false },
                { name: 'COUNTRY', label: 'Country', cell: 'string', editable: false },
                { name: 'PHONENUMBER', label: 'Phone No.', cell: 'string', editable: false },
                { name: 'LABNAME', label: 'Laboratory', cell: 'string', editable: false },
            ]

            this.rconts.show(new TableView({ 
                collection: this.contacts, 
                columns: columns, 
                tableClass: 'labcontacts', 
                filter: 's', 
                loading: true, 
                noSearchUrl: false,
                backgrid: { emptyText: 'No lab contacts found' } 
            }))

        },
    })


})
