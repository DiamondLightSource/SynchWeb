// Specify the routes for this module
// These all use wrapper components to hide the complexity
// Depending on the proposal type different marionette views are needed
// The wrapper components use samples-map to figure out which views are required

// Because we are using wrapper vue components we can use the standard lazy loading async method
const ProteinListWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/ProteinListWrapper.vue')
const ProteinAddWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/ProteinAddWrapper.vue')
const ProteinViewWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/ProteinViewWrapper.vue')

const SampleListWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/SampleListWrapper.vue')
const SampleViewWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/SampleViewWrapper.vue')
const XpdfSimpleSampleAddWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/XpdfSimpleSampleAddWrapper.vue')

const CrystalListWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/CrystalListWrapper.vue')
const CrystalViewWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/CrystalViewWrapper.vue')
const CrystalAddWrapper = () => import(/* webpackChunkName: "samples" */ 'modules/samples/components/CrystalAddWrapper.vue')

app.addInitializer(function() {
  app.on('samples:show', function() {
    app.navigate('/samples')
  })
    
  app.on('proteins:show', function() {
    app.navigate('/proteins')
  })

  app.on('samples:view', function(sid) {
    app.navigate('/samples/sid/'+sid)
  })

  app.on('instances:view', function(sid) {
    app.navigate('/instances/sid/'+sid)
  })

  app.on('crystals:view', function(cid) {
    app.navigate('/crystals/cid/'+cid)
  })

  app.on('xsamples:view', function(cid) {
    app.navigate('/xsamples/cid/'+cid)
  })
    
  app.on('proteins:view', function(pid) {
    app.navigate('/proteins/pid/'+pid)
  })

  app.on('phases:view', function(pid) {
    app.navigate('/phases/pid/'+pid)
  })

  app.on('protein:clone', function(pid) {
    app.navigate('/proteins/clone/pid/'+pid)
  })
})

const routes = [
  // Samples routes
  {
    path: '/samples(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    name: 'sample-list',
    component: SampleListWrapper,
    props: route => ({
      search: route.params.s || '',
      page: +route.params.page || 1,
    })
  },
  {
    path: '/samples/sid/:sid([0-9]+)',
    name: 'sample-view',
    component: SampleViewWrapper,
    props: route => ({
      sid: +route.params.sid
    })
  },
  // This part needs a rethink
  // Instances go through the same component as samples, but by their nature are specific to xpdf views
  // So really they could be mapped to their own component instead of generic sample list/view
  {
    path: '/instances(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    name: 'instance-list',
    component: SampleListWrapper,
    props: route => ({
      search: route.params.s || '',
      page: +route.params.page || 1,
    })
  },
  {
    path: '/instances/sid/:sid([0-9]+)',
    name: 'instance-view',
    component: SampleViewWrapper,
    props: route => ({
      sid: +route.params.sid
    })
  },
  // Protein Routes
  {
    path: '/proteins(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    name: 'protein-list',
    component: ProteinListWrapper,
    props: route => ({
      search: route.params.s,
      page: +route.params.page || 1,
    })
  },
  {
    path: '/proteins/pid/:pid',
    name: 'protein-view',
    component: ProteinViewWrapper,
    props: route => ({
      pid: +route.params.pid
    })
  },
  {
    path: '/proteins/pid/:pid([0-9]+)/clone',
    name: 'protein-clone',
    component: ProteinAddWrapper,
    props: route => ({
      pid: +route.params.pid
    })
  },
  {
    path: '/proteins/add',
    name: 'protein-add',
    component: ProteinAddWrapper,
  },
  // Phases - these were added for xpdf.
  // Reuse protein components and views
  {
    path: '/phases(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    name: 'phase-list',
    component: ProteinListWrapper,
    props: route => ({
      search: route.params.s,
      page: +route.params.page || 1,
    })
  },
  {
    path: '/phases/pid/:pid',
    name: 'phase-view',
    component: ProteinViewWrapper,
    props: route => ({
      pid: +route.params.pid
    })
  },
  {
    path: '/phases/add',
    name: 'phase-add',
    component: ProteinAddWrapper,
  },
  // This redirects to protein clone...
  {
    path: '/phases/pid/:pid([0-9]+)/clone',
    name: 'phases-clone',
    component: ProteinAddWrapper,
    props: route => ({
      pid: +route.params.pid
    })
  },
  // Crystals routes
  // XPDF routes - these are identical with xsamples below
  // Only xpdf have views supported as no other proposal type has suitable views implemented
  // We could probably just call the relevant xpdf crystal view directly
  // Kept things consistent with original controller for now
  {
    path: '/crystals(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    name: 'crystal-list',
    component: CrystalListWrapper,
    props: route => ({
      search: route.params.s,
      page: +route.params.page || 1,
    })
  },
  {
    path: '/crystals/cid/:cid',
    name: 'crystal-view',
    component: CrystalViewWrapper,
    props: route => ({ 
      cid: +route.params.cid
    }),
  },
  {
    path: '/crystals/add',
    name: 'crystal-add',
    component: CrystalAddWrapper,
  },
  // XSamples routes - these are identical with crystals
  // Only xpdf have views supported as no other proposal type has suitable views implemented
  {
    path: '/xsamples(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
    name: 'xsamples-list',
    component: CrystalListWrapper,
    props: route => ({
      search: route.params.s,
      page: +route.params.page || 1,
    })
  },
  {
    path: '/xsamples/cid/:cid',
    name: 'xsamples-view',
    component: CrystalViewWrapper,
    props: route => ({ 
      cid: +route.params.cid
    }),
  },
  {
    path: '/xsamples/add',
    name: 'xsamples-add',
    component: CrystalAddWrapper,
  },
  {
    path: '/xsamples/simple/add/:pid',
    name: 'xsamples-simple-sample-add',
    component: XpdfSimpleSampleAddWrapper,
    props: route => ({
      pid: +route.params.pid
    }),
  },
]

export default routes