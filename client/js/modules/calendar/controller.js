define(['underscore', 'marionette',
        'modules/calendar/views/calendar',
        'modules/calendar/views/current',
], function(_, Marionette, CalendarView, CurrentView) {
  var controller = {
    calendar: function(bl) {
        app.bc.reset([{ title: 'Calendar' }])
        app.content.show(new CalendarView({ all: 1, bl: bl }))
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
        // console.log('home', app.ty)
        // New code to reset proposal on home (avoid users getting stuck)...
        // Current:show is probably redundant now
        app.clearProposal()

        // if (!app.prop) app.trigger('proposals:show')
        if (!app.type) app.trigger('proposals:show')
        else app.trigger('current:show')
    }
  }
    
    
  app.addInitializer(function() {
    app.on('current:show', function() {
        controller.current()
    })

    app.on('go:home', function() {
        controller.goHome()
    })
  })
       
  return controller
})