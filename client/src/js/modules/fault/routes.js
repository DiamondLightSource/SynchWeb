import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

import Fault from 'modules/fault/models/fault'
import Faults from 'modules/fault/collections/faults'

import FaultListView from 'modules/fault/views/list'
import AddFaultView from 'modules/fault/views/add'
import FaultView from 'modules/fault/views/view'
import FaultTypeEditor from 'modules/fault/views/edit'

// From router
// 'faults(/bl/:bl)(/sys/:sys)(/com/:com)(/sub/:sub)(/page/:page)': 'list',
// 'faults/fid/:fid': 'view',
// 'faults/add': 'add',
// 'faults/edit': 'edit',
// Initialize MarionetteApplication if not already existing
let application = MarionetteApplication.getInstance()

application.addInitializer(function() {
    application.on('fault:show', function(fid) {
        application.navigate('faults/fid/'+fid)
    })
})
   

var bc = { title: 'Fault Database', url: '/fault' }

const routes = [
    {
        // sys, com and sub should all be ids of sub systems and components for the beamline
        path: '/faults(/bl/)?:bl([a-zA-Z0-9_-]+)?(/sys/)?:sys([0-9]+)?(/com/)?:com([0-9]+)?(/sub/)?:sub([0-9]+)?(/page/)?:page([0-9]+)?',
        name: 'faults-view',
        component: MarionetteView,
        props: route => ({
            mview: FaultListView,
            options: {
                collection: new Faults(null, { state: { currentPage: route.params.page ? parseInt(route.params.page) : 1} })
            },
            params: {
                beamline: route.params.bl || '',
                system: route.params.sys || '',
                component: route.params.com || '',
                subcomponent: route.params.sub || ''
            },
            breadcrumbs: [bc],
        })
    },        
    {
        path: '/faults',
        name: 'faults-parent',
        component: Page,
        children: [
            {
                path: 'fid/:fid',
                name: 'faults-view-id',
                component: MarionetteView,
                props: route => ({
                    mview: FaultView,
                    options: {
                        model: new Fault({ FAULTID: route.params.fid })
                    },
                    breadcrumbs: [bc, { title: 'View Fault' }],
                    breadcrumb_tags: ['TITLE']
                })
            },
            {
                path: 'add',
                name: 'faults-view-add',
                component: MarionetteView,
                props: {
                    mview: AddFaultView,
                    breadcrumbs: [bc, { title: 'Add New Fault Report' }],
                },
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('fault_add')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/403?url='+to.fullPath)
                    } else {
                        next()
                    }
                }
            },
            {
                path: 'edit',
                name: 'faults-view-edit',
                props: {
                    mview: FaultTypeEditor,
                    breadcrumbs: [bc, { title: 'Edit Fault Types' }],
                },
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('fault_admin')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/403?url='+to.fullPath)
                    } else {
                        next()
                    }
                }
            },
        ]
    },
]

export default routes