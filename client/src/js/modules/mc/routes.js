import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import DataCollectionsView from 'modules/mc/views/datacollections'
import DataCollections from 'collections/datacollections'


var bc = { title: 'Multicrystal Processing', url: '/mc' }

const routes = [
    {
        path: '/mc/visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)(/page/)?:page([0-9]+)?(/s/)?:search([a-zA-z0-9_-]+)?',
        component: MarionetteView,
        props: route => ({
            mview: DataCollectionsView,
            options: {
                collection: new DataCollections( null, { 
                    queryParams: { 
                        visit: route.params.visit, 
                        s: route.params.search, 
                        t: 'fc',
                        per_page: app.mobile() ? 5 : 15, // Was 16 in mc but assume that's error - normally 15
                    },
                    state: { currentPage: route.params.page ? parseInt(route.params.page) : 1}
                }),
                params: {
                    visit: route.params.visit,
                    search: route.params.search || ''
                }
            },
            breadcrumbs: [bc, { title: route.params.visit, url: '/dc/visit/'+route.params.visit }, { title: 'Merge Data Collections' }]
        }),
        beforeEnter(to,from,next) {
            let prop = to.params.visit.split('-')[0]
            console.log("MC route - setting proposal to " + prop)
            app.cookie(prop)
            next()
        }
    }
]

export default routes