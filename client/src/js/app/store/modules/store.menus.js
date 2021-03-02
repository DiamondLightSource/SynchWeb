import EmMenu from 'modules/types/em/menu.js'
import GenMenu from 'modules/types/gen/menu.js'
import MxMenu from 'modules/types/mx/menu.js'
import PowMenu from 'modules/types/pow/menu.js'
import SaxsMenu from 'modules/types/saxs/menu.js'
import SmMenu from 'modules/types/sm/menu.js'
import TomoMenu from 'modules/types/tomo/menu.js'
import XpdfMenu from 'modules/types/xpdf/menu.js'

const menuStore = {
    namespaced: true,
    state: () => ({
      menus: {
        'em': EmMenu,
        'gen': GenMenu,
        'mx': MxMenu,
        'pow': PowMenu,
        'saxs': SaxsMenu,
        'sm': SmMenu,
        'tomo': TomoMenu,
        'xpdf': XpdfMenu,
      }
    }),

    getters: {
        getMenu: (state, getters, rootState) => (menuType) => {
            return state.menus[rootState.proposal.proposalType] ? state.menus[rootState.proposal.proposalType][menuType]: []
        }
    }
}
export default menuStore