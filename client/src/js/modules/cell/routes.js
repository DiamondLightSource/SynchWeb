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
// 'cell(/page/:page)': 'search',
// 'cell(/a/:a/b/:b/c/:c/al/:al/be/:be/ga/:ga)(/pdb/:pdb)(/page/:page)': 'search_cell',
// From code, unit cell search only links to a,b,c,al,be,ga search criteria (no per page or pdb)
// Unit cell parameters in path can't have decimals so check for numbers to stop greedy capture and allow pagination
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
                path: 'a/:a/b/:b/c/:c/al/:al/be/:be/ga/:ga([0-9]+)(/page/)?:page([0-9]+)?',
                name: 'cell-unit-search',
                component: MarionetteView,
                props: route => getProps(route),
            },
        ]
    }
]

export default routes