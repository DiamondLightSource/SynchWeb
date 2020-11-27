define(['marionette',
    'collections/datacollections', 
    'modules/dc/views/getdcview',
    'moment',
    'templates/dc/beamlineactivity.html'
    ], function(
        Marionette,
        DCCol,
        GetView,
        moment,
        template
    ) {

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        templateHelpers: function() {
            return {
                bl: this.getOption('bl'),
            }
        },

        regions: {
            rdcs: '.rdcs'
        },

        ui: {
            date: 'input[name=date]',
            spinner: '.fa-spinner'
        },

        events: {
            'change @ui.date': 'selectDate'
        },

        getDate: function() {
            return this.ui.date.val().replace(/-/g, '')
        },

        selectDate: function() {
            this.dcs.fetch()
        },

        initialize: function(options) {
            this.dcs = new DCCol(null, {queryParams: { s: options.params.search, t: options.params.type }})
            this.dcs.queryParams.bl = options.bl
            this.dcs.state.pageSize = app.mobile() ? 5 : 15
            this.dcs.state.currentPage = options.params.page ? parseInt(options.params.page) : 1
            this.dcs.queryParams.dmy = this.getDate.bind(this)

            this.listenTo(this.dcs, 'request', this.displaySpinner);
            this.listenTo(this.dcs, 'sync', this.removeSpinner);
            this.listenTo(this.dcs, 'error', this.removeSpinner);
        },

        displaySpinner: function() {
            this.ui.spinner.show()
        },

        removeSpinner: function() {
            this.ui.spinner.hide()
        },

        onRender: function() {
            this.ui.date.datepicker({ dateFormat: "dd-mm-yy" })
            this.ui.date.val(moment().format('DD-MM-YYYY')).trigger('change')

            this.rdcs.show(GetView.DCView.get(this.getOption('type'), { collection: this.dcs, params: this.getOption('params') }))
        }
    })

})