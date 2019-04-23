define([
    'marionette',
    'models/visit',
    'modules/types/em/scipion/views/scipion',
], function (
    Marionette,
    Visit,
    ScipionView
) {
    let controller = {
        scipion: function (visit_str) {
            app.loading();

            if (visit_str) {
                app.cookie(visit_str.split('-')[0]);

                let visit = new Visit({VISIT: visit_str});

                visit.fetch({
                    success: function () {
                        app.bc.reset([
                            {title: 'Data Collections', url: '/dc'},
                            {title: visit.get('BL')},
                            {title: visit.get('VISIT'), url: '/dc/visit/' + visit.get('VISIT')},
                            {title: 'Processing'}
                        ]);
                    },
                    error: function () {
                        app.bc.reset([{title: 'Error'}]);
                        app.message({title: 'No such visit', message: 'The specified visit does not exist'})
                    }
                });

                app.content.show(new ScipionView({model: visit}));
            } else {
                app.bc.reset([{title: 'Error'}]);
                app.message({title: 'Visit not specified', message: 'No visit specified'})
            }
        }
    };

    return controller
});