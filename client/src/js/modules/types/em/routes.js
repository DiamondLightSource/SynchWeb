import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import vueXModule from 'modules/types/em/store'
import store from 'app/store/store.js'

// Import style for lazy loading of Vue Single File Component
const RelionView = () => import(/* webpackChunkName: "em" */ 'modules/types/em/relion/views/relion.vue')
const RelionAddProcessing = () => import(/* webpackChunkName: "em" */ 'modules/types/em/relion/views/add-processing-job.vue')
const DataCollectionView = () => import(/* webpackChunkName: "em" */ 'modules/types/em/dc/data-collection.vue')
const ScipionView = import(/* webpackChunkName: "em" */ 'modules/types/em/scipion/views/scipion')

const routes = [
    {
        'path': '/dc/visit/:visit_str/collection/:collection_id',
        'component': DataCollectionView,
        'props': route => ({
            'dataCollectionId': parseInt(route.params.collection_id, 10),
            'visit': route.params.visit_str
        }),
        'beforeEnter': (to, from, next) => {
            if (to.params.collection_id && to.params.visit_str) {
                vueXModule.register(store)
                next()
            } else {
                app.message({
                    title: 'Data collection and/or visit not specified',
                    message: 'No data collection and/or visit specified'
                })
                next('/notfound')
            }
        },
    },
    {
        path: '/em/process/scipion/visit/:visit_str',
        component: MarionetteView,
        props: route => ({
            mview: ScipionView,
            options: {
                visit_str: route.params.visit_str
            },
            breadcrumbs: [{ title: 'Scipion Processing' }, { title: route.params.visit_str }]
        }),
        beforeEnter: (to, from, next) => {
            // Copying the logic from types/em/scipion/controller.js
            if (to.params.visit_str) {
                app.cookie(to.params.visit_str.split('-')[0]);
                next()
            } else {
                // This path should never be entered. If there is no session_str then this path will not match
                app.message({title: 'Visit not specified', message: 'No visit specified'})
                next('/notfound')
            }
        }
    }
]

export default routes
