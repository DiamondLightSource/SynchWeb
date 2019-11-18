/*
 * Select views for the shipment module based on proposal type.
 */

define ([
    'views/getview',
 
    // 'modules/shipment/views/shipment',
    'modules/shipment/views/containers',
    'modules/shipment/views/container',
    'modules/shipment/views/containeradd',
     
    // 'modules/types/xpdf/shipment/views/shipment',
    'modules/types/xpdf/shipment/views/containers',
    'modules/types/xpdf/shipment/views/containerview',
    'modules/types/xpdf/shipment/views/containeradd'
    ], function(
    GetView,
    
    // ShipmentView,
    ContainersView,
    ContainerView,
    ContainerAddView,
    
    // XpdfShipmentView,
    XpdfContainersView,
    XPDFContainerView,
    XPDFContainerAdd
    ) {
    
    return {

        // ShipmentView : new GetView({
        //     views: {
        //         mx: ShipmentView,
        //         xpdf: XpdfShipmentView,
        //     },
        //     default: ShipmentView,
        // }),
        

        ContainersList: new GetView({
            views: {
                xpdf: XpdfContainersView,
            },
            default: ContainersView,
        }),
        
        ContainerView: new GetView({
            views: {
                xpdf: XPDFContainerView,
            },
            default: ContainerView,
        }),
        
        ContainerAddView: new GetView({
            views: {
                xpdf: XPDFContainerAdd,
            },
            default: ContainerAddView,
        }),
        
    }
})
