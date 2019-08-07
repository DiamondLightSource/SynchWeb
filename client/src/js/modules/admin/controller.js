define(['marionette',

    'modules/admin/models/group',

    'modules/admin/views/groups',
    'modules/admin/views/groupview',
    ], function(Marionette, Group, GroupsEditor, GroupView) {
    
    var bc = { title: 'Manage Groups &amp; Permissions', url: '/admin/groups' }
    
    var controller = {
        
        // Select visit to assign
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
        }
                   
    }

    app.addInitializer(function() {
        app.on('group:show', function(gid) {
            app.navigate('admin/groups/'+gid)
            controller.viewGroup(gid)
        })
    })

       
       
    return controller
})