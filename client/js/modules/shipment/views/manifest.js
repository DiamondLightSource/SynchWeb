define(['marionette', 
    'collections/shipments',
    'views/table',
    'utils/table',
    'utils',
    'tpl!templates/shipment/manifest.html'], 
    function(Marionette, Shipments, TableView, table, utils, template) {
    
    var ClickableRow = table.ClickableRow.extend({
        event: 'shipment:show',
        argument: 'SHIPPINGID',
        cookie: true
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { rshps: '.shipments' },
        
        templateHelpers: function() {
            return {
                APIURL: app.apiurl
            }
        },

        events: {
            'click a.manifest': 'loadManifest',
        },

        ui: {
            month: 'select[name=month]',
        },

        loadManifest: function(e) {
            e.preventDefault()

            var month = '?month='+this.ui.month.val()
            var url = app.apiurl+'/pdf/manifest'+month

            utils.sign({
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
        },

        initialize: function() {
            this.shipments = new Shipments()
            this.shipments.queryParams.manifest = 1
            this.shipments.queryParams.all = 1
            this.shipments.fetch()
        },

        onRender: function() {
            this.ui.month.empty()
            var d = new Date()
            _.each([d.getFullYear(), d.getFullYear()-1], function(y) {
                _.each(_.range(1,13), function(m) {
                    var m = (m < 10 ? ('0'+m) : m)+'-'+y
                    this.ui.month.append('<option value="'+m+'">'+m+'</option>')
                }, this)
            }, this)


            var m = d.getMonth() +1
            var cur = (m < 10 ? ('0'+m) : m)+'-'+d.getFullYear()
            this.ui.month.val(cur)

            var columns = [
                { name: 'PROP', label: 'Proposal', cell: 'string', editable: false },
                { name: 'SHIPPINGNAME', label: 'Shipment', cell: 'string', editable: false },
                { name: 'DELIVERYAGENT_FLIGHTCODETIMESTAMP', label: 'Created', cell: 'string', editable: false },
                { name: 'DELIVERYAGENT_SHIPPINGDATE', label: 'Shipped', cell: 'string', editable: false },
                { label: 'Account', cell: table.TemplateCell, editable: false, template: '<% if (TERMSACCEPTED == "1") { %>Facility<% } else { %><%-DELIVERYAGENT_AGENTCODE%><% } %>' },
                { name: 'DELIVERYAGENT_FLIGHTCODE', label: 'Flightcode', cell: 'string', editable: false },
                { name: 'DELIVERYAGENT_PRODUCTCODE', label: 'Product', cell: 'string', editable: false },
                { name: 'DCOUNT', label: 'Pieces', cell: 'string', editable: false },
                { name: 'DELIVERYAGENT_BARCODE', label: 'Piece Barcodes', cell: 'string', editable: false },
                { name: 'WEIGHT', label: 'Weight', cell: 'string', editable: false },
                { name: 'DELIVERYAGENT_FLIGHTCODEPERSON', label: 'Creator', cell: 'string', editable: false },
                { label: 'Sender', cell: table.TemplateCell, editable: false, template: '<%-GIVENNAME%> <%-FAMILYNAME%> <%-LABNAME%>' },
                { label: 'Origin', cell: table.TemplateCell, editable: false, template: '<%-CITY%> <%-POSTCODE%> <%-COUNTRY%>' },
            ]
        
            if (app.mobile()) {
                _.each([2,3,5,6], function(v) {
                    columns[v].renderable = false
                })
            }

            this.rshps.show(new TableView({ collection: this.shipments, columns: columns, filter: 's', tableClass: 'shipments', backgrid: { row: ClickableRow, emptyText: 'No shipments found' } }))

        }
        
    })

})