define(['backbone.paginator', 'modules/imaging/models/schedulecomponent'], function(PageableCollection, ScheduleComponent) {
       
  return PageableCollection.extend({
    model: ScheduleComponent,
    mode: 'client',
    url: '/imaging/schedule/components',
                     
    defaults: {
        OFFSET_HOURS: 0,
        INSPECTIONTYPID: 1,
    },

    state: {
        pageSize: 100,
    },
      
  })
})