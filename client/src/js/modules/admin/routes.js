import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

/*
* AMD module definitions can not be used asynchronously with webpack (i.e. loaded on demand)
* The definitions below help chunk up the code and lazy load the module on app start
* See DC for loading on demand with vue components
* MarionetteViewWrapper can deal with views being Promises as these are or normal constructors
*/
const GroupsEditor = import(/* webpackChunkName: "admin" */ 'modules/admin/views/groups')
const GroupsView = import(/* webpackChunkName: "admin" */ 'modules/admin/views/groupview')
// Using the group as a plain constructor in this file
import Group from 'modules/admin/models/group'

const AddProposal  = import(/* webpackChunkName: "admin" */ 'modules/admin/views/addproposal')
const ProposalList  = import(/* webpackChunkName: "admin" */ 'modules/admin/views/proposals')
const ProposalView = import(/* webpackChunkName: "admin" */ 'modules/admin/views/proposalview')

const AddVisit = import(/* webpackChunkName: "admin" */ 'modules/admin/views/addvisit')
const VisitView = import(/* webpackChunkName: "admin" */ 'modules/admin/views/visitview')

const AddUser = import(/* webpackChunkName: "admin" */ 'modules/admin/views/adduser')
const UserList = import(/* webpackChunkName: "admin" */ 'modules/admin/views/users')
const UserView = import(/* webpackChunkName: "admin" */ 'modules/admin/views/userview')

/* These models will be loaded elsewhere so we don't put them in the admin chunk */
import Proposal from 'models/proposal'
import Proposals from 'collections/proposals'
import Visit from 'models/visit'
import User from 'models/user'
import Users from 'collections/users'

// Register marionette navigation events
app.addInitializer(function() {
    app.on('group:show', function(gid) {
        app.navigate('/admin/groups/'+gid)
    })

    app.on('proposal:show', function(proposal) {
        app.navigate('/admin/proposals/'+proposal)
    })

    app.on('visit:show', function(visit) {
        app.navigate('/admin/proposals/visit/'+visit)
    })

    app.on('useradm:show', function(person) {
        app.navigate('/admin/users/'+person)
    })
})

let bc = { title: 'Manage Groups & Permissions', url: '/admin/groups' }
let bc2 = { title: 'Manage Proposals & Visits', url: '/admin/proposals' }
let bc3 = { title: 'Manage Users', url: '/admin/users' }

// Could use the store to cache values like this.
let proposalModel = {}

// This function resolves the retrieved model
// Rather than set this directly to proposalModel we do that in the guard
// In future we may move to using vuex store to save the model
function lookupProposal(params) {
    return new Promise((resolve, reject) => {
        let proposal = new Proposal({ PROPOSAL: params.prop })

        proposal.fetch({
            // If OK trigger next
            success: function(model) {
              console.log("Admin proposal model lookup OK")
              resolve(model)
            },
            // Original controller had no error condition...
            error: function() {
                reject({msg: "Admin proposal model lookup failed"})
            }
        })
    })
}


const routes = [
    // Routes to manage user groups
    {
        path: '/admin/groups',
        component: Page,
        // Example of using meta fields to store permissions
        // This is checked in the global router guard
        // Applies to all children
        meta: {
            permission: 'manage_groups'
        },
        children: [
            // First route is simple - just requires the marionette view and some breadcrumbs
            // It does not use any information from the route or prefetching models
            // Therefore can use props as a plain object
            {
                path: '',
                name: 'admin-manage-groups',
                component: MarionetteView,
                props: {
                    mview: GroupsEditor,
                    breadcrumbs: [bc],
                },
            },
            // View group path requires info from the route object
            // Hence props is a function that resolves when loaded and passes in the group id
            {
                path: ':gid',
                name: 'admin-view-group',
                component: MarionetteView,
                props: route => ({
                    mview: GroupsView,
                    breadcrumbs: [bc],
                    breadcrumb_tags: ['NAME'],
                    options: {
                        model: new Group({USERGROUPID: route.params.gid})
                    }
                }),
            }
        ]
    },
    // Routes to manage proposals and visits/sessions
    {
        path: '/admin/proposals',
        component: Page,
        meta: {
            permission: 'manage_proposal'
        },
        children: [
            {
                // The original router for admin does not provide search 's' or page parameters
                path: '',
                name: 'admin-manage-proposals',
                component: MarionetteView,
                props: route => ({
                    mview: ProposalList,
                    breadcrumbs: [bc2],
                    options: {
                        collection: new Proposals(null, { state: { currentPage: route.params.page ? parseInt(route.params.page) : 1}}),
                        params: {s: route.params.s}
                    }
                }),
            },
            {
                path: 'add',
                name: 'admin-add-proposal',
                component: MarionetteView,
                props: route => ({
                    mview: AddProposal,
                    breadcrumbs: [bc2],
                    options: {
                        collection: new Proposals(null, { state: { currentPage: route.params.page ? parseInt(route.params.page) : 1}}),
                        params: {s: route.params.s}
                    }
                }),
            },
            {
                path: ':prop',
                name: 'admin-view-proposal',
                component: MarionetteView,
                props: route => ({
                    mview: ProposalView,
                    breadcrumbs: [bc2],
                    breadcrumb_tags: ['PROPOSAL'],
                    options: {
                        model: new Proposal({ PROPOSAL: route.params.prop }),
                        params: {s: route.params.s}
                    }
                }),
            },
            {
                path: 'visit/add/:prop',
                name: 'admin-add-visit',
                component: MarionetteView,
                props: route => ({
                    mview: AddVisit,
                    breadcrumbs: [bc2, {title: route.params.prop}, {title: 'Add Visit'}],
                    options: {
                        proposal: proposalModel,
                        // proposal: store.state.models['admin-proposal'],
                    }
                }),
                beforeEnter: (to, from, next) => {
                    // Start the loading animation
                    app.loading()

                    lookupProposal(to.params).then((response) => {
                        console.log("Lookup Model OK - " + response)
                        // Either set the module proposalModel or save within the VueX store
                        // If we change to use the store the above options.proposal would need to change
                        proposalModel = response
                        // store.commit('saveBackboneModel', {name: 'admin-proposal', model: response})
                        next()
                    }, (error) => {
                        console.log(error.msg)
                        next('/notfound')
                    }).finally( () => {
                        // In either case we can stop the loading animation
                        app.loading(false)
                    })
                },
            },
            {
                path: 'visit/:visit',
                name: 'admin-view-visit',
                component: MarionetteView,
                props: route => ({
                    mview: VisitView,
                    breadcrumbs: [bc2],
                    breadcrumb_tags: ['PROPOSAL'],
                    options: {
                        model: new Visit({ VISIT: route.params.visit }),
                    }
                }),
            },
        ],
    },
    // Routes to manage users
    // Could use a meta:permission property for authentication
    // This set of routes demonstrates use of a router guard for the same purpose
    {
        path: '/admin/users',
        component: Page,
        children: [
            {
                path: '',
                name: 'admin-manage-users',
                component: MarionetteView,
                props: route => ({
                    mview: UserList,
                    breadcrumbs: [bc3],
                    options: {
                        collection: new Users(null, { state: { currentPage: route.params.page ? parseInt(route.params.page) : 1}}),
                        params: {s: route.params.s}
                    }
                }),
            },
            {
                path: 'add',
                name: 'admin-add-user',
                component: MarionetteView,
                props: {
                    mview: AddUser,
                    breadcrumbs: [bc3, { title: 'Add User' }],
                },
            },
            {
                path: ':person',
                name: 'admin-view-user',
                component: MarionetteView,
                props: route => ({
                    mview: UserView,
                    breadcrumbs: [bc3],
                    breadcrumb_tags: ['FULLNAME'],
                    options: {
                        model: new User({ PERSONID: route.params.person })
                    }
                }),
            }
        ],
        // Example of using a route guard to test for permissions
        // This will run for any child route
        // Better practice to stick with meta fields unless specific behaviour required
        // Left here as a reference for alternative method to meta
        beforeEnter(to, from, next) {
            if (!app.user_can('manage_users')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                next('/403?url='+to.fullPath)
            } else {
                next()
            }
        }
    },

]

export default routes