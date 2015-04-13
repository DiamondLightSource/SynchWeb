define(['underscore', 'marionette',
        'modules/calendar/views/calendar',
        'modules/calendar/views/current',
], function(_, Marionette, CalendarView, CurrentView) {
  var controller = {
    calendar: function() {
        app.bc.reset([{ title: 'Calendar' }])
        app.content.show(new CalendarView({ all: 1 }))
    },
       
    calendar_prop: function() {
        app.bc.reset([{ title: 'Calendar' }, { title: app.prop }])
        app.content.show(new CalendarView({}))
    },
       
    current: function() {
        app.bc.reset([{ title: 'Next & Previous Visits' }])
        app.content.show(new CurrentView())
    },
      
    goHome: function() {
        if (!app.prop) app.trigger('proposals:show')
        else app.trigger('current:show')
    }
  }
    
    
  app.addInitializer(function() {
    app.on('current:show', function() {
        controller.current()
    })
  })
       
  return controller
})