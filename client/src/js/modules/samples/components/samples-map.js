import SampleList from 'modules/samples/views/list'
import SampleView from 'modules/samples/views/view'

import GenSampleList from 'modules/types/gen/samples/views/list'
import GenSampleView from 'modules/types/gen/samples/views/view'

import ProteinList from  'modules/samples/views/proteinlist'
import ProteinView from 'modules/samples/views/proteinview'
import AddProteinView from 'modules/samples/views/proteinadd'

import GenComponentList from 'modules/types/gen/samples/views/componentlist'
import GenComponentAdd from 'modules/types/gen/samples/views/componentadd'
import GenComponentView from 'modules/types/gen/samples/views/componentview'

import XPDFPhaseList from 'modules/types/xpdf/samples/views/phaselist'
import XPDFPhaseView from 'modules/types/xpdf/samples/views/phaseview'
import XPDFPhaseAdd from 'modules/types/xpdf/samples/views/phaseadd'

import XPDFSampleList from 'modules/types/xpdf/samples/views/samplelist'
import XPDFSampleView from 'modules/types/xpdf/samples/views/sampleview'
import XPDFAddSampleView from 'modules/types/xpdf/samples/views/sampleadd'

import XPDFInstanceList from 'modules/types/xpdf/samples/views/instancelist'
import XPDFInstanceView from 'modules/types/xpdf/samples/views/instanceview'

import SimpleSampleAdd from 'modules/types/xpdf/samples/views/simplesampleaddpoploader'

export const SampleListMap = {
    mx:     { title: 'Sample', view: SampleList },
    saxs:   { title: 'Sample', view: SampleList },
    gen:    { title: 'Sample', view: GenSampleList },
    xpdf:   { title: 'Instance', view: XPDFInstanceList },
    default:{ title: 'Sample', view: SampleList }
}

export const SampleViewMap = {
    mx:     { title: 'Sample', view: SampleView },
    saxs:   { title: 'Sample', view: SampleView },
    gen:    { title: 'Sample', view: GenSampleView },
    xpdf:   { title: 'Instance', view: XPDFInstanceView },
    default:{ title: 'Sample', view: SampleView }
}

export const SimpleSampleMap = {
    xpdf:   { title: 'Simple Sample', view: SimpleSampleAdd },
    default:{ title: 'Simple Sample', view: SimpleSampleAdd }
}

export const ProteinListMap = {
    mx:     { title: 'Protein', view: ProteinList },
    saxs:   { title: 'Protein', view: ProteinList },
    gen:    { title: 'Component', view: GenComponentList },
    xpdf:   { title: 'Phase',   view: XPDFPhaseList },
    default:{ title: 'Protein', view: ProteinList }
}

export const ProteinAddMap = {
    mx:     { title: 'Protein', view: AddProteinView },
    saxs:   { title: 'Protein', view: AddProteinView },
    gen:    { title: 'Component', view: GenComponentAdd },
    xpdf:   { title: 'Phase', view: XPDFPhaseAdd },
    default:{ title: 'Protein', view: AddProteinView }
}

export const ProteinViewMap = {
    mx:     { title: 'Protein', view: ProteinView },
    saxs:   { title: 'Protein', view: ProteinView },
    gen:    { title: 'Component', view: GenComponentView },
    xpdf:   { title: 'Phase', view: XPDFPhaseView },
    default:{ title: 'Protein', view: ProteinView }
}

// There is no default Crystal View?
// Only xpdf proposal type exists
export const CrystalListMap = {
    xpdf:   { title: 'Sample', view: XPDFSampleList },
    default:{ title: 'Crystal', view: XPDFSampleList }
}

export const CrystalViewMap = {
    xpdf:   { title: 'Sample', view: XPDFSampleView },
    default:{ title: 'Crystal', view: XPDFSampleView }
}

export const CrystalAddMap = {
    xpdf:   { title: 'Sample', view: XPDFAddSampleView },
    default:{ title: 'Crystal', view: XPDFAddSampleView }
}

