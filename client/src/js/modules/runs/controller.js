define([
    'marionette',
    'collections/bls',
    'modules/runs/views/overview'
], function(Marionette, Beamlines, BeamlinesRunsOverview) {
    var bc = { title: 'Runs Overview For Beamlines', url: '/runs-overviews' }

    var controller = {
        fetchBeamlinesForRuns: function() {
            app.loading()

            if (!app.user_can('all_breakdown')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            var beamlines = new Beamlines(null, { ty: app.type })
            beamlines.fetch({
                success: function() {
                    app.bc.reset([bc])
                    app.content.show(new BeamlinesRunsOverview({ collection: beamlines }))
                },
                error: function() {
                    app.message({ title: 'Server Error', message: 'An error occurred while trying to fetch the beamline data' })
                }
            })
        }
    }

    return controller
})
