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
        relion: function (session_str) {
            app.loading();

            if (session_str) {
                app.cookie(session_str.split('-')[0]);

                app.content.show(new RelionView({session_str: session_str}));
            } else {
                app.bc.reset([{title: 'Error'}]);
                app.message({title: 'Session not specified', message: 'No session specified'})
            }
        }
    };

    return controller
});
