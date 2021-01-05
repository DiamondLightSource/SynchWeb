define([
    'marionette',

    'collections/bls',
    
    'modules/stats/views/beamline',
    
    'views/filter',
    'templates/runs/overview.html',
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
        initialize: function() {
            this.beamlines = new Beamlines(null, { ty: app.type })
            this.ready = this.beamlines.fetch()
        },
        onRender: function() {
            $.when(this.ready).done(this.showFilter.bind(this))
        }
    })
})
