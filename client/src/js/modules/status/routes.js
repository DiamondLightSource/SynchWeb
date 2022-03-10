import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import StatusView from 'modules/status/views/status'
import BeamlineStatusView from 'modules/status/views/beamline-status-view.vue'

const routes = [
    {
        path: '/status/bl/:bl',
        component: MarionetteView,
        props: route => ({
            mview: StatusView,
            options: {
                bl: route.params.bl
            },
            breadcrumbs: [{ title: 'Beamline Status' }, { title: route.params.bl }]
        })
    },
    {
        path: '/status-vue/bl/:bl',
        component: BeamlineStatusView,
    }
]

export default routes