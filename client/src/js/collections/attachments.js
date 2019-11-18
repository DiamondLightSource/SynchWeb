define(['backbone.paginator', 'models/attachment', 'utils/kvcollection'], function(PageableCollection, Attachment, KVCollection) {
       
    return PageableCollection.extend(_.extend({
        model: Attachment,
        mode: 'client',
        url: '/download/attachments',

        keyAttribute: 'NAME',
        valueAttribute: 'DATACOLLECTIONFILEATTACHMENTID',
                                          
        state: {
            pageSize: 15,
        },
    }, KVCollection))
})
