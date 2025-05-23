define(['marionette',
    'backbone',
    'backgrid', 
    'modules/shipment/collections/dewarhistory',
    'modules/shipment/collections/dewarreports',
    'modules/shipment/collections/dewarproposals',
    'collections/dewars',

    'views/table',
    'utils/table',
    'utils/editable',
    'utils/xhrimage',
    'templates/shipment/regdewar.html',
    'jquery',
    'jquery.mp',
    ], function(Marionette,
    Backbone,
    Backgrid,
    DewarHistory,
    DewarReports,
    DewarProposals,
    Dewars,

    TableView,
    table,
    Editable, XHRImage, template, $){

    var DeleteCell = Backgrid.Cell.extend({
        events: {
            'click a.delete': 'deleteProposal',
        },
        
        deleteProposal: function(e) {
            e.preventDefault()
            this.model.destroy()
        },

        render() {
            this.$el.empty()
            this.$el.html('<a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a></span>')
            return this
        }
    })

    var ImageCell = Backgrid.Cell.extend({ 
        render: function() {
            this.$el.empty()
            this.$el.html('<a class="popup" href="'+app.apiurl+'/image/dr/'+this.model.escape('DEWARREPORTID')+'"><img class="img" alt="attachment" /></a>')

            var self = this
            var img = new XHRImage()
            img.onload = function() {
                self.$el.find('img').attr('src', img.src)
            }
            img.load(app.apiurl+'/image/dr/'+this.model.get('DEWARREPORTID'))

            return this
        }
    })
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            hist: '.history',
            dew: '.dewars',
            rep: '.reports',
            props: '.proposals',
        },

        initialize: function(options) {
            Backbone.Validation.bind(this)

            this.history = new DewarHistory()

            var columns = [
                { label: 'First Exp', cell: table.TemplateCell, editable: false, template: '<%-VISIT%> (<%-BL%>)' },
                { name: 'LOCALCONTACT', label: 'Local Contact', cell: 'string', editable: false },
                { name: 'ARRIVAL', label: 'Date', cell: 'string', editable: false },
                { name: 'DEWARSTATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'STORAGELOCATION', label: 'Location', cell: 'string', editable: false }
            ]
        
            if (app.mobile()) {
                _.each([1], function(v) {
                    columns[v].renderable = false
                })
            }
        
            this.histtable = new TableView({ collection: this.history, 
                columns: columns, tableClass: 'history', loading: true, 
                backgrid: { emptyText: 'No history found' }
            })

            this.dewars = new Dewars(null, { FACILITYCODE: this.model.get('FACILITYCODE') })
            this.dewars.queryParams.all = 1
            this.dewars.fetch().done(this.getHistory.bind(this))

            var columns2 = [
                { name: 'CODE', label: 'Name', cell: 'string', editable: false },
                { label: 'Shipment', cell: table.TemplateCell, editable: false, template: '<a href="/shipments/sid/<%-SHIPPINGID%>"><%-SHIPPINGNAME%></a>' },
                { name: 'EXP', label: 'First Exp', cell: 'string', editable: false },
                { name: 'FIRSTEXPERIMENTST', label: 'First Exp Start', cell: 'string', editable: false },
                { name: 'LOCALCONTACT', label: 'Local Contact', cell: 'string', editable: false },
                { name: 'DEWARSTATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'STORAGELOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'TRACKINGNUMBERTOSYNCHROTRON', label: 'Track # to', cell: 'string', editable: false },
                { name: 'TRACKINGNUMBERFROMSYNCHROTRON', label: 'Track # from', cell: 'string', editable: false }
            ]
        
            if (app.mobile()) {
                _.each([0,1,3,6,7], function(v) {
                    columns2[v].renderable = false
                })
            }
        
            this.dewtable = new TableView({ collection: this.dewars, 
                columns: columns2, tableClass: 'dewars', loading: true,
                backgrid: { emptyText: 'No dewars found' }
            })

            this.reports = new DewarReports(null, { queryParams: { FACILITYCODE: this.model.get('FACILITYCODE') } })
            this.listenTo(this.reports, 'sync', this.setupPopups, this)
            this.reports.fetch()

            var columns3 = [
                { name: 'BLTIMESTAMP', label: 'Time / Date', cell: 'string', editable: false },
                { name: 'REPORT', label: 'Report', cell: 'string', editable: false },
                { label: 'Image', cell: ImageCell, editable: false },
            ]

            this.reptable = new TableView({ collection: this.reports, 
                columns: columns3, tableClass: 'samples', loading: true,
                backgrid: { emptyText: 'No reports found' }
            })

            this.proposals = new DewarProposals()
            this.proposals.queryParams.DEWARREGISTRYID = this.model.get('DEWARREGISTRYID')
            this.proposals.fetch()

            var columns4 = [
                { name: 'PROPOSAL', label: 'Proposal', cell: 'string', editable: false },
                { name: 'GIVENNAME', label: 'Given Name', cell: 'string', editable: false },
                { name: 'FAMILYNAME', label: 'Family Name', cell: 'string', editable: false },
                { name: 'LABNAME', label: 'Lab Name', cell: 'string', editable: false },
                { name: 'ADDRESS', label: 'Address', cell: 'string', editable: false },
            ]

            if (app.staff) {
                columns4.push({ name: '', label: '', cell: DeleteCell, editable: false })
            }

            this.proptable = new TableView({
                collection: this.proposals,
                columns: columns4,
            })

        },

        setupPopups: function() {
            this.$el.find('td a.popup').magnificPopup({ type: 'image' })
        },


        getHistory: function() {
            // Is there an existing history for this dewar code?
            var dewar = this.dewars.at(0)
            if (dewar) {
                this.history.queryParams.FACILITYCODE = this.model.get('FACILITYCODE')
                if (app.staff) {
                    this.history.queryParams.all = 1
                }
                this.history.fetch()
            } else {
                console.log("No dewar history for this registered dewar")
            }
        },

        
        
        onRender: function() {  
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('PURCHASEDATE', 'date')
            edit.create('MANUFACTURERSERIALNUMBER', 'text')

            this.hist.show(this.histtable)
            this.dew.show(this.dewtable)
            this.rep.show(this.reptable)
            this.props.show(this.proptable)

            if (app.staff) {
                edit.create('NEWFACILITYCODE')
            }
        },
        
    })

})
