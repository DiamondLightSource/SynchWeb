define(['marionette',
        'modules/samples/views/getsampleview',
        'models/sample',
        'collections/samples',
        'models/protein',
        'collections/proteins',
        'models/crystal',
        'collections/crystals',

        'modules/types/xpdf/models/instance',

        'models/proplookup',
    
], function(Marionette, 
  GetView,
  Sample, Samples, 
  Protein, Proteins,
  Crystal, Crystals,
  Instance,
  ProposalLookup) {
    
  var sbc =  { title: 'Samples', url: '/samples' }
  var pbc =  { title: 'Proteins', url: '/proteins' }
    
  var controller = {
    // Samples
    list: function(s, page) {
      app.loading()

      var title = GetView.SampleList.title(app.type)
      app.bc.reset([{ title: title+'s', url: '/'+title.toLowerCase()+'s' }])

      page = page ? parseInt(page) : 1
      var samples = new Samples(null, { state: { currentPage: page }, queryParams: { s : s } })
      samples.fetch().done(function() {
          app.content.show(GetView.SampleList.get(app.type, { collection: samples, params: { s: s } }))
      })
    },
      
    view: function(sid) {
        app.loading()
        var lookup = new ProposalLookup({ field: 'BLSAMPLEID', value: sid })
        lookup.find({
            success: function() {
                var sample = new (app.type == 'xpdf' ? Instance : Sample)({ BLSAMPLEID: sid }, { addPrimary: app.type == 'xpdf' })
                var data = {}
                if (app.type == 'xpdf') data.seq = 1
                sample.fetch({
                    data: data,
                    success: function() {
                        app.bc.reset([sbc, { title: sample.get('NAME') }])
                        app.content.show(GetView.SampleView.get(app.type, { model: sample }))
                    },
                    
                    error: function() {
                        app.bc.reset([sbc])
                        app.message({ title: 'No such sample', message: 'The specified sample could not be found'})
                    }
                })
            }, 

            error: function() {
                app.bc.reset([sbc])
                app.message({ title: 'No such sample', message: 'The specified sample could not be found'})
            }
        })
    },
      


    // Crystals
    crystallist: function(s, page) {
        app.loading()
        var title = GetView.CrystalList.title(app.type)

        app.bc.reset([{ title: title+'s', url: '/'+title.toLowerCase()+'s' }])
        page = page ? parseInt(page) : 1
        var params = { s : s }
        if (app.type == 'xpdf') params.seq = 1
        var crystals = new Crystals(null, { state: { currentPage: page, addPrimary: app.type == 'xpdf' }, queryParams: params })
        crystals.fetch().done(function() {
            app.content.show(GetView.CrystalList.get(app.type, { collection: crystals, params: { s: s } }))
        })
    },
      
    crystalview: function(cid) {
        app.loading()
        var title = GetView.CrystalView.title(app.type)
        var cbc = { title: title+'s', url: '/'+title.toLowerCase()+'s' }

        var lookup = new ProposalLookup({ field: 'CRYSTALID', value: cid })
        lookup.find({
            success: function() {
                var crystal = new Crystal({ CRYSTALID: cid }, { addPrimary: app.type == 'xpdf' })
                var data = {}
                if (app.type == 'xpdf') data.seq = 1
                crystal.fetch({
                    data: data,
                    success: function() {
                        app.bc.reset([cbc, { title: crystal.get('NAME') }])
                        app.content.show(GetView.CrystalView.get(app.type, { model: crystal }))
                    },
                    error: function() {
                        app.bc.reset([cbc])
                        app.message({ title: 'No such '+title, message: 'The specified '+title+' could not be found'})      
                    },
                })
            },

            error: function() {
                app.bc.reset([cbc])
                app.message({ title: 'No such '+title, message: 'The specified '+title+' could not be found'})      
            }
        })
    },
      
    crystaladd: function() {
        var title = GetView.CrystalAdd.title(app.type)
        var cbc = { title: title+'s', url: '/'+title.toLowerCase()+'s' }
        app.bc.reset([cbc, { title: 'Add '+title }])
        app.content.show(GetView.CrystalAdd.get(app.type))
    },

    simplesampleadd: function(pid) {
        var title = GetView.SimpleSampleAdd.title(app.type)
        var cbc = { title: title+'s', url: '/'+title.toLowerCase()+'s' }

        if (pid) {
            var protein = new Protein({ PROTEINID: pid })
            protein.fetch({
                success: function(){
                    app.bc.reset([cbc, { title: 'Add '+title }])
                    app.content.show(GetView.SimpleSampleAdd.get(app.type, { model: protein }))
                },
                error: function(){
                    app.bc.reset([cbc])
                    app.message({ title: 'Protein not found!', message: 'The specified protein could not be found'})
                }
            })
        } else {
            app.bc.reset([cbc, { title: 'Add '+title }])
            app.content.show(GetView.SimpleSampleAdd.get(app.type))
        }
    },



    // Proteins
    proteinlist: function(s, page) {
        app.loading()
        var title = GetView.ProteinList.title(app.type)

        app.bc.reset([{ title: title+'s', url: '/'+title.toLowerCase()+'s' }])
        page = page ? parseInt(page) : 1
        var params = { s : s }
        if (app.type == 'xpdf') {
            params.seq = 1
            params.external = 1
        }
        var proteins = new Proteins(null, { state: { currentPage: page }, queryParams: params })
        proteins.fetch().done(function() {
            app.content.show(GetView.ProteinList.get(app.type, { collection: proteins, params: { s: s } }))
        })
    },
      
    proteinview: function(pid) {
        app.loading()
        var title = GetView.ProteinList.title(app.type)
        var pbc = { title: title+'s', url: '/'+title.toLowerCase()+'s' }

        var lookup = new ProposalLookup({ field: 'PROTEINID', value: pid })
        lookup.find({
            success: function() {
                var protein = new Protein({ PROTEINID: pid })
                protein.fetch({
                    success: function() {
                        app.bc.reset([pbc, { title: protein.get('NAME') }])
                        app.content.show(GetView.ProteinView.get(app.type, { model: protein }))
                    },
                    error: function() {
                        app.bc.reset([pbc])
                        app.message({ title: 'No such '+title, message: 'The specified '+title+' could not be found'})      
                    },
                })
            },

            error: function() {
                app.bc.reset([pbc])
                app.message({ title: 'No such '+title, message: 'The specified '+title+' could not be found'})      
            }
        })
    },
      
    proteinadd: function() {
        var title = GetView.ProteinList.title(app.type) 

        if (app.options.get('valid_components') && !app.staff) {
            app.message({ title: 'Cannot Create '+title, message: 'Only staff may create new '+title+'s'} )
        } else if (app.proposal && app.proposal.get('ACTIVE') != 1) {
            app.message({ title: 'Proposal Not Active', message: 'This proposal is not active so new '+title+'s cannot be added'} )
        } else {
            
            var pbc = { title: title+'s', url: '/'+title.toLowerCase()+'s' }
            app.bc.reset([pbc, { title: 'Add '+title }])
            app.content.show(GetView.ProteinAdd.get(app.type))
        }
    },

    proteinclone: function(pid) {
        app.loading()

        var title = GetView.ProteinList.title(app.type)
        var pbc = { title: title+'s', url: '/'+title.toLowerCase()+'s' }

        var lookup = new ProposalLookup({ field: 'PROTEINID', value: pid })
        lookup.find({
            success: function() {
                var protein = new Protein({ PROTEINID: pid })
                protein.fetch({
                    success: function() {
                        app.bc.reset([pbc, { title: 'Clone '+title }])
                        app.content.show(GetView.ProteinAdd.get(app.type, { model: protein }))
                    },
                    error: function() {
                        app.bc.reset([pbc])
                        app.message({ title: 'No such '+title, message: 'The specified '+title+' could not be found'})
                    },
                })
            },

            error: function() {
                app.bc.reset([pbc])
                app.message({ title: 'No such '+title, message: 'The specified '+title+' could not be found'})
            }
        })
    },

  }
       
       
  app.addInitializer(function() {
    app.on('samples:show', function() {
      app.navigate('samples')
      controller.list()
    })
      
    app.on('proteins:show', function() {
      app.navigate('proteins')
      controller.proteinlist()
    })

    app.on('samples:view', function(sid) {
      app.navigate('samples/sid/'+sid)
      controller.view(sid)
    })

    app.on('instances:view', function(sid) {
      app.navigate('instances/sid/'+sid)
      controller.view(sid)
    })

    app.on('crystals:view', function(cid) {
      app.navigate('crystals/cid/'+cid)
      controller.crystalview(cid)
    })

    app.on('xsamples:view', function(cid) {
      app.navigate('xsamples/cid/'+cid)
      controller.crystalview(cid)
    })
      
    app.on('proteins:view', function(pid) {
      app.navigate('proteins/pid/'+pid)
      controller.proteinview(pid)
    })

    app.on('phases:view', function(pid) {
      app.navigate('phases/pid/'+pid)
      controller.proteinview(pid)
    })
  })
       
  return controller
})