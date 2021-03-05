import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

// Lazy load vue components
const StatsView = () => import(/* webpackChunkName: "groups-stats" */ 'modules/stats/components/stats-view.vue')

import Pies from 'modules/stats/collections/pies'
// Lazy load marionette views that will be rendered
const ProposalView = import(/* webpackChunkName: "groups-stats" */ 'modules/stats/views/proposal')
const BAGOverviewView = import(/* webpackChunkName: "groups-stats" */ 'modules/stats/views/overview')
const BLSOverviewView = import(/* webpackChunkName: "groups-stats" */ 'modules/stats/views/overview2')
const BeamlineHLOverview = import(/* webpackChunkName: "groups-stats" */ 'modules/stats/views/bloverview')
const BeamlineOverview = import(/* webpackChunkName: "groups-stats" */ 'modules/stats/views/beamline')
const RunsOverview = import(/* webpackChunkName: "groups-stats" */ 'modules/stats/views/runs_overview')

// Main breadcrumb link
let bc = { title: 'Visit Statistics', url: '/stats' }

let piesCollection = {}

// Wrapping the statistics call in a promise so we can get the data in navigation guard
function lookupPies(params) {
    return new Promise((resolve, reject) => {
        piesCollection = new Pies(null, {
            state: { pageSize: app.mobile() ? 5 : 15, currentPage: params.page ? parseInt(params.page) : 1 }
        })

        piesCollection.fetch({
            // If OK trigger next
            success: function() {
              console.log("Stats pies collection lookup OK")
              resolve(piesCollection)
            },
            // Original controller had no error condition...
            error: function() {
                reject({msg: "Stats pies collection lookup failed"})
            }
        })
    })
}

const routes = [
{
    path: '/stats(/page/)?:page([0-9]+)?',
    name: 'stats-proposal-view',
    component: MarionetteView,
    props: route => ({
        // Not using convention of single collection
        // View has its own collection as well as the Pies collection so need to pre-fetch it here
        // We need props to be a function so piesCollection is resolved before navigation
        mview: ProposalView,
        options: {
            pies: piesCollection
        },
        breadcrumbs: [bc, { title: 'Proposal' }, { title: app.prop }]
    }),
    beforeEnter: (to, from, next) => {
        console.log("Lookup stats ")

        // Start the loading animation
        app.loading()

        lookupPies(to.params).then((response) => {
            console.log("Lookup Collection OK - " + response)
            next()
        }, (error) => {
            console.log(error.msg)
            app.alert({ title: 'No stats found', message: error.msg })
            next()
        }).finally( () => {
            // In either case we can stop the loading animation
            app.loading(false)
        })
    }
},
// Using Wrapper component to hide the complexity of proposal specific views
{
    path: '/stats',
    component: Page,
    name: 'stats-view',
    children: [
    {
        path: 'visit/:visit([a-zA-Z]{2}[0-9]+-[0-9]+)(/from/)?:from?(/to/)?:to?',
        name: 'stats-visit-dates',
        component: StatsView,
        props: route => ({
            visit: route.params.visit,
            from: route.params.from || '',
            to: route.params.to || '',
        })
    },
    // BAG Overview stats
    // Page is captured but not passed into the view!
    {
        path: 'overview(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
        name: 'stats-overview-list',
        meta: {
            permission: 'all_prop_stats',
        },
        component: MarionetteView,
        props: route => ({
            mview: BAGOverviewView,
            options: {
                params: {
                    s: route.params.s
                },
            },
            breadcrumbs: [bc, { title: 'BAG Overview' }],
        })
    },
    {
        path: 'overview',
        name: 'stats-overview',
        meta: {
            permission: 'all_prop_stats',
        },
        component: Page,
        children: [
            {
                // Page is never actually used in the original controller despite being captured as a path parameter
                path: 'beamlines(/s/)?:s([a-zA-Z0-9_-]+)?(/page/)?:page([0-9]+)?',
                name: 'stats-overview-beamlines',
                component: MarionetteView,
                props: route => ({
                    mview: BLSOverviewView,
                    options: {
                        params: {
                            s: route.params.s
                        },
                    },
                    breadcrumbs: [bc, { title: 'Beamlines Overview' }],
                }),
            },
            {
                path: 'bl:bl',
                name: 'stats-overview-beamline',
                component: MarionetteView,
                props: route => ({
                    mview: BeamlineHLOverview,
                    // Note: here the params are passed an part of the options - not as a separate object ?
                    options: {
                        bl: route.params.bl,
                        params: {
                            s: route.params.s
                        },
                    },
                    breadcrumbs: [bc, { title: route.params.bl+' Overview' }],
                }),
            },
        ],
    },
    {
        path: 'bl/:bl([a-zA-Z0-9_-]+)(/run/)?:run?(/from/)?:from?(/to/)?:to?',
        name: 'stats-overview-beamline-run',
        meta: {
            permission: 'all_breakdown'
        },
        component: MarionetteView,
        props: route => ({
            mview: BeamlineOverview,
            // Note: here the params are passed an part of the options - not as a separate object ?
            options: {
                bl: route.params.bl,
                params: {
                    run: route.params.run || null,
                    from: route.params.from ? parseInt(route.params.from) : null,
                    to: route.params.to ? parseInt(route.params.to) : null
                }
            },
            breadcrumbs: [bc, { title: 'Beamline Run Overview' }, { title: route.params.bl }],
        }),
    }]
},
{
    path: '/runs/overview(/bl/)?:bl([a-zA-Z0-9_-]+)?',
    name: 'stats-overview-beamline-runs',
    meta: {
        permission: 'all_breakdown'
    },
    component: MarionetteView,
    props: route => ({
        mview: RunsOverview,
        // Note: here the params are passed an part of the options - not as a separate object ?
        options: {
            params: { 
                bl: route.params.bl || null,
            }
        },
        breadcrumbs: [bc, { title: 'Runs Overview For Beamlines'}],
    }),
}]



export default routes