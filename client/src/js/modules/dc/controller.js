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
    
    ], function(Marionette, GetView, ImageViewer, MapModelViewer, ReciprocalSpaceViewer,
        Summary, APStatusSummary, DataCollection, DCCol, Sample, Visit, Proposal, SampleChangerView, QueueBuilder,
        ProposalLookup) {
    
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
                dcs.setPageSize(app.mobile() ? 5 : 15)
                dcs.state.currentPage = page
                dcs.fetch().done(function() {
                    console.log('DC TYPE', model.get('TYPE'))
                    app.content.show(GetView.DCView.get(model.get('TYPE'), { collection: dcs,  params: { visit: visit, search: search, type: type, id: id, dcg: dcg, pjid: pjid }, model: model }))
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
    mapmodelviewer: function(id, aid) {
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
                        app.content.show(new MapModelViewer({ aid: aid, model: dc }))
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
          // Record the visit number 
          let visit_number = visit.split('-')[1]
          app.setVisit(visit_number)

          app.navigate('dc/visit/'+visit)
          controller.dc_list(visit)
      } else {
        app.navigate('dc')
        controller.dc_list()
      }
    })
      
    app.on('dc:show', function(type, id, visit) {
        if (visit) {
            // Record the visit number 
            let visit_number = visit.substring(visit.lastIndexOf('-')+1, visit.length)
            app.setVisit(visit_number)
        }
        app.navigate('dc/'+(visit ? ('visit/'+visit) : '') + '/ty/'+type+'/id/'+id)
        controller.dc_list(visit, null, null, null, type, id)
    })
  })
       
  return controller
})