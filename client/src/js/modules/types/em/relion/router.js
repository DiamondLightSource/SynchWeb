define([
    'marionette',
    'modules/types/em/relion/controller'
], function (
    Marionette,
    c
) {
    let Router = Marionette.AppRouter.extend({
        appRoutes: {
            'em/process/relion/session/:session_str': 'relion',
        }
    });

    return new Router({
        controller: c
    })
});