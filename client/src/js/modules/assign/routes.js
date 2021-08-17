import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

import Visit from 'models/visit'
import Visits from 'collections/visits'
    
import SelectVisitView from 'modules/assign/views/selectvisit'
import AssignView from 'modules/assign/views/assign'


let bc = { title: 'Assign Containers', url: '/assign' }

let visitModel = {}

// Initialize MarionetteApplication if not already existing
// Potentially we could swap use of app.navigate wuith router.push directly but we still need to 
// hook into the marionette event bus...
let application = MarionetteApplication.getInstance()


application.addInitializer(function() {
    application.on('assign:visit', function(visit) {
        application.navigate('/assign/visit/'+visit)
    })
})

// AssignView does not use the standard convention of model option
// So we do the lookup in a navigation guard and pass the model as a 'visit' option
function lookupVisit(params) {
    return new Promise((resolve, reject) => {
        visitModel = new Visit({ VISIT: params.visit })

        visitModel.fetch({
            // If OK trigger next 
            success: function() {
                console.log("Assign: visit model lookup OK")
                resolve(visitModel)
            },
            error: function() {
                reject({msg: "The specified visit doesn\'t exist"})
            }
        })    
    })
}

const routes = [
    {
        path: '/assign',
        component: Page,
        children: [
            {
                path: '',
                name: 'assign-select-visit',
                component: MarionetteView,
                props: {
                    mview: SelectVisitView,
                    options: {
                        collection: new Visits(null, { queryParams: { next: 1 } })
                    },
                    breadcrumbs: [bc]
                }
            },
            {
                path: 'visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)?(/page/)?:page([0-9]+)?',
                name: 'assign-visit',
                component: MarionetteView,
                props: route => ({
                    mview: AssignView,
                    options: {
                        visit: visitModel,
                        page: route.params.page ? parseInt(route.params.page) : 1
                    },
                    breadcrumbs: [bc,{title: route.params.visit, url: '/dc/visit/'+route.params.visit }]
                }),
                // AssignView does not use the standard convention of model option
                // So we do the lookup in a navigation guard and pass the model as a 'visit' option
                // Also we set the proposal as specified in url
                beforeEnter(to, from, next) {
                    let prop = to.params.visit.split('-')[0]
                    app.cookie(prop)

                    // Start loading animation
                    app.loading()

                    lookupVisit(to.params).then((response) => {
                        console.log("Lookup Model OK - " + response)
                        next()
                    }, (error) => { 
                        console.log(error.msg)
                        next('/notfound')
                    }).finally( () => {
                        // In either case we can stop the loading animation
                        app.loading(false)
                    })
                }
            }
        ]
    }
]

export default routes