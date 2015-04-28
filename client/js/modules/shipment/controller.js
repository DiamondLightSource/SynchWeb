define(['marionette',
    
        'models/dewar',
        'models/shipment',
        'collections/shipments',
        'modules/shipment/views/shipments',
        'modules/shipment/views/shipment',
        'modules/shipment/views/shipmentadd',
    
        'models/container',
        'collections/containers',
        'modules/shipment/views/container',
        'modules/shipment/views/containeradd',
        'modules/shipment/views/containers',
    
], function(Marionette,
    Dewar, Shipment, Shipments, ShipmentsView, ShipmentView, ShipmentAddView,
    Container, Containers, ContainerView, ContainerAddView, ContainersView) {
    
    var bc = { title: 'Shipments', url: '/shipments' }
        
  var controller = {
    list: function(page) {
      console.log('ship list')
      app.loading()
      var shipments = new Shipments()
        
      page = page ? parseInt(page) : 1
        
      shipments.fetch().done(function() {
        shipments.getPage(page)
        app.bc.reset([bc])
        app.content.show(new ShipmentsView({ collection: shipments }))
      })
    },
                                                
    view: function(sid) {
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
      
    add: function() {
      app.log('ship add view')
      app.bc.reset([bc, { title: 'Add New Shipment' }])
      app.content.show(new ShipmentAddView())
    },
    
    
    container_list: function(s, page) {
      console.log('cont list')
      app.loading()
      app.bc.reset([bc, { title: 'Containers' }])
        
      page = page ? parseInt(page) : 1
      var containers = new Containers(null, { state: { currentPage: page }, queryParams: { s: s } })
      containers.fetch().done(function() {
          app.content.show(new ContainersView({ collection: containers, params: { s: s } }))
      })
    },
      
      
    view_container: function(cid) {
      app.log('cont view')
      var container = new Container({ CONTAINERID: cid })
        container.fetch({
            success: function() {
                app.bc.reset([bc, { title: container.get('SHIPMENT'), url: '/shipments/sid/'+container.get('SHIPPINGID') }, { title: 'Containers' }, { title: container.get('NAME') }])
                app.content.show(new ContainerView({ model: container }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such container', message: 'The specified container could not be found'})
            },
        })
    },

    add_container: function(did, visit) {
      app.log('cont view')
        
      var dewar = new Dewar({ DEWARID: did})
        dewar.fetch({
            success: function() {
                app.bc.reset([bc, { title: dewar.get('SHIPPINGNAME'), url: '/shipments/sid/'+dewar.get('SHIPPINGID') }, { title: 'Containers' }, { title: 'Add Container' }])
                app.content.show(new ContainerAddView({ dewar: dewar, visit: visit }))
            },
            error: function() {
                app.bc.reset([bc, { title: 'Error' }])
                app.message({ title: 'No such dewar', message: 'The specified dewar could not be found'})
            },
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
      
    app.on('container:show', function(cid) {
      app.navigate('containers/cid/'+cid)
      controller.view_container(cid)
    })
  })
       
  return controller
})