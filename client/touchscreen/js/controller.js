define(['jquery',
        'models/visit', 'collections/visits',
        'views/assign', 'views/visits',
        'jquery.mobile',],
function($,
    Visit, Visits,
    AssignView, VisitsView
    ) {

    var controller = {
        visits: function() {
            var visits = new Visits(null, { timeZone: app.options.get('timezone') })
            var self = this
            visits.fetch({
                success: function() {
                    self.changeView(new VisitsView({ collection: visits }))
                }
            })
        },
    
        assign: function(visit) {
            var vis = new Visit({ VISIT: visit }, { dateTimeZone: app.options.get('timezone')})
            var self = this
            vis.fetch({
                success: function() {
                    self.changeView(new AssignView({ model: vis }))
                }
            })
        },
    
        changeView: function(view, transition) {                    
            app.views.outgoing = app.views.incoming
            app.views.incoming = view
            
            $('body').append(view.render().$el)
            $('body').pagecontainer("change", view.$el, { transition: "slide" })
            console.log('change view')
            
            setTimeout(function() {
                console.log('destroying', app.views.outgoing)
                if (app.views.outgoing) app.views.outgoing.destroy()
            }, 2*1000)
        },
    }
        
    app.addInitializer(function() {
        app.on('assign:visit', function(visit) {
            controller.assign(visit)
        })
    })

    app.addInitializer(function() {
        app.on('visits', function() {
            controller.visits()
            app.router.navigate('')
        })
    })
        
    return controller
        
        
})