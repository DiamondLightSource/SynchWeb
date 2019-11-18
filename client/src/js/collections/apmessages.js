define(['backbone.paginator', 'models/apmessage'], function(PageableCollection, APMessage) {
       
    return PageableCollection.extend({
        model: APMessage,
        mode: 'client',
        url: '/dc/apm',

        state: {
            pageSize: 15,
        },
    })
})
