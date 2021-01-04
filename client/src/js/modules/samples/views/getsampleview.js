define(['views/getview',
        'modules/samples/views/list',
        'modules/samples/views/view',
    
        'modules/types/gen/samples/views/list',
        'modules/types/gen/samples/views/view',

        'modules/types/xpdf/samples/views/simplesampleaddpoploader',

        'modules/samples/views/proteinlist',
        'modules/samples/views/proteinview',
        'modules/samples/views/proteinadd',

        'modules/types/gen/samples/views/componentlist',
        'modules/types/gen/samples/views/componentadd',
        'modules/types/gen/samples/views/componentview',

        'modules/types/xpdf/samples/views/phaselist',
        'modules/types/xpdf/samples/views/phaseview',
        'modules/types/xpdf/samples/views/phaseadd',

        'modules/types/xpdf/samples/views/samplelist',
        'modules/types/xpdf/samples/views/sampleview',
        'modules/types/xpdf/samples/views/sampleadd',

        'modules/types/xpdf/samples/views/instancelist',
        'modules/types/xpdf/samples/views/instanceview',

], function(GetView,
    SampleList, SampleView,
    GenSampleList, GenSampleView,

    SimpleSampleAdd,

    ProteinList, ProteinView, AddProteinView,
    GenComponentList, GenComponentAdd, GenComponentView,

    XPDFPhaseList, XPDFPhaseView, XPDFPhaseAdd,
    XPDFSampleList, XPDFSampleView, XPDFAddSampleView,
    XPDFInstanceList, XPDFInstanceView
    ){


    var SampleTitles = {
        xpdf: 'Instance',
    }

    var SampleDefault = 'Sample'

    var SimpleSampleTitles = {
        xpdf: 'Simple Sample',
    }


    var ProteinTitles = {
        mx: 'Protein',
        gen: 'Component',
        xpdf: 'Phase',
    }

    var ProteinDefault = 'Component'


    var CrystalTitles = {
        xpdf: 'Sample',
    }

    var CrystalDefault = 'Crystal'


    return {

        SampleList: new GetView({
            views: {
                mx: SampleList,
                saxs: SampleList,
                gen: GenSampleList,
                xpdf: XPDFInstanceList,
            },
            default: GenSampleList,

            titles: SampleTitles,
            default_title: SampleDefault,
        }),

        SampleView: new GetView({
            views: {
                mx: SampleView,
                saxs: SampleView,
                gen: GenSampleView,
                xpdf: XPDFInstanceView,
            },
            default: GenSampleView,

            titles: SampleTitles,
            default_title: SampleDefault,
        }),

        SimpleSampleAdd: new GetView({
            views: {
                xpdf: SimpleSampleAdd,
            },
            default: SimpleSampleAdd,

            titles: SimpleSampleTitles,
            default_title: SampleDefault,
        }),



        ProteinList: new GetView({
            views: {
                mx: ProteinList,
                saxs: ProteinList,
                gen: GenComponentList,
                xpdf: XPDFPhaseList,
            },
            default: GenComponentList,

            titles: ProteinTitles,
            default_title: ProteinDefault,
        }),


        ProteinAdd: new GetView({
            views: {
                mx: AddProteinView,
                saxs: AddProteinView,
                gen: GenComponentAdd,
                xpdf: XPDFPhaseAdd
            },
            default: GenComponentAdd,

            titles: ProteinTitles,
            default_title: ProteinDefault,
        }),


        ProteinView: new GetView({
            views: {
                mx: ProteinView,
                saxs: ProteinView,
                gen: GenComponentView,
                xpdf: XPDFPhaseView,
            },
            default: GenComponentView,

            titles: ProteinTitles,
            default_title: ProteinDefault,
        }),



        CrystalList: new GetView({
            views: {
                xpdf: XPDFSampleList,
            },

            // default: CrystalList,
            
            titles: CrystalTitles,
            default_title: CrystalDefault,
        }),


        CrystalView: new GetView({
            views: {
                xpdf: XPDFSampleView,
            },

            // default: CrystalView,
            
            titles: CrystalTitles,
            default_title: CrystalDefault,
        }),


        CrystalAdd: new GetView({
            views: {
                xpdf: XPDFAddSampleView,
            },

            // default: CrystalAddView
            
            titles: CrystalTitles,
            default_title: CrystalDefault,
        })

    }


})