define(['backbone.paginator', 'models/phasingattachment', 'utils/kvcollection'], function(PageableCollection, Attachment, KVCollection) {
       
    return PageableCollection.extend(_.extend({
        model: Attachment,
        mode: 'client',
        url: '/download/ph/attachments',

        keyAttribute: 'FILENAME',
        valueAttribute: 'PHASINGPROGRAMATTACHMENTID',
                                          
        state: {
            pageSize: 15,
        },
    }, KVCollection))
})
