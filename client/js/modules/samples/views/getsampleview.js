define(['views/getview',
		'modules/samples/views/list',
        'modules/samples/views/view',
    
        'modules/types/gen/samples/views/list',
        'modules/types/gen/samples/views/view',

        'modules/samples/views/proteinlist',
        'modules/samples/views/proteinview',
        'modules/samples/views/proteinadd',

        'modules/types/gen/samples/views/componentlist',
        'modules/types/gen/samples/views/componentadd',
        'modules/types/gen/samples/views/componentview',
], function(GetView,
	SampleList, SampleView,
	GenSampleList, GenSampleView,

	ProteinList, ProteinView, AddProteinView,
	GenComponentList, GenComponentAdd, GenComponentView
	){


	return {

		SampleList: new GetView({
			views: {
                mx: SampleList,
 				saxs: SampleList,
              	gen: GenSampleList,
			},
			default: GenSampleList,
		}),

		SampleView: new GetView({
        	views: {
                mx: SampleView,
        		saxs: SampleView,
                gen: GenSampleView,
        	},
        	default: GenSampleView,
        }),



		ProteinList: new GetView({
			views: {
                mx: ProteinList,
				saxs: ProteinList,
            	gen: GenComponentList,
            },
            default: GenComponentList,
        }),


        ProteinAdd: new GetView({
        	views: {
                mx: AddProteinView,
        		saxs: AddProteinView,
            	gen: GenComponentAdd,
        	},
        	default: GenComponentAdd
        }),


        ProteinView: new GetView({
        	views: {
                mx: ProteinView,
        		saxs: ProteinView,
                gen: GenComponentView,
        	},
        	default: GenComponentView,
        })


	}


})