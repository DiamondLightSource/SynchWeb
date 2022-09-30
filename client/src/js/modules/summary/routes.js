const SummaryViewWrapper = () => import(/* webpackChunkName: "summary" */ 'modules/summary/views/summary.vue')


const routes = [
    // Root path has optional parameters so we need to deal with it first
    // It doesn't play nicely with multiple child routes...
    {
      path: '/summary',
      component: SummaryViewWrapper,
      
    }
]

export default routes