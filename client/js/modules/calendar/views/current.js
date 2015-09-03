define(['marionette', 
        'models/visit', 
        'collections/visits', 
        'collections/bls', 
        'modules/proposal/views/users', 
        'modules/proposal/models/time', 
        'tpl!templates/calendar/current.html'], 
        function(Marionette, Visit, Visits, Beamlines, UserView, Time, template) {


    var VisitItem = Marionette.ItemView.extend({
        tagName: 'li',
        className: function() {
            if (this.model.get('ACTIVE') == 1) return 'active'
        },
        
        events: {
            'click': 'showVisit',
            'mouseover a.users': 'showUsers',
            'mouseout a.users': 'hideUsers',
        },
        
        showUsers: function(e) {
            if (!this.users) {
                this.users = new UserView({ visit: this.model.get('VISIT') })
                this.$el.find('.users').append(this.users.render().$el)
            }
            this.users.$el.show()
        },
        
        hideUsers: function(e) {
            if (this.users) this.users.$el.hide()
        },
        
        showVisit: function(e) {
            if ($(e.target).is('a') || $(e.target).is('i')) return
            app.trigger('dclist:show', this.model.get('VISIT'))
        },
        
        template: _.template('<div class="r"><a class="button" href="/stats/visit/<%=VISIT%>"><i class="fa fa-pie-chart"></i></a> <a href="#" class="button users"><i class="fa fa-users"></i></a></div><h1><%=BL%>. <%=LC%></h1><h3><a href="/dc/visit/<%=VISIT%>"><%=VISIT%></a></h3><ul><li>Start: <%=ST%></li><li>End: <%=EN%></li></ul>'),
        
    })
    
    var NoVisits = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<p>No visits found</p>')
    })


    var VisitList = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'ul hover full clearfix',
        childView: VisitItem,
        emptyView: NoVisits,
    })
    
    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',

        regions: {
            pv: '.prev',
            nv: '.next',
            com: '.cm',
        },

        ui: {
            time: 'span.time'
        },


        initialize: function() {
            this.deferreds = []
            if (app.staff) {
                this.next = new Visits(null)
                this.prev = new Visits(null)
                this.cm = new Visits(null)
                
                this.beamlines = new Beamlines(null, { ty: app.type })
                this.beamlines.fetch()
                this.listenTo(this.beamlines, 'sync', this.getVisits, this)
                // _.each(['i02', 'i03', 'i04', 'i04-1', 'i24'], function(b, i) {
                //     _.each(['next', 'prev', 'cm'], function(d) {
                //         var p = { bl: b, all: 1 }
                //         p[d] = 1
                //         var v = new Visits(null, { state: { pageSize: 1 }, queryParams: p })
                //         var self = this
                //         var def = v.fetch({ cache: false }).done(function() { self[d].add(v.models, { at: i }) })
                //         this.deferreds.push(def)
                //     }, this)
                // }, this)
                
                
            } else {
                _.each(['next', 'prev'], function(d) {
                    var p = {}
                    p[d] = 1
                    this[d] = new Visits(null, { state: { pageSize: 5 }, queryParams: p })
                    this.deferreds.push(this[d].fetch())
                }, this)
            }

            this.time = new Time()
            this.deferreds.push(this.time.fetch())
            
        },

        
        getVisits: function() {
            console.log('get visits', this.beamlines)
            this.beamlines.each(function(b, i) {
                _.each(['next', 'prev', 'cm'], function(d) {
                    var p = { bl: b.get('BEAMLINE'), all: 1 }
                    p[d] = 1
                    var v = new Visits(null, { state: { pageSize: 1 }, queryParams: p })
                    var self = this
                    var def = v.fetch({ cache: false }).done(function() { self[d].add(v.models, { at: i }) })
                    this.deferreds.push(def)
                }, this)
            }, this)
        },


        onRender: function() {  
            $.when.apply($, this.deferreds).then(this.doRender.bind(this))
        },
        
        doRender: function() {
            this.pv.show(new VisitList({ collection: this.prev }))
            this.nv.show(new VisitList({ collection: this.next }))
            if (app.staff) this.com.show(new VisitList({ collection: this.cm }))

            this.ui.time.html(this.time.time())
        },
        
        
    })
    
})