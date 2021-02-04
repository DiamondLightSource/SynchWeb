define(['marionette',

    'modules/admin/models/group',

    'modules/admin/views/groups',
    'modules/admin/views/groupview',

    'models/proposal',
    'collections/proposals',
    'modules/admin/views/proposals',
    'modules/admin/views/proposalview',
    'modules/admin/views/addproposal',

    'models/visit',
    'modules/admin/views/visitview',
    'modules/admin/views/addvisit',

    'collections/users',
    'models/user',
    'modules/admin/views/users',
    'modules/admin/views/userview',
    'modules/admin/views/adduser',
    ], function(Marionette,
        Group, GroupsEditor, GroupView,
        Proposal, Proposals, ProposalList, ProposalView, AddProposalView,
        Visit, VisitView, AddVisitView,
        Users, User, UserList, UserView, AddUserView) {

    // Breadcrumb data
    var bc = { title: 'Manage Groups & Permissions', url: '/admin/groups' }
    var bc2 = { title: 'Manage Proposals & Visits', url: '/admin/proposals' }
    var bc3 = { title: 'Manage Users', url: '/admin/users' }
    
    var controller = {
        
        // Manage User Groups
        manageGroups: function(visit) {
            app.bc.reset([bc])
            app.content.show(new GroupsEditor())
        },

        viewGroup: function(gid) {
            app.loading()
            var group = new Group({ USERGROUPID: gid })
            group.fetch({
                success: function() {
                    app.bc.reset([bc, { title: group.get('NAME') }])
                    app.content.show(new GroupView({ model: group }))
                },
                
                error: function() {
                    app.bc.reset([bc])
                    app.message({ title: 'No such group', message: 'The specified group could not be found'})
                }
            })
        },

        // Manage Proposals
        manageProposals: function(s, page) {
            if (!app.user_can('manage_proposal')) {
                app.bc.reset([bc2])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc2])

            if (page) page = parseInt(page)
            else page = 1

            var proposals = new Proposals(null, { state: { currentPage: page }, queryParams: { s: s } })
            proposals.fetch()

            app.content.show(new ProposalList({ collection: proposals, params: { s: s } }))
        },

        addProposal: function() {
            if (!app.user_can('manage_proposal')) {
                app.bc.reset([bc2])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc2, { title: 'Add Proposal' }])
            app.content.show(new AddProposalView())
        },

        viewProposal: function(proposal) {
            if (!app.user_can('manage_proposal')) {
                app.bc.reset([bc2])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.loading()
            var prop = new Proposal({ PROPOSAL: proposal })
            prop.fetch({
                success: function() {
                    app.bc.reset([bc2, { title: prop.get('PROPOSAL') }])
                    app.content.show(new ProposalView({ model: prop }))
                },

                error: function() {
                    app.bc.reset([bc2])
                    app.message({ title: 'No such proposal', message: 'The specified proposal could not be found'})
                }
            })
        },


        // Manage Visits
        addVisit: function(proposal) {
            if (!app.user_can('manage_visits')) {
                app.bc.reset([bc2])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            var prop = new Proposal({ PROPOSAL: proposal })
            prop.fetch({
                success: function() {
                    app.bc.reset([bc2, { title: proposal }, { title: 'Add Visit' }])
                    app.content.show(new AddVisitView({ proposal: prop }))
                }
            })
        },

        viewVisit: function(vis) {
            if (!app.user_can('manage_visits')) {
                app.bc.reset([bc2])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.loading()
            var visit = new Visit({ VISIT: vis })
            visit.fetch({
                success: function() {
                    app.bc.reset([bc2, { title: visit.get('PROPOSAL'), url: '/admin/proposals/'+visit.get('PROPOSAL') }, { title: visit.get('VISIT') }])
                    app.content.show(new VisitView({ model: visit }))
                },

                error: function() {
                    app.bc.reset([bc2])
                    app.message({ title: 'No such visit', message: 'The specified visit could not be found'})
                }
            })
        },

        // Manage Users
        manageUsers: function(s, page) {
            if (!app.user_can('manage_users')) {
                app.bc.reset([bc3])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc3])

            if (page) page = parseInt(page)
            else page = 1

            var users = new Users(null, { state: { currentPage: page }, queryParams: { s: s } })
            users.fetch()

            app.content.show(new UserList({ collection: users, params: { s: s } }))
        },

        addUser: function() {
            if (!app.user_can('manage_users')) {
                app.bc.reset([bc3])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc3, { title: 'Add User' }])
            app.content.show(new AddUserView())
        },

        viewUser: function(person) {
            if (!app.user_can('manage_users')) {
                app.bc.reset([bc3])
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.loading()
            var user = new User({ PERSONID: person })
            user.fetch({
                success: function() {
                    app.bc.reset([bc3, { title: user.get('FULLNAME') }])
                    app.content.show(new UserView({ model: user }))
                },

                error: function() {
                    app.bc.reset([bc3])
                    app.message({ title: 'No such proposal', message: 'The specified proposal could not be found'})
                }
            })
        },
                   
    }

    app.addInitializer(function() {
        app.on('group:show', function(gid) {
            app.navigate('admin/groups/'+gid)
            controller.viewGroup(gid)
        })

        app.on('proposal:show', function(proposal) {
            app.navigate('admin/proposals/'+proposal)
            controller.viewProposal(proposal)
        })

        app.on('visit:show', function(visit) {
            app.navigate('admin/proposals/visit/'+visit)
            controller.viewVisit(visit)
        })

        app.on('useradm:show', function(person) {
            app.navigate('admin/users/'+person)
            controller.viewUser(person)
        })
    })

       
       
    return controller
})