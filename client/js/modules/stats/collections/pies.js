define(['backbone.paginator', 'modules/stats/models/pie'], function(PageableCollection, Pie) {
       
    return PageableCollection.extend({
        model: Pie,
        mode: 'client',
        url: '/vstat/pies',
                                          
        state: {
            pageSize: 15,
        },
          
        parseRecords: function(r, options) {
            this.average = r.AVERAGE
            return r.VISITS
        },
          
    })
})