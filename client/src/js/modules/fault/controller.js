define(['marionette',
    'modules/fault/models/fault',
    'modules/fault/collections/faults',
    
    'modules/fault/views/list',
    'modules/fault/views/add',
    'modules/fault/views/view',
    'modules/fault/views/edit',
    ], function(Marionette, Fault, Faults, FaultListView, AddFaultView, FaultView, FaultTypeEditor) {

    var bc = { title: 'Fault Database', url: '/fault' }
    
    var controller = {
        
        // Fault list
        list:  function(bl, sys, com, sub, page) {
            app.loading()
            page = page ? parseInt(page) : 1
            var faults = new Faults(null, { state: { currentPage: page } })
            faults.fetch({
                success: function() {
                    app.bc.reset([bc]),
                    app.content.show(new FaultListView({ collection: faults, params: { beamline: bl, system: sys, component: com, subcomponent: sub } }))
                },
                error: function() {
                    app.bc.reset([bc, { title: 'Error' }])
                    app.message({ title: 'Couldnt load fault list', message: 'Couldnt load fault list please try again' })
                }
            })
        },
        
        // View Fault
        view: function(fid) {
            var fault = new Fault({ FAULTID: fid })
            fault.fetch({
                success: function() {
                    app.bc.reset([bc, { title: 'View Fault' }, { title: fault.get('TITLE') }]),
                    app.content.show(new FaultView({ model: fault }))
                },
                error: function() {
                    app.bc.reset([bc, { title: 'Error' }])
                    app.message({ title: 'Couldnt load fault', message: 'Couldnt load the specified fault' })
                }
            })
        },
            
            
        // Add Fault
        add: function() {
            if (!app.user_can('fault_add')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc, { title: 'Add New Fault Report' }])
            app.content.show(new AddFaultView())
        },

        // Edit Fault Types
        edit: function() {
            if (!app.user_can('fault_admin')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }

            app.bc.reset([bc, { title: 'Edit Fault Types' }])
            app.content.show(new FaultTypeEditor())
        }
    }
        
       
    app.addInitializer(function() {
        app.on('fault:show', function(fid) {
            app.navigate('faults/fid/'+fid)
            controller.view(fid)
        })
    })
       
    return controller
})