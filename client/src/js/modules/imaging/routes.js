// Vue Router configuration
// If properties need to be dynamic then use props as a function
// Can also extract values from the route dynamically via route.params

import MarionetteApplication from 'app/marionette-application.js'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'
import Debug from 'app/views/debug.vue'

import Schedule from 'modules/imaging/models/schedule'
import Schedules from 'modules/imaging/collections/schedules'

import ScheduleAdmin from 'modules/imaging/views/admin/scheduleadmin'
import ScheduleComponentAdmin from 'modules/imaging/views/admin/schedulecompadmin'
import Dashboard from 'modules/imaging/views/admin/dashboard'

import Screen from 'modules/imaging/models/screen'
import Screens from 'modules/imaging/collections/screens'
import ScreenAdmin from 'modules/imaging/views/screenadmin'
import ScreenComponentAdmin from 'modules/imaging/views/screencompadmin'

import ParamAdmin from 'modules/imaging/views/admin/params'
import PresetAdmin from 'modules/imaging/views/admin/presets'

// Initialize MarionetteApplication if not already existing
// Potentially we could swap use of application.navigate wuith router.push directly but we still need to 
// hook into the marionette event bus...
let application = MarionetteApplication.getInstance()

application.addInitializer(function() {
    application.on('schedule:view', function(sid) {
        application.navigate('/admin/imaging/schedule/'+sid)
        // controller.view_schedule(sid)
    })

    application.on('screen:view', function(sid) {
        application.navigate('/imaging/screen/'+sid)
        // controller.view_screen(sid)
    })
})



var bc = { title: 'Imaging Schedules', url: '/admin/imaging' }

const routes = [
    {
        path: '/admin/imaging',
        component: Page,
        children: [
            {
                path: '',
                name: 'admin-imaging',
                component: MarionetteView,
                props: { 
                    mview: Dashboard,
                    breadcrumbs: [{ title: 'Imaging Dashboard', url: '/admin/imaging' }]
                },
                // Navigation guard to protect access by permissions
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('imaging_dash')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/notfound')
                    } else {
                        next()
                    }
                }
            },
            {
                path: 'schedule',
                component: MarionetteView,
                props: { 
                    mview: ScheduleAdmin, 
                    options: {
                        collection: new Schedules(),
                    },
                    breadcrumbs: [bc, { title: 'Manage Imaging Schedules', url: '/admin/imaging/schedules' }]
                },
                // Navigation guard to protect access by permissions
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('schedules')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/notfound')
                    } else {
                        // Start the loading animation - marionette view will handle loading
                        application.loading()
                        next()
                    }
                }
            },
            {
                path: 'schedule/:sid',
                component: MarionetteView,
                props: route => ({ 
                    mview: ScheduleComponentAdmin, 
                    options: {
                        model: new Schedule({SCHEDULEID: route.params.sid}),
                    },
                    breadcrumbs: [bc, { title: 'Manage Imaging Schedules', url: '/admin/imaging/schedule' }],
                    breadcrumb_tags: ['NAME']
                }),
                // Navigation guard to protect access by permissions
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('schedule_comps')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/notfound')
                    } else {
                        // Start the loading animation
                        application.loading()
                        next()
                    }
                }
            },
            {
                path: 'preset',
                component: MarionetteView,
                props: { 
                    mview: PresetAdmin, 
                    breadcrumbs: [{ title: 'Manage Beamline Presets', url: '/admin/preset' }],
                },
                // Navigation guard to protect access by permissions
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('edit_presets')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/notfound')
                    } else {
                        if (application.options.get('preset_proposal')) {
                            application.cookie(application.options.get('preset_proposal'))
                            next()
                        } else {
                            application.message({ title: 'No Preset Proposal', message: 'No preset proposal is defined to store presets in' })
                            next('/notfound')
                        }
                    }
                }
            },
            {
                path: 'params',
                component: MarionetteView,
                props: { 
                    mview: ParamAdmin, 
                    breadcrumbs: [{ title: 'Manage Beamline Parameters', url: '/admin/params' }],
                },
                // Navigation guard to protect access by permissions
                beforeEnter: (to, from, next) => {
                    if (!application.user_can('manage_params')) {
                        application.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                        next('/notfound')
                    } else {
                        next()
                    }
                }
            },
        ]
    },
    {
        path: '/imaging/screen',
        component: Page,
        children: [
            {
                path: '',
                component: MarionetteView,
                props: { 
                    mview: ScreenAdmin,
                    options: {
                        collection: new Screens() 
                    },
                    breadcrumbs: [{ title: 'Crysallisation Screens', url: '/imaging/screen' }],
                },
            },
            {
                path: ':sid',
                component: MarionetteView,
                props: route => ({ 
                    mview: ScreenComponentAdmin,
                    options: {
                        model: new Screen({SCREENID: route.params.sid})
                    },
                    breadcrumbs: [{ title: 'Crysallisation Screens', url: '/imaging/screen' }],
                    breadcrumb_tags: ['NAME']
                }),
            },
        ]
    }
]

export default routes