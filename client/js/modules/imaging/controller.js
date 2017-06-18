define(['marionette',
    'modules/imaging/models/schedule',
    'modules/imaging/collections/schedules',

    'modules/imaging/views/admin/scheduleadmin',
    'modules/imaging/views/admin/schedulecompadmin',
    'modules/imaging/views/admin/dashboard',

    'modules/imaging/models/screen',
    'modules/imaging/collections/screens',
    'modules/imaging/views/screenadmin',
    'modules/imaging/views/screencompadmin',
    ], function(Marionette,
        Schedule, Schedules, ScheduleAdmin, ScheduleComponentAdmin, Dashboard,
        Screen, Screens, ScreenAdmin, ScreenComponentAdmin
        ) {

    var bc = { title: 'Imaging Schedules', url: '/admin/imaging' }
    
    var controller = {
        // Imaging Dashboard
        imaging_dash: function() {
            if (!app.user_can('imaging_dash')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            app.content.show(new Dashboard())
            app.bc.reset([bc, { title: 'Imaging Dashboard', url: '/admin/imaging' }])
        },



        // Imaging Schedules
        schedules: function() {
            if (!app.user_can('schedules')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            app.loading()

            var schedules = new Schedules()
            schedules.fetch({
                success: function(r) {
                    app.content.show(new ScheduleAdmin({ collection: schedules }))
                    app.bc.reset([bc, { title: 'Manage Imaging Schedules', url: '/admin/imaging/schedules' }])
                },

                error: function() {
                    app.message({ title: 'Couldnt load schedule list', message: 'Couldnt load schedule list please try again' })
                } 
            })
        },  


        view_schedule: function(sid) {
            if (!app.user_can('schedule_comp')) {
                app.message({ title: 'Access Denied', message: 'You do not have access to that page' })
                return
            }
            
            app.loading()

            var schedule = new Schedule({ SCHEDULEID: sid })
            schedule.fetch({
                success: function(r) {
                    app.content.show(new ScheduleComponentAdmin({ model: schedule }))
                    app.bc.reset([bc, { title: 'Manage Imaging Schedules', url: '/admin/imaging/schedule' }, { title: schedule.get('NAME') }])
                },

                error: function() {
                    app.message({ title: 'Couldnt load schedule', message: 'Couldnt load schedule please try again' })
                } 
            })
        },



        // Crystallisation Screens
        screens: function() {
            app.loading()

            var screens = new Screens()
            screens.fetch({
                success: function(r) {
                    app.content.show(new ScreenAdmin({ collection: screens }))
                    app.bc.reset([{ title: 'Crysallisation Screens', url: '/imaging/screen' }])
                },

                error: function() {
                    app.message({ title: 'Couldnt load screens list', message: 'Couldnt load screens list please try again' })
                } 
            })
        }, 


        view_screen: function(sid) {
            app.loading()

            var screen = new Screen({ SCREENID: sid })
            screen.fetch({
                success: function(r) {
                    app.content.show(new ScreenComponentAdmin({ model: screen }))
                    app.bc.reset([{ title: 'Crystallisation Screens', url: '/imaging/screen' }, { title: screen.get('NAME') }])
                },

                error: function() {
                    app.message({ title: 'Couldnt load screen', message: 'Couldnt load screen please try again' })
                } 
            })
        },
    }

    app.addInitializer(function() {
        app.on('schedule:view', function(sid) {
            app.navigate('/admin/imaging/schedule/'+sid)
            controller.view_schedule(sid)
        })

        app.on('screen:view', function(sid) {
            app.navigate('/imaging/screen/'+sid)
            controller.view_screen(sid)
        })
    })
       
    return controller
})