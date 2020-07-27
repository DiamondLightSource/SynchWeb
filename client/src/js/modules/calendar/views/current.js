define(['marionette', 
        'models/visit', 
        'collections/visits', 
        'collections/bls', 
        'modules/proposal/views/users', 
        'modules/proposal/views/dewars', 
        'modules/proposal/models/time', 
        'templates/calendar/current.html'], 
        function(Marionette, Visit, Visits, Beamlines, UserView, DewarsView, Time, template) {


    var VisitItem = Marionette.ItemView.extend({
        tagName: 'li',
        className: function() {
            if (this.model.get('ACTIVE') == 1) return 'active'
        },
        
        events: {
            'click': 'showVisit',
            'mouseover a.users': 'showUsers',
            'mouseout a.users': 'hideUsers',
            'mouseover a.dewars': 'showDewars',
            'mouseout a.dewars': 'hideDewars',
        },
        
        showDewars: function(e) {
            if (!this.dewars) {
                this.dewars = new DewarsView({ visit: this.model.get('VISIT') })
                this.$el.find('.dewars').append(this.dewars.render().$el)
            }
            this.dewars.$el.show()
        },

        hideDewars: function(e) {
            if (this.dewars) this.dewars.$el.hide()
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
            //if ($(e.target).is('a') || $(e.target).is('i')) return
            var visit = this.model.get('VISIT')
            app.setVisit(visit.substring(visit.lastIndexOf('-')+1, visit.length))
            app.trigger('dclist:show', this.model.get('VISIT'))
        },
        
        template: _.template('<div class="r"><a class="button" href="/stats/visit/<%-VISIT%>"><i class="fa fa-pie-chart"></i></a> <a href="#" class="button users"><i class="fa fa-users"></i></a> <a href="#" class="button dewars"><i class="fa fa-truck"></i></a></div><h1><%-BL%>. <%-LC%></h1><h3><a href="/dc/visit/<%-VISIT%>"><%-VISIT%></a></h3><ul><li>Start: <%-ST%></li><li>End: <%-EN%></li><li>&nbsp; <% if (SESSIONTYPE) { %><%-SESSIONTYPE%><% }%></li></ul>'),
        
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
                
            } else {
                _.each(['next', 'prev'], function(d) {
                    var p = { all: 1 }
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

            var model = Visit.extend({
                idAttribute: 'VISIT-TYPE',
            })
            var visits = Visits.extend({
                model: model
            })

            this.visits = new visits(null, { queryParams: { current: 1 } })
            var def = this.visits.fetch({
                success: this.sortVisits.bind(this)
            })
            this.deferreds.push(def)
        },

        sortVisits: function() {
            console.log('sort visits')
            this.beamlines.each(function(b,i) {
                _.each(['next', 'prev', 'cm'], function(d) {
                    var v = this.visits.findWhere({ BL: b.get('BEAMLINE'), type: d })
                    this[d].add(v, { at: i })
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

            this.ui.time.text(this.time.time())
        },
        
        
    })
    
})