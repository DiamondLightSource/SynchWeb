define(['marionette',
    'modules/mc/views/datacollections',
    'modules/mc/views/blend',
    'collections/datacollections',
    ], function(Marionette, DataCollectionsView, BlendView, DCs) {

    var bc = { title: 'Multicrystal Processing', url: '/mc' }
    
    var controller = {
        
        // List of data collections
        dcs:  function(visit, page, search) {
            app.loading()
            var dcs = new DCs(null, { queryParams: { visit: visit, s: search, t: 'fc' } })
            dcs.setPageSize(app.mobile() ? 5 : 16)

            page = page ? parseInt(page) : 1
            dcs.state.currentPage = page

            dcs.fetch().done(function() {
                app.bc.reset([bc, { title: visit, url: '/dc/visit/'+visit }, { title: 'Integrate Data Collections' }])
                app.content.show(new DataCollectionsView({ collection: dcs, params: { visit: visit, search: search } }))
            })
        },
        
        // Integrated dcs to blend
        blend: function(visit) {
            app.bc.reset([bc, { title: visit, url: '/dc/visit/'+visit }, { title: 'Blend Integrated Data Collections' }])
            app.content.show(new BlendView({ visit: visit }))
        },
            
    }
       
    return controller
})