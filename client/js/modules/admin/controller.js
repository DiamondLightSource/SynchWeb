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

    ], function(Marionette, 

        Group, GroupsEditor, GroupView,
        Proposal, Proposals, ProposalList, ProposalView, AddProposalView,
        Visit, VisitView, AddVisitView) {
    
    var bc = { title: 'Manage Groups & Permissions', url: '/admin/groups' }
    var bc2 = { title: 'Manage Proposals & Visits', url: '/admin/proposals' }

    var controller = {
        
        // Manage User Groups
        manageGroups: function() {
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
    })

       
       
    return controller
})