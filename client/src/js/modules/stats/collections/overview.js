define(['backbone.paginator'], function(PageableCollection) {
       
  return PageableCollection.extend({
    mode: 'client',
    url: '/vstat/overview',
                                  
    state: {
      pageSize: 15,
    },
      
  })
})