define(['underscore', 'marionette',
        'modules/proposal/list',
        'collections/proposals',

        'collections/visits',

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
       
  }
       
       
  app.addInitializer(function() {
    app.log('init router')
    app.on('proposals:show', function() {
      app.navigate('proposal')
      controller.list()
    })
      
  })
       
  return controller
})