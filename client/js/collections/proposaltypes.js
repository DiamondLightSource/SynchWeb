define(['backbone.paginator'], function(PageableCollection) {
       
    return PageableCollection.extend({
        mode: 'server',
        url: '/proposal/type',
    })

})
