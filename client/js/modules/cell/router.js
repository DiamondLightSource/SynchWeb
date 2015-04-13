define(['marionette', 'modules/cell/controller'], function(Marionette, c) {
//define(['utils/lazyrouter'], function(LazyRouter) {

    var Router = Marionette.AppRouter.extend({
    //var Router = LazyRouter.extend({
        appRoutes: {
            'cell(/page/:page)': 'search',
            'cell(/a/:a/b/:b/c/:c/al/:al/be/:be/ga/:ga)(/pdb/:pdb)(/page/:page)': 'search_cell',
        },
        
        
    })
       
    return new Router({
        controller: c
        //rjsController: 'modules/cell/controller',
    })
})