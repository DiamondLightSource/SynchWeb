define([
    'marionette',

    'collections/bls',
    
    'modules/stats/views/beamline',
    
    'views/filter',
    'templates/stats/runs_overview.html',
    'jquery'
], function(Marionette, Beamlines, BeamlineStatsView, FilterView, template, $) {
    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        regions: {
            pills: '.beamline-pills',
            stats: '.beamline-stats'
        },
        showBeamlineStats: function(beamline) {
            // This regex replacement for the url is to allow the url of the page to match the selected beamline when the user selects a different beamline from the pill

            var regexExp = new RegExp(/\/bl\/.*/)
            var url = window.location.pathname
            if (beamline) {
                url = url.replace(regexExp, '')+'/bl/'+ beamline
                window.history.pushState({}, '', url)
                this.stats.show(new BeamlineStatsView({ bl: beamline }))
            } else {
                url = url.replace(regexExp, '')
                window.history.pushState({}, '', url)
                this.stats.currentView.destroy()
            }
        },
        showFilter: function() {
            this.beamlinePills = new FilterView({
                url: false,
                collection: null,
                name: 'bl',
                filters: this.beamlines.map(function(beamline) {
                    return { id: beamline.get('BEAMLINE'), name: beamline.get('BEAMLINE') }
                })
            })
        
            this.listenTo(this.beamlinePills, 'selected:change', this.showBeamlineStats.bind(this))
            this.pills.show(this.beamlinePills)
        },
        showBeamlineOverview: function() {
            var params = this.getOption('params')

            if (params && params.bl) {
                var hasBeamline = this.beamlines.findWhere({ BEAMLINE: params.bl })

                if (hasBeamline) {
                    this.showBeamlineStats(params.bl)
                }
            }
        },
        initialize: function() {
            this.beamlines = new Beamlines(null, { ty: app.type }) 
            this.ready = this.beamlines.fetch()
        },
        onRender: function() {
            $.when(this.ready).done(this.displayView.bind(this))
        },
        displayView: function() {
            this.showFilter()
            this.showBeamlineOverview()
        }
    })
})
