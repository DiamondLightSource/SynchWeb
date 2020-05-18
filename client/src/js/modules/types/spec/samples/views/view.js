define(['modules/samples/views/view',
    'modules/samples/views/sampleviewer',
	'templates/types/spec/samples/sample.html'], function(
        SampleView, 
        SampleViewer,
        template) {

	var SpecSampleView = SampleView.extend({
		template: template,

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
