define(['backbone.paginator', 'modules/imaging/models/autoscore'], 
    function(PagableCollection, AutoScore) {

    return PagableCollection.extend({
        mode: 'client',
        model: AutoScore,
        url: '/imaging/inspection/images/scores/auto',

        state: {
            pageSize: 9999,
        },
    })

})
