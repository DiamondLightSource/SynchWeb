// Specify the routes for this module
// These all use wrapper components to hide the complexity
// Depending on the proposal type different marionette views are needed
// The wrapper components use samples-map to figure out which views are required

// Because we are using wrapper vue components we can use the standard lazy loading async method
const ConexsSubmissionWrapper = () => import(/* webpackChunkName: "submission" */ 'modules/submission/components/conexs-submission-wrapper.vue')

app.addInitializer(function() {
    app.on('conexs:show', function() {
      app.navigate('/conexs')
    })
})

const routes = [
    // Submission routes
    {
      path: '/conexs',
      name: 'conexs-submission',
      component: ConexsSubmissionWrapper,
    },
]

export default routes