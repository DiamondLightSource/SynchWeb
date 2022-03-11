import BeamlineStatusView from 'modules/status/views/beamline-status-view.vue'

const routes = [
    {
        path: '/status/bl/:bl',
        component: BeamlineStatusView,
    }
]

export default routes