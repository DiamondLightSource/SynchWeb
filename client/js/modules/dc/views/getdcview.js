define(['views/getview',
	'modules/dc/datacollections',
    'modules/types/gen/dc/datacollections',
    'modules/types/tomo/dc/datacollections',
    'modules/types/em/dc/datacollections',
    'modules/types/pow/dc/datacollections',
    'modules/types/saxs/dc/datacollections',
    
], function(GetView,
	DCList,
	GenericDCList, TomoDCList, EMDCList, POWDCList, SAXSDCList
	){


	return {

        DCView: new GetView({
        	views: {
                mx: DCList,
                sm: DCList,
                gen: GenericDCList,
                tomo: TomoDCList,
                em: EMDCList,
                pow: POWDCList,
                saxs: SAXSDCList,
            },
        	default: GenericDCList,
        })


	}


})