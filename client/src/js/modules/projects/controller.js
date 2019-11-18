define(['underscore', 'marionette',
        'models/project',
        'collections/projects',
        'modules/projects/views/list',
        'modules/projects/views/view',
    
], function(_, Marionette, Project, Projects, ProjectList, ProjectView) {
    
    var bc = { title: 'Projects', url: '/projects' }
    
    var controller = {
        list: function() {
            app.loading()
            console.log('prop list')
            app.bc.reset([bc])
            var projects = new Projects()
            projects.fetch().done(function() {
                app.content.show(new ProjectList({ collection: projects }))
            })
        },
       
        view: function(pid) {
            var project = new Project({ PROJECTID: pid })
            project.fetch({
                success: function() {
                    app.bc.reset([bc, {title: project.get('TITLE') }])
                    app.content.show(new ProjectView({ model: project }))
                },
                error: function() {
                    app.bc.reset([bc, { title: 'No such project' }])
                    app.message({ title: 'No such project', message: 'The specified project could not be found'})
                },
                
            })
        }
    }
       
       
    app.addInitializer(function() {
        app.on('projects:view', function(pid) {
            app.navigate('projects/pid/'+pid)
            controller.view(pid)
        })
    })
       
    return controller
})
