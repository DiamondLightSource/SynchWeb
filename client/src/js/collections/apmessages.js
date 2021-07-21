define(['backbone.paginator', 'models/apmessage'], function(PageableCollection, APMessage) {
       
    return PageableCollection.extend({
        model: APMessage,
        mode: 'client',
        url: '/processing/messages',

        state: {
            pageSize: 15,
        },
    })
})
