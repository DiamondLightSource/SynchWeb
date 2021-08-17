import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

import CellSearchView from 'modules/cell/views/search'

let bc = { title: 'Unit Cell Search' }

// All routes have same options
function getProps(route) {
    return {
        mview: CellSearchView,
        options: {
            pdb: route.params.pdb || null, 
            cell: { 
                a: route.params.a || null,
                b: route.params.b || null,
                c: route.params.c || null,
                al: route.params.al || null,
                be: route.params.be || null,
                ga: route.params.ga || null
            }, 
            page: route.params.page ? parseInt(route.params.page) : 1
        },
        breadcrumbs: [bc]
    }
}
// From code, unit cell search cell/a/b/c etc. only links to a,b,c,al,be,ga search criteria (no simultaneous pdb option)
// Unit cell parameters in path can include decimals, so check for numbers to stop greedy capture and allow pagination
const routes = [
    {
        path: '/cell',
        component: Page,
        children: [
            {
                path: '',
                name: 'cell-search',
                component: MarionetteView,
                props: route => getProps(route),
            },
            {
                path: 'page/:page([0-9]+)',
                name: 'cell-search',
                component: MarionetteView,
                props: route => getProps(route),
            },
            {
                path: 'pdb/:pdb([a-zA-Z_]+)(/page/)?:page([0-9]+)?',
                name: 'cell-search-pdb',
                component: MarionetteView,
                props: route => getProps(route),
            },
            {
                path: 'a/:a([0-9\.]+)/b/:b([0-9\.]+)/c/:c([0-9\.]+)/al/:al([0-9\.]+)/be/:be([0-9\.]+)/ga/:ga([0-9\.]+)(/page/)?:page([0-9]+)?',
                name: 'cell-unit-search',
                component: MarionetteView,
                props: route => getProps(route),
            },
        ]
    }
]

export default routes