import EmMenu from 'modules/types/em/menu.js'
import GenMenu from 'modules/types/gen/menu.js'
import MxMenu from 'modules/types/mx/menu.js'
import PowMenu from 'modules/types/pow/menu.js'
import SaxsMenu from 'modules/types/saxs/menu.js'
import SmMenu from 'modules/types/sm/menu.js'
import TomoMenu from 'modules/types/tomo/menu.js'
import XpdfMenu from 'modules/types/xpdf/menu.js'
import GenProcMenu from 'modules/types/genproc/menu.js'
import ConexsMenu from 'modules/types/conexs/menu.js'

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
        'b18': ConexsMenu,
        'i16': GenProcMenu,
        'i14': GenProcMenu,
        'i18': ConexsMenu,
        'i08': GenProcMenu,
        'i11': GenProcMenu,
        'k11': GenProcMenu,
        'i20': ConexsMenu,
        'i12': GenProcMenu,
        'i13': GenProcMenu,
        'b24': GenProcMenu,
        'epsic': GenProcMenu,
        'i05': GenProcMenu,
        'i06': GenProcMenu,
        'b07': GenProcMenu,
        'i07': GenProcMenu,
        'i09': GenProcMenu,
        'i10': GenProcMenu,
        'b16': GenProcMenu,
        'b22': GenProcMenu,
        'b23': GenProcMenu,
        'i21': GenProcMenu,
      }
    }),

    getters: {
        getMenu: (state, getters, rootState) => (menuType) => {
            return state.menus[rootState.proposal.proposalType] ? state.menus[rootState.proposal.proposalType][menuType]: []
        }
    }
}
export default menuStore
