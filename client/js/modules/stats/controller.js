define(['marionette',
    'models/visit',
    'modules/stats/models/breakdown',
    'modules/stats/collections/pies',
    
    'modules/stats/views/visit',
    'modules/stats/views/proposal',
    
    'modules/types/gen/stats/views/visit',

    'modules/stats/views/overview',
    'modules/stats/views/overview2',
    'modules/stats/views/bloverview',
    'modules/stats/views/beamline'
    
    ], function(Marionette, Visit, BreakDown, Pies, VisitView, ProposalView, GenericVisitView, BAGOverviewView, BLSOverviewView, BeamlineHLOverview, BeamlineOverview) {
    
    var bc = { title: 'Visit Statistics', url: '/stats' }
    
    var controller = {
        
        // Visit Stats
        visit:  function(visit, from, to) {
            var prop = visit.replace(/-\d+/,'')
            app.cookie(prop)
            
            app.loading()
            var vis = new Visit({ VISIT: visit })
            vis.fetch({
                success: function() {
                    var breakdown = new BreakDown({ visit: visit })
                    breakdown.fetch({
                        success: function() {
                            var views = {
                                mx: VisitView,
                            }
                            
                            if (vis.get('TYPE') in views) view = views[vis.get('TYPE')]
                            else view = GenericVisitView
                            
                            app.bc.reset([bc, { title: app.prop, url: '/stats' }, { title: visit, url : '/dc/visit/'+visit }]),
                            app.content.show(new view({ model: vis, breakdown: breakdown, params: { from: parseInt(from), to: parseInt(to) } }))
                        },
                        error: function() {
                            app.bc.reset([bc, { title: 'No Data' }])
                            app.message({ title: 'No data', message: 'No data for this visit yet' })
                        },
                    })
                },
                error: function() {
                    app.bc.reset([bc, { title: 'Error' }])
                    app.message({ title: 'No such visit', message: 'Couldnt find the specified viist' })
                }
            })
        },
        
        // Proposal Stats
        proposal: function(page) {
            app.loading()
            if (!page) page = 1
            var pies = new Pies(null, { state: { pageSize: app.mobile() ? 5 : 12, currentPage: parseInt(page) } })
            pies.fetch({
                success: function() {
                    app.bc.reset([bc, { title: 'Proposal' }, { title: app.prop }]),
                    app.content.show(new ProposalView({ pies: pies }))
                },
                error: function() {
                
                }
            })
        },

        overview: function(s,page) {
            if (!app.user_can('all_prop_stats')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            if (!page) page = 1
            app.bc.reset([bc, { title: 'BAG Overview' }]),
            app.content.show(new BAGOverviewView({ params: { s: s } }))
        },

        bls_overview: function(s) {
            if (!app.user_can('all_prop_stats')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            app.bc.reset([bc, { title: 'Beamlines Overview' }]),
            app.content.show(new BLSOverviewView({ params: { s: s } }))
        },

        bl_overview: function(bl,s,page) {
            if (!app.user_can('all_prop_stats')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            app.bc.reset([bc, { title: bl+' Overview' }]),
            app.content.show(new BeamlineHLOverview({ bl: bl, params: { s: s } }))
        },


        beamline: function(bl, from, to) {
            if (!app.user_can('all_breakdown')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            app.bc.reset([bc, { title: 'Beamline Run Overview' }, { title: bl }]),
            app.content.show(new BeamlineOverview({ bl: bl, params: { from: parseInt(from), to: parseInt(to) } }))  
        } 
    }
        
       
    app.addInitializer(function() {
        app.on('stats:show', function(visit) {
            app.navigate('stats/visit/'+visit)
            controller.visit(visit)
        })

        app.on('pstats:show', function() {
            app.navigate('stats')
            controller.proposal()
        })

        app.on('bloverview:show', function(bl) {
            app.navigate('stats/overview/bl/'+bl)
            controller.bl_overview(bl)
        })
    })
       
    return controller
})