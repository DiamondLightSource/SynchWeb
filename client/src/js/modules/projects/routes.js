// Specify the routes for this module
// Any Marionette View should use the MarionetteView wrapper component with a prop of the actual marionette view class
// Options can be passed into the marionette view class via the options prop
// Models and collections can be specified as props
// If a model or collection is passed in the data will be prefetched before the component is loaded
// Props that make use of the route object should use props: route => ({ ...define prop using route.params object})
import Page from 'app/layouts/page.vue'
import Debug from 'app/views/debug.vue'
import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import Project from 'models/project'
import Projects from 'collections/projects'
const ProjectList = import(/* webpackChunkName: "projects" */ 'modules/projects/views/list')
const ProjectView = import(/* webpackChunkName: "projects" */ 'modules/projects/views/view')

let bc = { title: 'Projects', url: '/projects' }

app.addInitializer(function() {
    app.on('projects:view', function(pid) {
        app.navigate('/projects/pid/'+pid)
    })
})

const routes = [
  {
    path: '/projects',
    component: Page,
    children: [
        {
            path: '',
            name: 'projects-list',
            component: MarionetteView,
            props: {
                mview: ProjectList,
                breadcrumbs: [bc],
                options: {
                    collection: new Projects()
                }
            }
        },
        {
            // We need to pass the regex to allow capture of the second optional parameter
            path: 'pid/:pid',
            name: 'project-view',
            component: MarionetteView,
            props: route => ({
                mview: ProjectView,
                breadcrumbs: [bc],
                breadcrumb_tags: ['TITLE'],
                options: {
                    model: new Project({ PROJECTID: route.params.pid })
                }
            })
        },
    ]
  },
]

export default routes