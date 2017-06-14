define(['backbone.paginator', 'models/scanmodel'], function(PageableCollection, Attachment) {
       
    return PageableCollection.extend({
        model: Attachment,
        mode: 'client',
        url: '/download/attachments',
                                          
        state: {
            pageSize: 15,
        },
    })
})