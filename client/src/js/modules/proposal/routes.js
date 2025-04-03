// import MarionetteApp from 'app/views/marionette/app.js'
import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import ProposalList from 'modules/proposal/list'

import Proposals from 'collections/proposals.js'
// Need to extend this to deal with visit links for saxs, gen


// Initialize MarionetteApplication if not already existing
let application = MarionetteApplication.getInstance()

console.log("LOADING LEGACY PROPOSAL ROUTES")

application.start(function() {
  application.on('proposals:show', function() {
    application.navigate('/proposal')
  })

  application.on('visits:show', function() {
    application.navigate('/visits')
  })
})

const routes = [
  // List Proposals
  {
    path: '/proposals(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    component: MarionetteView,
    props: route => ({ 
      mview: ProposalList,
      breadcrumbs: [{title: 'Proposals'}],
      options: {
        collection: new Proposals(null, { 
          state: { currentPage: route.params.page ? parseInt(route.params.page) : 1},
          queryParams: { s: route.params.s }
        }),
        params: {s: route.params.s},
      }
    }),
  },

]

export default routes
