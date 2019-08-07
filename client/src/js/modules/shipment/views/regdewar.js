define(['marionette',
    'backbone',
    'backgrid', 
    'modules/shipment/collections/dewarhistory',
    'modules/shipment/collections/dewarreports',
    'collections/dewars',
    'collections/labcontacts',

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
    Dewars,
    LabContacts,

    TableView,
    table,
    Editable, XHRImage, template, $){


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
        },

        initialize: function(options) {
            Backbone.Validation.bind(this)

            this.history = new DewarHistory()

            var columns = [
                //{ name: 'VISIT', label: 'First Exp', cell: 'string', editable: false },
                //{ label: 'First Exp', cell: table.TemplateCell, editable: false, template: '<%-VISIT%> (<%-BL%>)' },
                //{ name: 'LOCALCONTACT', label: 'Local Contact', cell: 'string', editable: false },
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
            this.dewars.fetch().done(this.getHistory.bind(this))

            var columns = [
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
                    columns[v].renderable = false
                })
            }
        
            this.dewtable = new TableView({ collection: this.dewars, 
                columns: columns, tableClass: 'dewars', loading: true, 
                backgrid: { emptyText: 'No dewars found' }
            })

            this.reports = new DewarReports(null, { queryParams: { FACILITYCODE: this.model.get('FACILITYCODE') } })
            this.listenTo(this.reports, 'sync', this.setupPopups, this)
            this.reports.fetch()

            var columns = [
                { name: 'BLTIMESTAMP', label: 'Time / Date', cell: 'string', editable: false },
                { name: 'REPORT', label: 'Report', cell: 'string', editable: false },
                { label: 'Image', cell: ImageCell, editable: false },
            ]

            this.reptable = new TableView({ collection: this.reports, 
                columns: columns, tableClass: 'samples', loading: true, 
                backgrid: { emptyText: 'No reports found' }
            })

        },

        setupPopups: function() {
            this.$el.find('td a.popup').magnificPopup({ type: 'image' })
        },


        getHistory: function() {
            this.history.queryParams.did = this.dewars.at(0).get('DEWARID')
            this.history.fetch()
        },

        
        
        onRender: function() {  
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('PURCHASEDATE', 'date')

            var self = this
            this.contacts = new LabContacts(null, { state: { pageSize: 9999 } })
            this.contacts.fetch().done(function() {
                edit.create('LABCONTACTID', 'select', { data: self.contacts.kv() })
            })

            this.hist.show(this.histtable)
            this.dew.show(this.dewtable)
            this.rep.show(this.reptable)

            if (app.staff) {
                edit.create('NEWFACILITYCODE')
            }
        },
        
    })

})