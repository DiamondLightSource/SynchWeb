define(['marionette', 'controller'],
function(Marionette, controller) {

    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            '': 'visits',
            'visits': 'visits',
            'visit/:visit': 'assign',
        },
    })
   
    return new Router({
        controller: controller
    })
    
})
