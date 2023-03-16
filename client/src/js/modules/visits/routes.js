const VisitsViewWrapper = () => import(/* webpackChunkName: "visits" */ 'modules/visits/views/visit_list.vue')


const routes = [
    // Root path has optional parameters so we need to deal with it first
    // It doesn't play nicely with multiple child routes...
    {
      path: '/visits(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
      component: VisitsViewWrapper,
      
    }
]

export default routes