define(['marionette', 'modules/dc/views/getdcview', 'modules/dc/views/imageviewer', 
    'modules/dc/views/mapmodelview', 
    'modules/dc/views/reciprocalview', 
    'modules/dc/views/summary', 
    'modules/dc/views/apstatussummary', 
    'models/datacollection', 
    'collections/datacollections', 
    'models/sample', 'models/visit', 'models/proposal',
    'modules/dc/views/samplechangerfull',
    'modules/dc/views/queuebuilder',
    'models/proplookup',
    'collections/beamlinetypes',
    'modules/dc/views/beamlineactivity',
    
    ], function(Marionette, GetView, ImageViewer, MapModelViewer, ReciprocalSpaceViewer,
        Summary, APStatusSummary, DataCollection, DCCol, Sample, Visit, Proposal, SampleChangerView, QueueBuilder,
        ProposalLookup, BeamlineTypes, BeamlineActivity) {
    
    var bc = { title: 'Data Collections', url: '/dc' }
    
  var controller = {
      
    // Data Collection List
    dc_list: function(visit, dcg, page, search, type, id, pjid) {
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
                var dcs = new DCCol(null, { queryParams: { visit: visit, s: search, t: type, id: id, dcg: dcg, PROCESSINGJOBID: pjid } })
                dcs.state.pageSize = app.mobile() ? 5 : 15
                dcs.state.currentPage = page
                dcs.fetch().done(function() {
                    console.log('DC TYPE', model.get('TYPE'))
                    app.content.show(GetView.DCView.get(model.get('TYPE'), { collection: dcs,  params: { visit: visit, search: search, type: type, id: id, dcg: dcg }, model: model }))
                })
            },
            
            error: function() {
                app.bc.reset([bc])
                app.message({ title: error, message: error })
            },
        })
    },
      
    // Beamline Activity
    beamlineactivity: function(bl, page, search, type) {
        if (!app.staff) {
            app.bc.reset([bc])
            app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
            return
        }

        var types = new BeamlineTypes()
        types.queryParams.bl = bl
        types.fetch({
            success: function() {
                app.bc.reset([bc, { title: bl + ' Activity' }])
                app.content.show(new BeamlineActivity({ bl: bl, type: types.at(0).get('TYPE'), params: { page: page, type: type, search: search } }))
            },

            error: function() {
                app.bc.reset([bc])
                app.message({ title: 'No such beamline', message: 'No such beamline' })
            }
        })
    },
      
    // Diffraction Image Viewer
    di_viewer: function(id) {
        console.log('di viewer')
        var lookup = new ProposalLookup({ field: 'DATACOLLECTIONID', value: id })
        lookup.find({
            success: function() {
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

            error: function() {
                app.bc.reset([bc, { title: 'Image Viewer' }])
                app.message({ title: 'No such data collection', message: 'The specified data collection doesnt exist' })
            }
        })
    },
      
      
    // Map / Model Viewer
    mapmodelviewer: function(id, ty, dt, ppl) {
        if (!ty) ty = 'dimple'
        var lookup = new ProposalLookup({ field: 'DATACOLLECTIONID', value: id })
        lookup.find({
            success: function() {
                var dc = new DataCollection({ ID: id })
                dc.fetch({
                    success: function() {
                        app.bc.reset([bc,
                            {title: app.prop+'-'+dc.get('VN'), url: '/dc/visit/'+app.prop+'-'+dc.get('VN') },
                            { title: 'Map/Model Viewer' },
                            { title: dc.get('FILETEMPLATE') }])
                        app.content.show(new MapModelViewer({ ty: ty, dt: dt, ppl: ppl, model: dc }))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'Map/Model Viewer' }])
                        app.message({ title: 'No such data collection', message: 'The specified data collection doesnt exist' })
                    }
                })
            },

            error: function() {
                app.bc.reset([bc, { title: 'Map/Model Viewer' }])
                app.message({ title: 'No such data collection', message: 'The specified data collection doesnt exist' })
            }
        })
    },
      

    // Reciprocal Space Viewer
    rsviewer: function(id) {
        var lookup = new ProposalLookup({ field: 'DATACOLLECTIONID', value: id })
        lookup.find({
            success: function() {
                var dc = new DataCollection({ ID: id })
                dc.fetch({
                    success: function() {
                        app.bc.reset([bc,
                            {title: app.prop+'-'+dc.get('VN'), url: '/dc/visit/'+app.prop+'-'+dc.get('VN') },
                            { title: 'Reciprocal Space Viewer' },
                            { title: dc.get('FILETEMPLATE') }])
                        app.content.show(new ReciprocalSpaceViewer({ model: dc }))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'Reciprocal Space Viewer' }])
                        app.message({ title: 'No such data collection', message: 'The specified data collection doesnt exist' })
                    }
                })
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
        app.cookie(visit.split('-')[0])
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
      
      
    // Autoprocessing Status Summary
    apstatussummary: function(visit) {
        console.log('apstatussummary')
        app.loading()
        app.cookie(visit.split('-')[0])
        var vis = new Visit({ VISIT: visit })
        vis.fetch({
            success: function() {
                app.bc.reset([bc, { title: 'Autoprocessing Status Summary' }, { title: visit }])
                
                var dcs = new DCCol(null, { queryParams: { visit: visit, t: 'fc', pp: app.mobile() ? 5 : 15 }, running: false })
                dcs.fetch().done(function() {
                    app.content.show(new APStatusSummary({ collection: dcs, model: vis }))
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
        app.cookie(visit.split('-')[0])
        var vis = new Visit({ VISIT: visit })
        vis.fetch({
            success: function() {
                console.log('sc vis', vis, vis.get('BL'))
                app.bc.reset([bc, { title: 'Sample Changer' }, { title: visit, url: '/dc/visit/'+visit }])
                app.content.show(new SampleChangerView({ visit: visit, bl: vis.get('BL') }))
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
      
    app.on('dc:show', function(type, id, visit) {
        app.navigate('dc/'+(visit ? ('visit/'+visit) : '') + '/ty/'+type+'/id/'+id)
        controller.dc_list(visit, null, null, null, type, id)
    })
  })
       
  return controller
})