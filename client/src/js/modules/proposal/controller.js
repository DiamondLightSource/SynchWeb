define(['underscore', 'marionette',
        'modules/proposal/list',
        'collections/proposals',

        'collections/visits',
    
        // 'modules/proposal/visit_list',
        // 'modules/types/saxs/proposal/views/visit_list',
        // 'modules/types/gen/proposal/views/visit_list',

], function(_, Marionette, ProposalList, Proposals, Visits, VisitList, SAXSVisitList, GenVisitList) {
  var controller = {
    list: function(s, page) {
      app.bc.reset([{ title: 'Proposals', url: '/proposal' }])
      app.loading()
      console.log('prop list')
        
      if (page) page = parseInt(page)
      else page = 1
      var proposals = new Proposals(null, { state: { currentPage: page }, queryParams: { s: s } })
      proposals.fetch().done(function() {
          app.content.show(new ProposalList({ collection: proposals, params: { s: s } }))
      })
    },
       
    // visit_list: function(s, page) {
    //     app.bc.reset([{ title: 'Proposals', url: '/proposal' },
    //                   { title: 'Visits for '+app.prop }])
    //     app.loading()
    //     page = page ? parseInt(page) : 1
        
    //     var visits = new Visits(null, { state: { currentPage: page }, queryParams: { s: s } })
    //     visits.fetch().done(function() {
    //         var views = {
    //             saxs: SAXSVisitList,
    //             mx: VisitList,
    //         }
            
    //         var ty = app.proposal && app.proposal.get('TYPE')
    //         if (ty in views) view = views[ty]
    //         else view = GenVisitList
            
    //         app.content.show(new view({ collection: visits, params: { s: s } }))
    //     })
    // }
  }
       
       
  app.addInitializer(function() {
    app.log('init router')
    app.on('proposals:show', function() {
      app.navigate('proposal')
      controller.list()
    })
      
    // app.on('visits:show', function() {
    //   app.navigate('visits')
    //   controller.visit_list()
    // })
  })
       
  return controller
})