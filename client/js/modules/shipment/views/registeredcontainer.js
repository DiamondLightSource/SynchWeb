define(['marionette',
    'backgrid',
    'modules/shipment/collections/containerhistory',
    'modules/shipment/collections/containerreports',
    'modules/shipment/collections/containerproposals',
    'collections/containers',
    'modules/shipment/models/containerreport',

    'views/form',
    'views/table',
    'utils/table',
    'utils/editable',
    'utils/xhrimage',
    'templates/shipment/registeredcontainer.html',
    'templates/shipment/rcontaineraddreport.html',
    'jquery',
    'jquery.mp',
    ], function(Marionette,
    Backgrid,
    ContainerHistory,
    ContainerReports,
    ContainerProposals,
    Containers,
    ContainerReport,

    FormView,
    TableView,
    table,
    Editable, XHRImage, template, addreport, $){


    var ProposalView = Marionette.ItemView.extend({
        tagName: 'li',
        // template: _.template('<%-PROPOSAL%>'),
        template: _.template('<%-PROPOSAL%> <% if (STAFF) { %><span class="r"><a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a></span><% } %>'),
        
        templateHelpers: function () {
            return { STAFF: app.staff }
        },

        events: {
            'click a.delete': 'deleteProposal',
        },
        
        deleteProposal: function(e) {
            this.model.destroy()
        },
    })


    var ProposalsView = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'visits clearfix',
        childView: ProposalView,
    })


    var ImageCell = Backgrid.Cell.extend({ 
        render: function() {
            this.$el.empty()

            if (this.model.get('ATTACHMENT') == '1') {
                this.$el.html('<a class="popup" href="'+app.apiurl+'/image/cr/'+this.model.get('CONTAINERREPORTID')+'"><img class="img" alt="attachment" /></a>')

                var self = this
                var img = new XHRImage()
                img.onload = function() {
                    self.$el.find('img').attr('src', img.src)
                }
                img.load(app.apiurl+'/image/cr/'+this.model.get('CONTAINERREPORTID'))
            }

            return this
        }
    })

    var ClickableRow = table.ClickableRow.extend({
        event: 'container:show',
        argument: 'CONTAINERID',
        cookie: true,
    })

    var AddReport = FormView.extend({
        template: addreport,

        ui: {
            report: 'textarea[name=REPORT]',
            att: 'input[name=ATTACHMENT]'
        },

        createModel: function() {
            this.model = new ContainerReport({ CONTAINERREGISTRYID: this.getOption('CONTAINERREGISTRYID') })
        },

        success: function() {
            this.trigger('report:added')
        },

        failure: function() {
            app.alert('Something went wrong registering that report, please try again')
        },

        // Syphon does not play nice with attachments
        onSubmit: function(e) {
            if ($(e.target).closest('.editable').length) return

            e.preventDefault()
            
            this.model.set({
                REPORT: this.ui.report.val(),
                ATTACHMENT: this.ui.att[0].files[0]
            })

            this.model.validate()
            var valid = this.model.isValid(true);
            app.log('submitted', valid, this.model)
            
            if (valid) {
                var self = this
                this.$el.find('form').addClass('loading')
                if (this.beforeSave) this.beforeSave.call(this)
                this.model.save({}, {
                    success: function(model, response, options) {
                        self.$el.find('form').removeClass('loading')
                        self.success(model, response, options)
                    },
                    error: function(model, response, options) {
                        self.$el.find('form').removeClass('loading')
                        self.failure(model, response, options)
                    }
                })
            }
        },
    })
            
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            hist: '.history',
            prs: '.proposals',
            con: '.conts',
            rep: '.reports',
            props: '.props',
            ar: 'div.addreport'
        },

        templateHelpers: function () {
            return { STAFF: app.staff }
        },

        initialize: function(options) {
            Backbone.Validation.bind(this)

            this.history = new ContainerHistory()


            var columns = [
                { name: 'BLTIMESTAMP', label: 'Date', cell: 'string', editable: false },
                { name: 'STATUS', label: 'Status', cell: 'string', editable: false },
                { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'BEAMLINENAME', label: 'Beamline', cell: 'string', editable: false },
            ]
        
            this.histtable = new TableView({ collection: this.history, 
                columns: columns, tableClass: 'history', loading: true, 
                backgrid: { emptyText: 'No history found' }
            })

            this.containers = new Containers()
            this.containers.queryParams.CONTAINERREGISTRYID = this.model.get('CONTAINERREGISTRYID')
            this.containers.queryParams.all = 1
            this.containers.fetch().done(this.getHistory.bind(this))

            var columns = [
                // { label: 'Name', cell: table.TemplateCell, editable: false, template: '<a href="/containers/cid/<%-CONTAINERID%>"><%-NAME%></a>' },
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'BLTIMESTAMP', label: 'Created', cell: 'string', editable: false },
                { name: 'CONTAINERSTATUS', label: 'Status', cell: 'string', editable: false },
                // { name: 'DEWAR', label: 'Dewar', cell: 'string', editable: false },
                { label: 'Shipment', cell: table.TemplateCell, editable: false, template: '<a href="/shipments/sid/<%-SHIPPINGID%>"><%-SHIPMENT%></a>' },
                { name: 'DCCOUNT', label: '# DCs', cell: 'string', editable: false },
                { name: 'DCVISITS', label: 'Visits', cell: 'string', editable: false },
                { name: 'DCDATES', label: 'Dates', cell: 'string', editable: false },
            ]
        
            if (app.mobile()) {
                _.each([4,6], function(v) {
                    columns[v].renderable = false
                })
            }
        
            this.conttable = new TableView({ collection: this.containers, 
                columns: columns, tableClass: 'containers', loading: true, 
                backgrid: { row: ClickableRow, emptyText: 'No containers found' }
            })

            this.reports = new ContainerReports(null, { queryParams: { CONTAINERREGISTRYID: this.model.get('CONTAINERREGISTRYID') } })
            this.listenTo(this.reports, 'sync', this.setupPopups, this)
            this.reports.fetch()

            var columns = [
                { name: 'RECORDTIMESTAMP', label: 'Time / Date', cell: 'string', editable: false },
                { name: 'REPORTER', label: 'Reporter', cell: 'string', editable: false },
                { name: 'REPORT', label: 'Report', cell: 'string', editable: false },
                { label: 'Image', cell: ImageCell, editable: false },
            ]

            this.reptable = new TableView({ collection: this.reports, 
                columns: columns, tableClass: 'reports', loading: true, 
                backgrid: { emptyText: 'No reports found' }
            })

            this.proposals = new ContainerProposals()
            this.proposals.queryParams.CONTAINERREGISTRYID = this.model.get('CONTAINERREGISTRYID')
            this.proposals.fetch()

        },

        setupPopups: function() {
            this.$el.find('td a.popup').magnificPopup({ type: 'image' })
        },


        getHistory: function() {
            this.history.queryParams.CONTAINERREGISTRYID = this.model.get('CONTAINERREGISTRYID')
            this.history.queryParams.all = 1
            this.history.fetch()
        },

        
        
        onRender: function() {  
            this.hist.show(this.histtable)
            this.con.show(this.conttable)
            this.rep.show(this.reptable)
            this.props.show(new ProposalsView({ collection: this.proposals }))
            if (app.staff) {
                var edit = new Editable({ model: this.model, el: this.$el })
                edit.create('COMMENTS', 'text');

                this.ar.show(new AddReport({ CONTAINERREGISTRYID: this.model.get('CONTAINERREGISTRYID') }))
            }
        },
        
    })

})