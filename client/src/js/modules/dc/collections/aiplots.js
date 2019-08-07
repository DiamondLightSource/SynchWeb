define(['backbone.paginator', 'modules/dc/models/aiplot'], 
    function(PageableCollection, AIPlot) {
       
    return PageableCollection.extend({
        model: AIPlot,
        mode: 'client',
        url: '/download/plots',
                                          
        state: {
            pageSize: 50,
        },

    })
})