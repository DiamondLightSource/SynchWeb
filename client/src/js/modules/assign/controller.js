define(['marionette',
    'models/visit',
    'collections/visits',
    
    'modules/assign/views/selectvisit',
    'modules/assign/views/assign',
    'modules/assign/views/scanassign',
    ], function(Marionette, Visit, Visits, SelectVisitView, AssignView, ScanAssignView) {
    
    var bc = { title: 'Assign Containers', url: '/assign' }
    
    var controller = {
        
        // Select visit to assign
        selectVisit: function(visit) {
            app.loading()
            var visits = new Visits(null, { queryParams: { next: 1 } })
            visits.fetch({
                success: function() {
                    app.bc.reset([bc])
                    app.content.show(new SelectVisitView({ collection: visits }))
                },
                error: function() {
                    app.bc.reset([bc, { title: 'Error' }])
                    app.message({ title: 'Couldn\'t load visit list', message: 'Couldn\'t load visit list please try again' })
                }
            })
        },
            
            
        // Assign containers to visit
        assignVisit: function(vis, page) {
            app.loading()
            app.cookie(vis.split('-')[0])
            var visit = new Visit({ VISIT: vis })
            
            visit.fetch({
                success: function() {
                    app.bc.reset([bc,
                        {title: vis, url: '/dc/visit/'+vis }]),
                    page = page ? parseInt(page) : 1
                    app.content.show(new AssignView({ visit: visit, page: page }))
                },
                error: function() {
                    app.bc.reset([bc, { title: 'Error' }])
                    app.message({ title: 'No such visit', message: 'The specified visit doesnt exist' })
                }
            })
        },

        // A simple assign page by scanning barcodes
        scanAssign: function(bl) {
            if (!app.staff) {
                app.message({ title: 'No access', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc, { title: 'Assign Containers' }])
            app.content.show(new ScanAssignView({ bl: bl }))
        },
    }
       
    app.addInitializer(function() {
        app.on('assign:visit', function(visit) {
            app.navigate('assign/visit/'+visit)
            controller.assign(visit)
        })
    })
       
    return controller
})