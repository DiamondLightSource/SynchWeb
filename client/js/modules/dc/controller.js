define(['marionette', 'modules/dc/datacollections', 'modules/dc/views/imageviewer', 'modules/dc/views/mapmodelview', 'modules/dc/views/summary', 'models/datacollection', 'collections/datacollections', 'models/sample', 'models/visit', 'models/proposal',
    'modules/dc/views/samplechangerfull',
    'modules/dc/views/queuebuilder',
    
    'modules/types/gen/dc/datacollections',
    'modules/types/tomo/dc/datacollections',
    'modules/types/em/dc/datacollections',
    
    ], function(Marionette, DCList, ImageViewer, MapModelViewer, Summary, DataCollection, DCCol, Sample, Visit, Proposal, SampleChangerView, QueueBuilder, GenericDCList, TomoDCList, EMDCLIst) {
    
    var bc = { title: 'Data Collections', url: '/dc' }
    
  var controller = {
      
    // Data Collection List
    dc_list: function(visit, dcg, page, search, type, id) {
        console.log('args to dclist', arguments)
        //console.log('dc list', visit, search, type)
        app.loading()
          
        if (visit) {
            app.cookie(visit.split('-')[0])
            model = new Visit({ VISIT: visit })
            error = 'The specified visit does not exist'
        } else {
            model = new Proposal({ PROPOSAL: app.prop })
            error = 'The specified proposal does not exist'
        }
        
        model.fetch({
            success: function() {
                app.bc.reset(visit ? [bc, { title: model.get('BL') }, { title: visit }] : [bc, { title: app.prop }])
                
                page = page ? parseInt(page) : 1
                console.log('page', page)
                var dcs = new DCCol(null, { queryParams: { visit: visit, s: search, t: type, id: id, dcg: dcg } })
                dcs.setPageSize(app.mobile() ? 5 : 15)
                dcs.state.currentPage = page
                dcs.fetch().done(function() {
                    var views = {
                        mx: DCList,
                        gen: GenericDCList,
                        tomo: TomoDCList,
                        em: EMDCLIst,
                    }
                    
                    if (model.get('TYPE') in views) view = views[model.get('TYPE')]
                    else view = GenericDCList
                    
                    app.content.show(new view({ collection: dcs,  params: { visit: visit, search: search, type: type, id: id, dcg: dcg }, model: model }))
                })
            },
            
            error: function() {
                app.bc.reset([bc])
                app.message({ title: error, message: error })
            },
        })
    },
      
      
    // Diffraction Image Viewer
    di_viewer: function(id) {
      console.log('di viewer')
      var dc = new DataCollection({ ID: id })
        dc.fetch({
            success: function() {
                app.bc.reset([bc,
                    {title: app.prop+'-'+dc.get('VN'), url: '/dc/visit/'+app.prop+'-'+dc.get('VN') },
                    { title: 'Image Viewer' },
                    { title: dc.get('FILETEMPLATE') }])
                app.content.show(new ImageViewer({ model: dc }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Image Viewer' }])
                app.message({ title: 'No such data collection', message: 'The specified data collection doesnt exist' })
            }
        })
    },
      
      
    // Map / Model Viewer
    mapmodelviewer: function(id, ty) {
        if (!ty) ty = 'dimple'
        var dc = new DataCollection({ ID: id })
        dc.fetch({
            success: function() {
                app.bc.reset([bc,
                    {title: app.prop+'-'+dc.get('VN'), url: '/dc/visit/'+app.prop+'-'+dc.get('VN') },
                    { title: 'Map/Model Viewer' },
                    { title: dc.get('FILETEMPLATE') }])
                app.content.show(new MapModelViewer({ ty: ty, model: dc }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Map/Model Viewer' }])
                app.message({ title: 'No such data collection', message: 'The specified data collection doesnt exist' })
            }
        })
    },
      
      
    // Data Collection Summary
    summary: function(visit) {
        console.log('summary')
        app.loading()
        var vis = new Visit({ VISIT: visit })
        vis.fetch({
            success: function() {
                app.bc.reset([bc, { title: 'Summary' }, { title: visit }])
                
                var dcs = new DCCol(null, { queryParams: { visit: visit, t: 'fc', pp: app.mobile() ? 5 : 15 }, running: false })
                dcs.fetch().done(function() {
                    app.content.show(new Summary({ collection: dcs, model: vis }))
                })
            },
            
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such visit', message: 'The specified visit doesnt exist' })
            },
        })
    },
      
      
    sampleChanger: function(visit) {
        app.loading()
        var vis = new Visit({ VISIT: visit })
        vis.fetch({
            success: function() {
                app.bc.reset([bc, { title: 'Sample Changer' }, { title: visit, url: '/dc/visit/'+visit }])
                app.content.show(new SampleChangerView({ model: vis, visit: visit }))
            },
            
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such visit', message: 'The specified visit doesnt exist' })
            },
        })
    },
      

    // Queue Builder
    queue: function(visit) {
        app.loading()
        var vis = new Visit({ VISIT: visit })
        vis.fetch({
            success: function() {
                app.bc.reset([bc, { title: 'Queue Builder' }, { title: visit }])
                app.content.show(new QueueBuilder({ visit: visit, bl: vis.get('BL') }))
            },
            
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such visit', message: 'The specified visit doesnt exist' })
            },
        })
    },
      
  }
       
  app.addInitializer(function() {
    app.on('dclist:show', function(visit) {
      if (visit) {
          app.navigate('dc/visit/'+visit)
          controller.dc_list(visit)
      } else {
        app.navigate('dc')
        controller.dc_list()
      }
    })
      
    app.on('dc:show', function(type, id) {
        app.navigate('dc/ty/'+type+'/id/'+id)
        controller.dc_list(null, null, null, type, id)
    })
  })
       
  return controller
})