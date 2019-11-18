define(['marionette',
    'backgrid',
    'modules/imaging/collections/imagers',
    'modules/imaging/collections/inspections',

    'collections/containers',
    'modules/shipment/views/containers',

    'views/filter',
    'views/table', 'utils/table',
    'templates/imaging/dashboard.html',
    ], function(Marionette, 
        Backgrid,
        Imagers, ContainerInspections,

        Containers, ContainersView,

        FilterView, TableView, table,
        template) {
    

    var ClickableRow = table.ClickableRow.extend({
        event: 'select:imager',
        argument: 'IMAGERID',
    })

    var ClickableRow2 = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        
        onClick: function(e) {
            if ($(e.target).is('i') || $(e.target).is('a') || $(e.target).hasClass('editable')) return
            if (this.model.get('PROP')) app.cookie(this.model.get('PROP'))
            app.trigger('container:show', this.model.get('CONTAINERID'), this.model.get('CONTAINERINSPECTIONID'))
        },
    })
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            imgrs: '.imagers',
            insp: '.inspections',
            insf: '.inspection_filter',
            ctrs: '.ctrs',
        },
        
        initialize: function(options) {
            this.imagers = new Imagers()
            this.imagers.fetch()

            this.inspections = new ContainerInspections()
            this.inspections.queryParams.all = 1
            this.inspections.queryParams.allStates = 1
            this.inspections.setSorting('BLTIMESTAMP', 1)
            this.inspections.fetch()

            this.containers = new Containers()
            this.containers.queryParams.imager = 1
            this.containers.queryParams.all = 1
            this.containers.fetch()

            this.listenTo(app, 'select:imager', this.selectImager, this)
        },

        selectImager: function(iid) {
            this.containers.queryParams.iid = iid
            this.containers.fetch()
        },
        
        
        onRender: function() {
            var columns = [{ name: 'NAME', label: 'Name', cell: 'string', editable: false },
                         { name: 'TEMPERATURE', label: 'Temperature', cell: 'string', editable: false },
                         { name: 'SERIAL', label: 'Serial', cell: 'string', editable: false },
                         { name: 'CAPACITY', label: 'Capacity', cell: 'string', editable: false },
                         { name: 'PUSAGE', label: 'Usage (%)', cell: 'string', editable: false },
            ]
                        
            this.imgrs.show(new TableView({ 
                collection: this.imagers, 
                columns: columns, 
                tableClass: 'imagers', 
                loading: true, pages: false, 
                backgrid: { emptyText: 'No imagers found', row: ClickableRow } 
            }))

            var columns = [{ name: 'PROP', label: 'Proposal', cell: 'string', editable: false },
                         { name: 'VISIT_NUMBER', label: 'Visit', cell: 'string', editable: false },
                         { name: 'CONTAINER', label: 'Container', cell: 'string', editable: false },
                         { name: 'CONTAINERID', label: 'Container ID', cell: 'string', editable: false },
                         { name: 'CONTAINERINSPECTIONID', label: 'Inspection ID', cell: 'string', editable: false },
                         { name: 'STATE', label: 'State', cell: 'string', editable: false },
                         { label: 'Adhoc', cell: table.TemplateCell, editable: false, template: "<%-SCHEDULECOMPONENTID ? 'No' : 'Yes' %>" },
                         { label: 'Manual', cell: table.TemplateCell, editable: false, template: "<%-MANUAL == '1' ? 'Yes':'No' %>" },
                         { name: 'INSPECTIONTYPE', label: 'Type', cell: 'string', editable: false },
                         { name: 'SCHEDULEDTIMESTAMP', label: 'Scheduled', cell: 'string', editable: false },
                         { name: 'BLTIMESTAMP', label: 'Started', cell: 'string', editable: false },
                         { name: 'DURATION', label: 'Took (m)', cell: 'string', editable: false },
                         { name: 'DWELL', label: 'Dwell (d)', cell: 'string', editable: false },
                         { name: 'AGE', label: 'Age (d)', cell: 'string', editable: false },
                         { label: 'Scored', cell: table.TemplateCell, editable: false, template: "<%-IMAGESSCORED == '1' ? 'Yes' : 'No' %>" },

            ]
                        
            this.insp.show(new TableView({ 
                collection: this.inspections, 
                columns: columns, 
                tableClass: 'inspections', 
                loading: true,
                filter: 's',
                backgrid: { emptyText: 'No inspections found', row: ClickableRow2 },
                noPageUrl: true,
            }))

            var filters = [
                { name: 'Completed', id: 'COMPLETED' },
                { name: 'Incomplete', id: 'INCOMPLETE' },
                { name: 'Scheduled', id: 'SCHEDULED' },
                { name: 'Adhoc', id: 'ADHOC' },
                { name: 'Manual', id: 'MANUAL' },
            ]

            this.ty = new FilterView({ collection: this.inspections, filters: filters, mobile: true, url: false, name: 'ty' })
            this.insf.show(this.ty)

            this.ctrs.show(new ContainersView({ collection: this.containers, params: {}, barcode: true }))
        },
        
    })
        
})
