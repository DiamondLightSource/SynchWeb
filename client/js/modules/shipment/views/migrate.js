define(['marionette',
    'collections/proposals',
    'collections/labcontacts',
    'collections/proteins',
    'modules/shipment/collections/dewarregistry',

    'views/table',
    'tpl!templates/shipment/migrate.html', 'jquery-ui'], 
    function(Marionette,
        Proposals, LabContacts, Proteins, DewarRegistry,
        TableView,
        template) {


    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',

        regions: {
            rprots: '.rproteins',
            rconts: '.rcontacts',
        },

        events: {
            'change @ui.dews': 'displayDewar',
            'change @ui.lc': 'displayLabContact',
            'click button[name=dewar]': 'migrateDewar',
            'click button[name=lc]': 'migrateContact',
            'click button[name=protein]': 'migrateProtein',
        },


        ui: {
            prop: 'input[name=PROPOSAL]',
            dews: 'select[name=DEWAR]',
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


        migrateDewar: function(e) {
            e.preventDefault()

            if (!this.ui.prop.val()) {
                app.alert({ message: 'You must select a proposal to migrate to' })
                return
            }

            if (!this.ui.dews.val()) {
                app.alert({ message: 'You must select a dewar to migrate' })
                return   
            }

            var d = this.dewars.findWhere({ FACILITYCODE: this.ui.dews.val() })
            var p = this.proposals.findWhere({ PROPOSAL: this.ui.prop.val() })

            if (p && d && this.ui.lc.val()) {
                d.set({
                    PROPOSALID: p.get('PROPOSALID'),
                    LABCONTACTID: this.ui.lc.val()
                })

                var self = this
                d.save(d.changedAttributes(), {
                    patch: true,
                    success: function() {
                        app.alert({ message: 'Dewar successfully migrated to: '+p.get('PROPOSAL') })
                        self.reset()
                        self.dewars.fetch()
                    }, 

                    failure: function() {
                        app.alert({ message: 'Something went wrong when trying to migrate that Dewar' })
                    },
                })
            }
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

            // Increasing list of dewars available to drop down
            // As of 2019-06 most recent proposals have less than 28 registered dewars
            this.dewars = new DewarRegistry([], {state: {pageSize: 9999}})
            this.dewars.fetch()

            this.labcontacts = new LabContacts()


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

        updateDewars: function() {
            this.ui.dews.html(this.dewars.opts())
            this.displayDewar()
        },

        displayDewar: function() {
            var d = this.dewars.findWhere({ FACILITYCODE: this.ui.dews.val() })
            if (d) {
                this.ui.cn.text(d.get('CARDNAME'))
                this.ui.ln.text(d.get('LABNAME'))
                this.ui.ad.text(d.get('ADDRESS'))
            } else {
                this.ui.cn.text('')
                this.ui.ln.text('')
                this.ui.ad.text('')
            }
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


        onRender: function() {
            this.listenTo(this.dewars, 'sync', this.updateDewars)
            this.listenTo(this.labcontacts, 'sync', this.updateLabContacts)
            this.updateDewars()
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

            this.rprots.show(new TableView({ 
                collection: this.proteins, 
                columns: columns, 
                tableClass: 'proteins', 
                filter: 's', 
                loading: true, 
                noSearchUrl: false,
                backgrid: { emptyText: 'No proteins found' } 
            }))


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
