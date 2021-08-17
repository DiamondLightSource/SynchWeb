import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import StatusView from 'modules/status/views/status'

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
    }
]

export default routes