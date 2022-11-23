// import MarionetteApp from 'app/views/marionette/app.js'
import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import ProposalList from 'modules/proposal/list'
import VisitList from 'modules/proposal/visit_list'
import SAXSVisitList from 'modules/types/saxs/proposal/views/visit_list'
import GenVisitList from 'modules/types/gen/proposal/views/visit_list'

import Proposals from 'collections/proposals.js'
import Visits from 'collections/visits.js'
// Need to extend this to deal with visit links for saxs, gen


// Initialize MarionetteApplication if not already existing
let application = MarionetteApplication.getInstance()

console.log("LOADING LEGACY PROPOSAL ROUTES")

application.addInitializer(function() {
  application.on('proposals:show', function() {
    application.navigate('/proposal')
  })

  application.on('visits:show', function() {
    application.navigate('/visits')
  })
})

// Determine the correct visit link list to display
function getVisitProps (route) {
  console.log("Proposal::vue-routes - getVisitProps")
  // The only difference is which action buttons are displayed
  // Could move to the visit list view rather than this somewhat complex approach
  let views = {
    saxs: SAXSVisitList,
    mx: VisitList,
  }

  // Was the following, but we can get the type directly
  // var ty = application.proposal && application.proposal.get('TYPE')
  let ty = application.type

  let view = GenVisitList

  if (ty in views) view = views[ty]
  else view = GenVisitList

  return {
    mview: view,
    breadcrumbs: [{title: 'Proposals', url: '/proposals'}, {title: 'Visits for ' + application.prop}],
    options: {
      collection: new Visits(null, { state: { currentPage: route.params.page ? parseInt(route.params.page) : 1}}),
      params: {s: route.params.s}
    },
  }
}

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
  // List Visits
  // Replicating the optional visit url page and/or search term
  // {
  //   path: '/visits(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
  //   component: MarionetteView,
  //   props: getVisitProps,
  // },
]

export default routes
