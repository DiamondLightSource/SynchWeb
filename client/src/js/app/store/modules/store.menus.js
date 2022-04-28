import EmMenu from 'modules/types/em/menu.js'
import GenMenu from 'modules/types/gen/menu.js'
import MxMenu from 'modules/types/mx/menu.js'
import PowMenu from 'modules/types/pow/menu.js'
import SaxsMenu from 'modules/types/saxs/menu.js'
import SmMenu from 'modules/types/sm/menu.js'
import TomoMenu from 'modules/types/tomo/menu.js'
import XpdfMenu from 'modules/types/xpdf/menu.js'
import B18Menu from 'modules/types/b18/menu.js'
import I16Menu from 'modules/types/i16/menu.js'
import I14Menu from 'modules/types/i14/menu.js'
import I18Menu from 'modules/types/i18/menu.js'
import I08Menu from 'modules/types/i08/menu.js'
import I08_1Menu from 'modules/types/i08-1/menu.js'
import I11Menu from 'modules/types/i11/menu.js'
import K11Menu from 'modules/types/k11/menu.js'
import I20Menu from 'modules/types/i20/menu.js'
import I20_1Menu from 'modules/types/i20-1/menu.js'


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
        'b18': B18Menu,
        'i16': I16Menu,
        'i14': I14Menu,
        'i18': I18Menu,
        'i08': I08Menu,
        'i08-1': I08_1Menu,
        'i11': I11Menu,
        'k11': K11Menu,
        'i20': I20Menu,
        'i20-1': I20_1Menu,
      }
    }),

    getters: {
        getMenu: (state, getters, rootState) => (menuType) => {
            return state.menus[rootState.proposal.proposalType] ? state.menus[rootState.proposal.proposalType][menuType]: []
        }
    }
}
export default menuStore