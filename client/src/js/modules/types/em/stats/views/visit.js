define([
    'marionette',
    'backbone',
    'modules/fault/collections/faults',
    'modules/fault/views/list',
    'modules/stats/views/breakdown',
    'modules/stats/views/details',
    'modules/stats/views/pie',
    // 'modules/stats/views/hourlies',
    'modules/stats/views/ehc',
    'modules/blstats/models/histogram',
    'modules/blstats/views/histogram',
    'modules/types/em/stats/views/interframe',
    'templates/types/em/stats/visit.html'
], function(
    Marionette,
    Backbone,
    Faults,
    FaultListView,
    BreakdownView,
    DetailsView,
    PieView,
    // HourliesView,
    EHCLogView,
    Histogram,
    HistogramPlot,
    InterFramePlot,
    template
) {
    return Marionette.LayoutView.extend({
        'template': template,
        'className': 'content',
        'regions': {
            'breakdown': '.breakdown',
            'det': '.details',
            'call': '.callouts',
            'ehc': '.ehclogs',
            'hrs': '.hrs',
            'faults': '.faults',
            'rDefocus': '.defocus',
            'rAstigmatism': '.astigmatism',
            'rResolution': '.resolution',
            'rDrift': '.drift',
        },
        'onShow': function() {
            this.breakdown.show(new BreakdownView({
                'model': this.getOption('breakdown'),
                'scatters': true
            }))

            this.det.show(new DetailsView({
                'model': this.getOption('breakdown')
            }))

            if (app.staff) {
                this.ehc.show(new EHCLogView({
                    'visit': this.model.get('VISIT')
                }))
            }

            this.pie = new PieView({
                'visit': this.model.get('VISIT'),
                'el': this.$el.find('#visit_pie')
            })

            this.faultsModel = new Faults(null, {
                'queryParams': {
                    'visit': this.model.get('VISIT')
                }
            })
            this.faultsModel.fetch()
            this.faults.show(new FaultListView({
                'collection': this.faultsModel,
                'filters': false,
                'search': false
            }))

            var EMHistogram = Histogram.extend({
                'urlRoot': '/em/stats/ctf',
            })

            this.defocus = new EMHistogram()
            this.defocus.fetch({
                'data': {
                    'visit': this.model.get('VISIT'),
                    'ty': 'defocus',
                }
            })
            this.rDefocus.show(new HistogramPlot({
                'collection': new Backbone.Collection([this.defocus]),
                'title': 'Defocus Histogram'
            }))

            this.astigmatism = new EMHistogram()
            this.astigmatism.fetch({
                'data': {
                    'visit': this.model.get('VISIT'),
                    'ty': 'astigmatism',
                }
            })
            this.rAstigmatism.show(new HistogramPlot({
                'collection': new Backbone.Collection([this.astigmatism]),
                'title': 'Astigmatism Histogram'
            }))

            this.resolution = new EMHistogram()
            this.resolution.fetch({
                'data': {
                    'visit': this.model.get('VISIT'),
                    'ty': 'resolution'
                }
            })
            this.rResolution.show(new HistogramPlot({
                'collection': new Backbone.Collection([this.resolution]),
                'title': 'Resolution Histogram'
            }))

            var DriftHistogram = Histogram.extend({
                urlRoot: '/em/stats/mc',
            })
            this.drift = new DriftHistogram()
            this.drift.fetch({
                'data': {
                    'visit': this.model.get('VISIT'),
                }
            })
            this.rDrift.show(new InterFramePlot({
                'collection': new Backbone.Collection([this.drift]),
                'title': 'Drift vs. Frame difference'
            }))
        },
    })
})
