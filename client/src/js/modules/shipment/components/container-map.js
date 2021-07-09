import ContainersView from 'modules/shipment/views/containers'
import ContainerView from 'modules/shipment/views/container'
import ContainerPlateView from 'modules/shipment/views/containerplate'

import ContainerAddView from 'modules/shipment/views/containeradd'
import XpdfContainersView from 'modules/types/xpdf/shipment/views/containers'
import XpdfContainerView from 'modules/types/xpdf/shipment/views/containerview'
import XpdfContainerAddView from 'modules/types/xpdf/shipment/views/containeradd'

// Only xpdf and normal (mx) style container types exist
export const ContainerListMap = {
    xpdf:   { title: 'Container', view: XpdfContainersView },
    default:{ title: 'Container', view: ContainersView }
}

export const ContainerViewMap = {
  mx:     { title: 'Container', view: ContainerView },
  saxs:   { title: 'Container', view: null }, // Because we want to use new components
  xpdf:   { title: 'Container', view: XpdfContainerView },
  default:{ title: 'Container', view: ContainerView }
}

export const ContainerPlateViewMap = {
  mx:     { title: 'Container', view: ContainerPlateView },
  saxs:   { title: 'Container', view: null }, // Because we want to use new components
  default:{ title: 'Container', view: ContainerPlateView }
}

export const ContainerAddMap = {
    xpdf:   { title: 'Container', view: XpdfContainerAddView },
    saxs:   { title: 'Container', view: null }, // Because we want to use new components
    default:{ title: 'Container', view: ContainerAddView },
    mx: { title: 'Container', view: null }
}

