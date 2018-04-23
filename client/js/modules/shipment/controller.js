define(['marionette',
        'modules/shipment/views/getshipmentview',

        'models/dewar',
        'models/shipment',
        'collections/shipments',
        'modules/shipment/views/shipments',
        'modules/shipment/views/shipment',
        'modules/shipment/views/shipmentadd',
    
        'models/container',
        'collections/containers',
        'modules/shipment/views/container',
        'modules/shipment/views/containerplate',
        // 'modules/shipment/views/containeradd',
        'modules/shipment/views/containers',
        'modules/imaging/views/queuecontainer',

        'modules/shipment/models/containerregistry',
        'modules/shipment/collections/containerregistry',
        'modules/shipment/views/containerregistry',
        'modules/shipment/views/registeredcontainer',

        'modules/shipment/models/dewarregistry',
        'modules/shipment/collections/dewarregistry',
        'modules/shipment/views/dewarreg',
        'modules/shipment/views/regdewar',
        'modules/shipment/views/regdewaradd',

        'modules/shipment/views/dispatch',
        'modules/shipment/views/transfer',

        'collections/dewars',
        'modules/shipment/views/dewaroverview',
        'modules/shipment/views/manifest',

        'modules/shipment/views/createawb',
        'modules/shipment/views/rebookpickup',
        'modules/types/xpdf/views/plan',

        'models/proplookup',
    
], function(Marionette,
    GetView,
    Dewar, Shipment, Shipments, 
    ShipmentsView, ShipmentView, ShipmentAddView,
    Container, Containers, ContainerView, ContainerPlateView, /*ContainerAddView,*/ ContainersView, QueueContainerView,
    ContainerRegistry, ContainersRegistry, ContainerRegistryView, RegisteredContainer,
    RegisteredDewar, DewarRegistry, DewarRegView, RegDewarView, RegDewarAddView,
    DispatchView, TransferView, Dewars, DewarOverview, ManifestView, CreateAWBView, RebookPickupView,
    PlanView,
    ProposalLookup) {
    
    var bc = { title: 'Shipments', url: '/shipments' }
        
  var controller = {
    list: function(page) {
      console.log('ship list')
      app.loading()
      var shipments = new Shipments()
        
      shipments.state.currentPage = page ? parseInt(page) : 1
      shipments.fetch().done(function() {
        app.bc.reset([bc])
        app.content.show(new ShipmentsView({ collection: shipments }))
      })
    },
                                                
    view: function(sid) {
        var lookup = new ProposalLookup({ field: 'SHIPPINGID', value: sid })
        lookup.find({
            success: function() {
                app.log('ship view', sid)
                var shipment = new Shipment({ SHIPPINGID: sid })
                  shipment.fetch({
                      success: function() {
                          app.bc.reset([bc, { title: shipment.get('SHIPPINGNAME') }])
                          app.content.show(new ShipmentView({ model: shipment }))
                      },
                      error: function() {
                          app.bc.reset([bc])
                          app.message({ title: 'No such shipment', message: 'The specified shipment could not be found'})
                      },
                  })
            }, 

            error: function() {
                app.bc.reset([bc, { title: 'No such shipment' }])
                app.message({ title: 'No such shipment', message: 'The specified shipment could not be found'})
            }
        })
    },
      
    add: function() {
      app.log('ship add view')
      app.bc.reset([bc, { title: 'Add New Shipment' }])
      app.content.show(new ShipmentAddView())
    },


    create_awb: function(sid) {
        var shipment = new Shipment({ SHIPPINGID: sid })
        shipment.fetch({
            success: function() {
                app.bc.reset([bc, { title: shipment.get('SHIPPINGNAME') }, { title: 'Create Airway Bill' }])
                app.content.show(new CreateAWBView({ shipment: shipment }))
            },
            error: function() {
                app.bc.reset([bc])
                app.message({ title: 'No such shipment', message: 'The specified shipment could not be found'})
            },
        })
    },


    rebook_pickup: function(sid) {
        var shipment = new Shipment({ SHIPPINGID: sid })
        shipment.fetch({
            success: function() {
                if (shipment.get('DELIVERYAGENT_FLIGHTCODE')) {
                    app.bc.reset([bc, { title: shipment.get('SHIPPINGNAME') }, { title: 'Rebook Pickup' }])
                    app.content.show(new RebookPickupView({ shipment: shipment }))
                } else {
                    app.bc.reset([bc])
                    app.message({ title: 'Shipment not booked', message: 'The specified shipment does not have a valid courier booking'})
                }
            },
            error: function() {
                app.bc.reset([bc])
                app.message({ title: 'No such shipment', message: 'The specified shipment could not be found'})
            },
        })
    },
    
    
    container_list: function(s, ty, page) {
      console.log('cont list')
      app.loading()
      app.bc.reset([bc, { title: 'Containers' }])
        
      page = page ? parseInt(page) : 1
      var containers = new Containers(null, { state: { currentPage: page }, queryParams: { s: s, ty: ty } })
      containers.fetch().done(function() {
          app.content.show(GetView.ContainersList.get(app.type, { collection: containers, params: { s: s, ty: ty } }))
      })
    },
      
      
    view_container: function(cid, iid, sid) {
        var lookup = new ProposalLookup({ field: 'CONTAINERID', value: cid })
        lookup.find({
            success: function() {
                app.log('cont view', cid, iid, sid)
                var container = new Container({ CONTAINERID: cid })
                container.fetch({
                    success: function() {
                        app.bc.reset([bc, { title: container.get('SHIPMENT'), url: '/shipments/sid/'+container.get('SHIPPINGID') }, { title: 'Containers' }, { title: container.get('NAME') }])
                        var is_plate = !(['Box', 'Puck', 'PCRStrip', null].indexOf(container.get('CONTAINERTYPE')) > -1)
                        if (is_plate && container.get('CONTAINERTYPE').includes('Xpdf')) is_plate = false
                        console.log('is plate', is_plate)
                        if (is_plate) app.content.show(new ContainerPlateView({ model: container, params: { iid: iid, sid: sid } }))
                          else app.content.show(GetView.ContainerView.get(app.type, {model: container}))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'No such container' }])
                        app.message({ title: 'No such container', message: 'The specified container could not be found'})
                    },
                })
            },

            error: function() {
                app.bc.reset([bc, { title: 'No such container' }])
                app.message({ title: 'No such container', message: 'The specified container could not be found'})
            }
        })
    },

    add_container: function(did, visit) {
      var lookup = new ProposalLookup({ field: 'DEWARID', value: did })
        lookup.find({
            success: function() {
                app.log('cont view')
                  
                var dewar = new Dewar({ DEWARID: did})
                  dewar.fetch({
                      success: function() {
                          app.bc.reset([bc, { title: dewar.get('SHIPPINGNAME'), url: '/shipments/sid/'+dewar.get('SHIPPINGID') }, { title: 'Containers' }, { title: 'Add Container' }])
                          app.content.show(GetView.ContainerAddView.get(app.type, { dewar: dewar, visit: visit }))
                      },
                      error: function() {
                          app.bc.reset([bc, { title: 'Error' }])
                          app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
                      },
                  })
            },

            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
            },

        })
    },



    queue_container: function(cid) {
        var lookup = new ProposalLookup({ field: 'CONTAINERID', value: cid })
        lookup.find({
            success: function() {
                var container = new Container({ CONTAINERID: cid })
                container.fetch({
                    success: function() {
                        app.bc.reset([bc, { title: container.get('SHIPMENT'), url: '/shipments/sid/'+container.get('SHIPPINGID') }, { title: 'Containers' }, { title: container.get('NAME') }, { title: 'Queue Samples' }])
                        app.content.show(new QueueContainerView({ model: container }))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'Error' }])
                        app.message({ title: 'No such container', message: 'The specified container could not be found'})
                    },
                })
            },

            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such container', message: 'The specified container could not be found'})
            },

        })
    },


    plan_container: function(cid) {
        var lookup = new ProposalLookup({ field: 'CONTAINERID', value: cid })
        lookup.find({
            success: function() {
                var container = new Container({ CONTAINERID: cid })
                container.fetch({
                    success: function() {
                        app.bc.reset([bc, { title: container.get('SHIPMENT'), url: '/shipments/sid/'+container.get('SHIPPINGID') }, { title: 'Containers' }, { title: container.get('NAME') }, { title: 'Plan Experiment' }])
                        app.content.show(new PlanView({ model: container }))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'Error' }])
                        app.message({ title: 'No such container', message: 'The specified container could not be found'})
                    },
                })
            },

            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such container', message: 'The specified container could not be found'})
            }
        })
    },
      
    
    add_container_visit: function(visit) {
        Backbone.ajax({
            url: app.apiurl+'/shipment/dewars/default',
            data: { visit: visit },
            
            success: function(did) {
                controller.add_container(did, visit)
                app.navigate('/containers/add/did/'+did)
            },
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'Error', message: 'The default dewar for this visit could not be created' })
            },
        })
    },


    container_registry: function(ty, s, page) {
      app.loading()
      var containers = new ContainersRegistry()
        
      page = page ? parseInt(page) : 1
        
      containers.state.currentPage = page
      containers.queryParams.all = 1
      containers.fetch().done(function() {
        app.bc.reset([bc, { title: 'Registered Containers', url: '/dewars' }])
        app.content.show(new ContainerRegistryView({ collection: containers, params: { s: s, ty: ty } }))
      })
    },

    view_rcontainer: function(crid) {
        var container = new ContainerRegistry({ CONTAINERREGISTRYID: crid })
        container.fetch({
            data: {
                all: 1
            },
            success: function() {
                app.bc.reset([bc, { title: container.get('BARCODE') }])
                app.content.show(new RegisteredContainer({ model: container }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such container', message: 'The specified container could not be found'})
            },
        })
    },


    dewar_list: function(s, page) {
      console.log('dew list')
      app.loading()
      var dewars = new DewarRegistry()
        
      dewars.state.currentPage = page ? parseInt(page) : 1
      dewars.fetch().done(function() {
        app.bc.reset([bc, { title: 'Registered Dewars', url: '/dewars' }])
        app.content.show(new DewarRegView({ collection: dewars, params: { s: s } }))
      })
    },


    view_dewar: function(fc) {
      app.log('cont view')
      var dewar = new RegisteredDewar({ FACILITYCODE: fc })
        dewar.fetch({
            success: function() {
                dewar.fetched = true
                app.bc.reset([bc, { title: 'Registered Dewars', url: '/dewars' }, { title: dewar.get('FACILITYCODE') }])
                app.content.show(new RegDewarView({ model: dewar }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
            },
        })
    },

    add_dewar: function() {
      app.log('dew add view')
      app.bc.reset([bc, { title: 'Registered Dewars', url: '/dewars' }, { title: 'Add New Dewar' }])
      app.content.show(new RegDewarAddView())
    },
      
    dispatch_dewar: function(did) {
        var lookup = new ProposalLookup({ field: 'DEWARID', value: did })
        lookup.find({
            success: function() {
                var dewar = new Dewar({ DEWARID: did })
                dewar.fetch({
                    success: function() {
                        app.bc.reset([bc, { title: 'Dispatch Dewar' }, { title: dewar.get('CODE') }])
                        app.content.show(new DispatchView({ dewar: dewar }))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'Error' }])
                        app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
                    },
                })
            },

            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
            },
        })
    },

    transfer_dewar: function(did) {
        var lookup = new ProposalLookup({ field: 'DEWARID', value: did })
        lookup.find({
            success: function() {
                var dewar = new Dewar({ DEWARID: did })
                dewar.fetch({
                    success: function() {
                        app.bc.reset([bc, { title: 'Transfer Dewar' }, { title: dewar.get('CODE') }])
                        app.content.show(new TransferView({ dewar: dewar }))
                    },
                    error: function() {
                        app.bc.reset([bc, { title: 'Error' }])
                        app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
                    },
                })
            },

            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
            },
        })
    },


    dewar_overview: function(s, page) {
        page = page ? parseInt(page) : 1

        var dewars = new Dewars(null, { state: { currentPage: page }, queryParams: { s: s, all: 1, ty: app.type } })
        dewars.setSorting('FIRSTEXPERIMENTST', 1)
        dewars.fetch({
            success: function() {
                app.bc.reset([bc, { title: 'Dewar Overview' }])
                app.content.show(new DewarOverview({ collection: dewars, params: { s: s } }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No dewars', message: 'Couldnt fetch dewar list'})
            },
        })
    },


    manifest: function() {
        app.bc.reset([bc, { title: 'Manifest' }])
        app.content.show(new ManifestView())
    }

  }
       
        
  app.addInitializer(function() {
    app.on('shipments:show', function() {
      app.navigate('shipments')
      controller.list()
    })
      
    app.on('shipment:show', function(sid) {
      app.navigate('shipments/sid/'+sid)
      controller.view(sid)
    })
      
    app.on('container:show', function(cid, iid, sid) {
      app.navigate('containers/cid/'+cid+(iid?'/iid/'+iid:'')+(sid?'/sid/'+sid:''))
      controller.view_container(cid, iid, sid)
    })

    app.on('rdewar:show', function(fc) {
      app.navigate('dewars/fc/'+fc)
      controller.view_dewar(fc)
    })

    app.on('rcontainer:show', function(crid) {
      app.navigate('containers/registry/'+crid)
      controller.view_rcontainer(crid)
    })
  })
       
  return controller
})