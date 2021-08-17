// Specify the routes for this module
// Any Marionette View should use the MarionetteView wrapper component with a prop of the actual marionette view class
// Options can be passed into the marionette view class via the options prop
// Models and collections can be specified as props
// If a model or collection is passed in the data will be prefetched before the component is loaded
// Props that make use of the route object should use props: route => ({ ...define prop using route.params object})
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
const StatsView = import(/* webpackChunkName: "stats" */ 'modules/blstats/views/stats')

let bc = { title: 'Usage Stats', url: '/statistics' }

const routes = [
  {
    // We need to pass the regex to allow capture of the second optional parameter
    path: '/statistics(/)?:type([a-zA-Z0-9]+)?(/)?:subtype?',
    name: 'statistics',
    component: MarionetteView,
    props: route => ({
        mview: StatsView,
        breadcrumbs: [bc],
        options: {
            type: route.params.type || '',
            subtype: route.params.subtype || ''
        },
    })
  },
]

export default routes