define([
    'marionette',
    'models/visit',
    'modules/types/em/relion/views/relion',
], function (
    Marionette,
    Visit,
    RelionView
) {
    let controller = {
        relion: function (visit_str) {
            app.loading();

            if (visit_str) {
                app.cookie(visit_str.split('-')[0]);

                app.content.show(new RelionView({visit_str: visit_str}));
            } else {
                app.bc.reset([{title: 'Error'}]);
                app.message({title: 'Visit not specified', message: 'No visit specified'})
            }
        }
    };

    return controller
});
