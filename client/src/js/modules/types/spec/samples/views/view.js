define(['modules/samples/views/view',
    'modules/samples/views/sampleviewer',
    'utils/table',
	'templates/types/spec/samples/sample.html'], function(
        SampleView, 
        SampleViewer,
        table,
        template) {

	var SpecSampleView = SampleView.extend({
		template: template,

        subSampleColumns: [
            { label: '#', cell: table.TemplateCell, editable: false, template: '<%-(RID+1)%>' },
            { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%-(X2 ? "Region" : "Point")%>' },
            { name: 'X', label: 'X', cell: 'string', editable: false },
            { name: 'Y', label: 'Y', cell: 'string', editable: false },
            { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: true },
            { name: 'ES', label: 'Energy Scans', cell: 'string', editable: false },
            { name: 'XM', label: 'XFM Maps', cell: 'string', editable: false },
            { label: 'Status', cell: table.StatusCell, editable: false },
        ],

        regions: {
            rsubsamples: '.subsamples',
            history: '.history',
            imh: '.im_history',
            comps: '.components',
            rsampleviewer: '.rsampleviewer',
        },

        subSampleChanged: function() {
            this.dcs.fetch()
        },

        initialize: function() {
            SpecSampleView.__super__.initialize.apply(this)
            this.dcs.queryParams.ssid = this.getSubSample.bind(this)
        },

        getSubSample: function() {
            var sub = this.subsamples.findWhere({ isSelected: true })
            if (sub) {
                return sub.get('BLSUBSAMPLEID')
            }
        },

        onRender: function() {
            this.listenTo(this.subsamples, 'sync', this.showSampleViewer)
            SpecSampleView.__super__.onRender.apply(this)
            this.$el.find('.inspections').hide()
        },

        showSampleViewer: function() {
            this.rsampleviewer.show(new SampleViewer({ 
                sample: this.model,
                subsamples: this.subsamples
            }))
        }
	})

    return SpecSampleView

})
