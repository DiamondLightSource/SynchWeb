define(['backbone.paginator', 'models/autoprocattachment', 'utils/kvcollection'], function(PageableCollection, Attachment, KVCollection) {
       
    return PageableCollection.extend(_.extend({
        model: Attachment,
        mode: 'client',
        url: '/download/ap/attachments',

        keyAttribute: 'FILENAME',
        valueAttribute: 'AUTOPROCPROGRAMATTACHMENTID',
                                          
        state: {
            pageSize: 15,
        },
    }, KVCollection))
})
