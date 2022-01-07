define(['backbone',
    'marionette',
    'backgrid',
    'views/table',
    'utils/table',
    'collections/samples',
    'templates/shipment/containerreview.html'
], function(Backbone,
    Marionette,
    Backgrid,
    TableView,
    table,
    Samples,
    template) {

    var QueueStatusCell = Backgrid.Cell.extend({
        render: function() {
            var st = this.model.escape('LASTQUEUESTATUS')
            if (st) this.$el.html('<ul class="status"><li class="'+st+'"></li></ul>')
            
            return this
        }
    })

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
            'click a.reinspect': 'markReinspect',
            'click a.skip': 'markSkip',
            'click a.completed': 'markCompleted'
        },

        render: function() {
            if (app.staff && this.model.get('CONTAINERQUEUESAMPLEID')) {
                var cs = this.model.get('LASTQUEUESTATUS')
                if (cs != 'reinspect') this.$el.html('<a href="#" class="button reinspect" title="Mark sample for reinspection"><i class="fa fa-eye"></i></a>')
                if (cs != 'skipped') this.$el.append(' <a href="#" class="button skip" title="Mark sample as skipped"><i class="fa fa-step-forward"></i></a>')
                if (cs != 'completed') this.$el.append(' <a href="#" class="button completed" title="Mark sample as completed"><i class="fa fa-check"></i></a>')
            }
            
            this.$el.append(' &nbsp; <a href="/samples/sid/'+this.model.get('BLSAMPLEID')+'" class="view button button-notext" title="View sample details"><i class="fa fa-search"></i> <span>View Sample</span></a>')
                
            return this
        },

        markReinspect: function(e) {
            e.preventDefault()
            this.doMarkSample('reinspect')
        },

        markSkip: function(e) {
            e.preventDefault()
            this.doMarkSample('skipped')
        },

        markCompleted: function(e) {
            e.preventDefault()
            this.doMarkSample('completed')
        },

        doMarkSample: function(status) {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/sample/queue/'+this.model.get('CONTAINERQUEUESAMPLEID'),
                data: JSON.stringify({
                    prop: app.prop,
                    QUEUESTATUS: status
                }),
                type: 'PATCH',
                success: function() {
                    app.alert({ className: 'message notify', message: 'Sample queue status upated', scrollTo: false })
                    self.model.collection.fetch()
                },
                error: function() {
                    app.alert({ message: 'Something went wrong updating this samples queue status, please try again' })
                },
                
            })
        },
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
                { name: 'NUMBEROFIMAGES', label: 'No. Images', cell: 'string', editable: false },
                { name: 'TRASMISSION', label: 'Transmission', cell: 'string', editable: false },
                { name: 'DCRESOLUTION', label: 'Observed Res', cell: 'string', editable: false },
                { name: 'DCSPACEGROUP', label: 'Observed SG', cell: 'string', editable: false },
                { name: 'STAFFCOMMENTS', label: 'Staff Comments', cell: 'string', editable: app.staff },
                { label: 'Status', cell: table.StatusCell, editable: false },
                { label: 'Queue', cell: QueueStatusCell, editable: false },
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
