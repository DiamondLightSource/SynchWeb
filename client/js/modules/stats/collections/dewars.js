define(['backbone.paginator'], function(PageableCollection) {
       
  	return PageableCollection.extend({
	    mode: 'client',
    	url: '/vstat/dewars',
                                  
    	state: {
      		pageSize: 15,
    	},
      
  	})
})
