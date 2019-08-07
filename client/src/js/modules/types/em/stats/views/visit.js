define(['marionette',
        'backbone',
        'modules/fault/collections/faults',
        'modules/fault/views/list',
        'modules/stats/views/breakdown',
        'modules/stats/views/details',
        'modules/stats/views/pie',
        'modules/stats/views/hourlies',
        'modules/stats/views/ehc',

        'modules/blstats/models/histogram',
        'modules/blstats/views/histogram',
        'modules/types/em/stats/views/interframe',
    
        'templates/types/em/stats/visit.html'], function(Marionette, Backbone, Faults, FaultListView,
        BreakdownView, DetailsView, PieView, HourliesView, EHCLogView,
        Histogram, HistgramPlot, InterFramePlot,
        template) {


    var EMHistogram = Histogram.extend({
        urlRoot: '/em/ctf/histogram',
    })

    var DriftHistogram = Histogram.extend({
        urlRoot: '/em/mc/histogram',
    })



    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            bd: '.breakdown',
            det: '.details',
            call: '.callouts',
            ehc: '.ehclogs',
            hrs: '.hrs',
            flt: '.faults',

            rdefocus: '.defocus',
            rastimatigm: '.astigmatism',
            rresolution: '.resolution',
            rdrift: '.drift',
        },

        initialize: function() {
            this.defocus = new EMHistogram()
            this.astigmatism = new EMHistogram()
            this.resolution = new EMHistogram()
            this.drift = new DriftHistogram()


            this.defocus.fetch({
                data: {
                    visit: this.model.get('VISIT')
                }
            })

            this.astigmatism.fetch({
                data: {
                    visit: this.model.get('VISIT'),
                    ty: 'astigmatism',
                }
            })

            this.resolution.fetch({
                data: {
                    visit: this.model.get('VISIT'),
                    ty: 'resolution'
                }
            })

            this.drift.fetch({
                data: {
                    visit: this.model.get('VISIT'),
                }
            })
        },
        
        
        onShow: function() {
            this.bd.show(new BreakdownView({ model: this.getOption('breakdown'), scatters: true }))
            this.det.show(new DetailsView({ model: this.getOption('breakdown') }))
            if (app.staff) this.ehc.show(new EHCLogView({ visit: this.model.get('VISIT') }))
            
            this.pie = new PieView({ visit: this.model.get('VISIT'), el: this.$el.find('#visit_pie') })
            
            this.faults = new Faults(null, { queryParams: { visit: this.model.get('VISIT') } })
            this.faults.fetch()
            
            this.flt.show(new FaultListView({ collection: this.faults, filters: false, search: false }))

            this.rdefocus.show(new HistgramPlot({ collection: new Backbone.Collection([this.defocus]), title: 'Defocus Histogram' }))
            this.rastimatigm.show(new HistgramPlot({ collection: new Backbone.Collection([this.astigmatism]), title: 'Astigmatism Histogram' }))
            this.rresolution.show(new HistgramPlot({ collection: new Backbone.Collection([this.resolution]), title: 'Resolution Histogram' }))
            this.rdrift.show(new InterFramePlot({ collection: new Backbone.Collection([this.drift]), title: 'Drift vs. Frame difference' }))
        },
    })

})