define(['marionette',

    'modules/shipment/collections/dewarhistory',
    'collections/dewars',
    'collections/labcontacts',

    'views/table',
    'utils/table',
    'utils/editable',
    'tpl!templates/shipment/regdewar.html'], function(Marionette,
        
    DewarHistory,
    Dewars,
    LabContacts,

    TableView,
    table,
    Editable, template){
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            hist: '.history',
            dew: '.dewars',
        },


        initialize: function(options) {
            Backbone.Validation.bind(this)

            this.history = new DewarHistory(null, { queryParams: { FACILITYCODE: this.model.get('FACILITYCODE') } })
            this.history.fetch()

            var columns = [
                { name: 'VISIT', label: 'Visit', cell: 'string', editable: false },
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
            this.dewars.fetch()


            var columns = [
                { name: 'CODE', label: 'Name', cell: 'string', editable: false },
                { label: 'Shipment', cell: table.TemplateCell, editable: false, template: '<a href="/shipments/sid/<%=SHIPPINGID%>"><%=SHIPPINGNAME%></a>' },
                { name: 'EXP', label: 'First Exp', cell: 'string', editable: false },
                { name: 'DEWARSTATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'STORAGELOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'TRACKINGNUMBERTOSYNCHROTRON', label: 'Track # to', cell: 'string', editable: false },
                { name: 'TRACKINGNUMBERFROMSYNCHROTRON', label: 'Track # from', cell: 'string', editable: false }
            ]
        
            if (app.mobile()) {
                _.each([1,3], function(v) {
                    columns[v].renderable = false
                })
            }
        
            this.dewtable = new TableView({ collection: this.dewars, 
                columns: columns, tableClass: 'dewars', loading: true, 
                backgrid: { emptyText: 'No dewars found' }
            })

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
        },
        
    })

})