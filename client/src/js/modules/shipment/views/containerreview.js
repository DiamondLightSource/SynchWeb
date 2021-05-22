define(['marionette',
    'backgrid',
    'views/table',
    'utils/table',
    'collections/samples',
    'templates/shipment/containerreview.html'
], function(Marionette,
    Backgrid,
    TableView,
    table,
    Samples,
    template) {

    var UCTemplate = '\
        <table class="reflow unitcell">\
            <thead>\
                <tr>\
                    <th>A</th>\
                    <th>B</th>\
                    <th>C</th>\
                    <th>&alpha;</th>\
                    <th>&beta;</th>\
                    <th>&gamma;</th>\
                </tr>\
            </thead>\
            <tbody>\
                <tr>\
                    <td><%-CELL_A%></td>\
                    <td><%-CELL_B%></td>\
                    <td><%-CELL_C%></td>\
                    <td><%-CELL_ALPHA%></td>\
                    <td><%-CELL_BETA%></td> \
                    <td><%-CELL_GAMMA%></td>\
                </tr>\
            </tbody>\
        </table>'

    var ActionCell = Backgrid.Cell.extend({
        className: 'nowrap',

        events: {
            'click a.reinspect': 'markInspect',
            'click a.skip': 'markSkip'
        },

        render: function() {
            if (app.staff) {
                this.$el.html('<a href="#" class="button reinspect" title="Mark sample for reinspection"><i class="fa fa-eye"></i></a>')
                this.$el.append(' <a href="#" class="button skip" title="Mark sample as skipped"><i class="fa fa-step-forward"></i></a>')
            }
            
            this.$el.append(' &nbsp; <a href="/samples/sid/'+this.model.get('BLSAMPLEID')+'" class="view button button-notext" title="View sample details"><i class="fa fa-search"></i> <span>View Sample</span></a>')
                
            return this
        }
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rsamples: '.rsamples'
        },

        initialize: function(options) {
            this.samples = new Samples(null, { state: { pageSize: 9999 } })
            this.samples.queryParams.cid = options.model.get('CONTAINERID')
            this.samples.fetch()
        },

        onRender: function() {
            var columns = [
                { name: 'LOCATION', label: 'Location', cell: 'string', editable: false },
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'ACRONYM', label: 'Protein', cell: 'string', editable: false },
                { name: 'COMMENTS', label: 'Comment', cell: 'string', editable: false },
                { name: 'SPACEGROUP', label: 'SG', cell: 'string', editable: false },
                { label: 'Unit Cell', cell: table.TemplateCell, template: UCTemplate, editable: false },
                { name: 'REQUIREDRESOLUTION', label: 'Required Res', cell: 'string', editable: false },
                { name: 'AIMEDRESOLUTION', label: 'Aimed Res', cell: 'string', editable: false },
                { name: 'COLLECTIONMODE', label: 'Mode', cell: 'string', editable: false },
                { name: 'PRIORITY', label: 'Priority', cell: 'string', editable: false },
                { name: 'EXPOSURETIME', label: 'Exposure (s)', cell: 'string', editable: false },
                { name: 'AXISRANGE', label: 'Axis Range', cell: 'string', editable: false },
                { name: 'AXISSTART', label: 'No Images', cell: 'string', editable: false },
                { name: 'TRASMISSION', label: 'Transmission', cell: 'string', editable: false },
                { name: 'DCRESOLUTION', label: 'Observed Res', cell: 'string', editable: false },
                { name: 'DCSPACEGROUP', label: 'Observed SG', cell: 'string', editable: false },
                { name: 'STAFFCOMMENTS', label: 'Staff Comments', cell: 'string', editable: app.staff },
                { label: 'Status', cell: table.StatusCell, editable: false },
                { label: '', cell: ActionCell, editable: false },
            ]

            this.rsamples.show(new TableView({
                collection: this.samples,
                columns: columns
            }))  

            this.listenTo(this.samples, 'change:STAFFCOMMENTS', this.saveStaffComment, this)
        }, 

        saveStaffComment: function(m, v) {
            m.save(m.changedAttributes(), { patch: true })
        },
    })
})
