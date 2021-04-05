define(['marionette', 'backbone', 'collections/visits', 'templates/calendar/calendar.html'], function(Marionette, Backbone, Visits, template) {
    
    // humm
    DISABLE_DAY_SCROLL = false
    DISABLE_ITEM_SCROLL = false
    

    var Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    var Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    
    var EventItemView = Marionette.ItemView.extend({
        template: _.template('<%-BL%>: <a class="setVisit" href="/dc/visit/<%-VISIT%>"><%-VISIT%></a> (<%-LEN%>h)<% if(LC) { %><br />&nbsp; - <%-LC%><% } %><%if(SESSIONTYPE) { %><br />[<%-SESSIONTYPE%>]<% } %>'),
        tagName: 'li',
        events:{
            'click .setVisit': 'setVisit'
        },
        
        className: function() {
            var c = []
            if (this.model.get('ENISO') < new Date())  c.push('past')
            if (this.model.get('ACTIVE') == 1) c.push('active')
                
            return c.join(' ')
        },

        setVisit: function(){
            app.visit = this.model.get('VIS')
        },
    })
    
    
    var EventHourView = Marionette.CompositeView.extend({
        template: _.template('<% if (hour < 10) {%>0<% } %><%-hour%>:00 <ul></ul>'),
        tagName: 'li',
        
        childView: EventItemView,
        childViewContainer: 'ul',
        
        initialize: function(options) {
            this.collection = new Backbone.Collection(this.model.get('visits'))
        },
    })
    
    
    
    
    var DayItemView = Marionette.CompositeView.extend({
        tagName: 'li',
        
        childView: EventHourView,
        childViewContainer: 'ul',
        
        templateHelpers: function () {
            return {
                dayNames: Days,
                monthNames: Months,
            }
        },
        
        initialize: function(options) {
            var hours = _.uniq(_.map(this.model.get('visits'), function(m) {
                var sessionStartISO = m.get('STISO')
                return sessionStartISO.hour 
            }))
            
            hc = []
            _.each(hours, function(h) {
                hc.push({ hour: h, visits: _.filter(this.model.get('visits'), function(m) {
                    var sessionStartISO = m.get('STISO')
                    return sessionStartISO.hour  == h
                }) })
            }, this)
            
            hc = _.sortBy(hc, function(h) { return h.hour })
            
            this.collection = new Backbone.Collection(hc)
            
        },
        
        onRender: function() {
            if (this.model.get('type') == 'day') this.$el.attr('data-day', this.model.get('date').getDate())
        },
        
        getTemplate: function() {
            if (this.model.get('type') == 'head') {
                return _.template('<%-dayNames[day]%>')
            } else if (this.model.get('type') == 'day') {
                return _.template('<span class="full"><%-dayNames[date.getDay()]%></span> <%-date.getDate()%> <span class="full"><%-monthNames[date.getMonth()]%></span><ul></ul>')
            } else {
                return _.template('&nbsp')
            }
        },
        
        className: function() {
            var classes = []
            
            if (this.model.get('type') == 'head') {
                classes.push('head')
                if (this.model.get('day') == 0 || this.model.get('day') == 6) classes.push('wend')
                    
            } else if (this.model.get('type') == 'day') {
                var t = new Date()
                if (this.model.get('date').getTime() == new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()) classes.push('today')
                
                if (this.model.get('visits').length == 0) classes.push('no_event')
                
            } else classes.push('noday')
                
            return classes.join(' ')
        }
    })
    
    var DayListItemView = Marionette.ItemView.extend({
        tagName: 'li',
        
        templateHelpers: function() {
            return {
                dayNames: Days,
            }
        },
        
        attributes: function() {
            return {
                'data-day': this.model.get('date').getDate()
            }
        },
        
        events: {
            'click': 'gotoDay',
        },
        
        gotoDay: function() {
            this.trigger('gotoDay', this.model.get('date').getDate())
        },

        template: _.template('<span class="day"><%-dayNames[date.getDay()].substr(0,3)%></span><span class="number"><%-date.getDate()%></span>'),

        
        className: function() {
            var classes = []
                
            var t = new Date()
            if (this.model.get('date').getTime() == new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()) classes.push('today')
                
            if (this.model.get('visits').length) classes.push('event')
                
            if (this.model.get('date') < new Date()) classes.push('past')
                
            return classes.join(' ')
        }
    })

    
    var DayListView = Marionette.CollectionView.extend({
        childView: DayListItemView,
        
        childEvents: {
            'gotoDay': 'doGotoDay',
        },
        
        collectionEvents: {
            reset: 'render',
        },
        
        events: {
            'scroll': 'onScroll',
        },
        
        
        initialize: function(options) {
            this.onScroll = _.debounce(this.onScroll, 100)
            this.lastDay = null
        },
        
        onRender: function() {
            var now = new Date()
            var first = this.collection.at(0)
            if (first) {
                var d = first.get('date')
                if (now.getMonth() == d.getMonth() && now.getFullYear() == d.getFullYear()) this.doGotoDay(null, now.getDate())
                else $('.calendar_main').animate({scrollTop: 0 })
            }
        },
        
        onScroll: function(e) {
            if (DISABLE_DAY_SCROLL) return
            
            DISABLE_ITEM_SCROLL = true
            var day = null
            var di = this.children.find(function(v) {
                return v.$el.offset().left > 0 && v.model.get('visits').length
            })
            
            if (di) day = di.model.get('date').getDate()
            if (day != this.lastDay && day) this.doGotoDay(null, day)
            this.lastDay = day
                
            setTimeout(function() {
                DISABLE_ITEM_SCROLL = false
            }, 1000)
        },
        
        doGotoDay: function(child, day) {
            console.log('day', day)
            var dp = $('.calendar_main li[data-day='+day+']').offset().top
            $('.calendar_main').animate({scrollTop: dp-$('.calendar_main').offset().top+$('.calendar_main').scrollTop() })
        },
    })
    
    
    
    
    return Marionette.CompositeView.extend({
        template: template,
        className: 'content',
        childView: DayItemView,
        childViewContainer: 'ul.calendar_main',
        
        ui: {
            mprev: '.mprev',
            mnext: '.mnext',
            yprev: '.yprev',
            ynext: '.ynext',
            title: 'span.title',
            purl: '.purl',
        },

        events: {
            'click @ui.yprev': 'prevYear',
            'click @ui.mprev': 'prevMonth',
            'click @ui.ynext': 'nextYear',
            'click @ui.mnext': 'nextMonth',
            'scroll .calendar_main': 'onScroll',
        },
        
        
        onScroll: function(e) {
            if (DISABLE_ITEM_SCROLL) return
            
            DISABLE_DAY_SCROLL = true
            var day = null
            var di = this.children.find(function(v) {
                return v.$el.offset().top - this.$el.find('.calendar_main').offset().top > 0
            }, this)
            
            if (di) day = di.model.get('date').getDate()
            if (day && this.lastDay != day) this.gotoDay(day)
            this.lastDay = day
                
            setTimeout(function() {
                DISABLE_DAY_SCROLL = false
            }, 1000)
        },
        
        gotoDay: function(day) {
            var dp = $('.calendar_days li[data-day='+day+']').offset().left
            this.$el.find('.calendar_days').animate({scrollLeft: dp-this.$el.find('.calendar_days').offset().left+this.$el.find('.calendar_days').scrollLeft() })
        },
        
        
        prevYear: function() {
            this.year--
            this.generateMonth()
        },
        
        nextYear: function() {
            this.year++
            this.generateMonth()
        },
        
        prevMonth: function() {
            if (this.month == 0) {
                this.month = 11
                this.year--
            } else this.month--
            this.generateMonth()
        },
        
        nextMonth: function() {
            if (this.month == 11) {
                this.year++
                this.month = 0
            } else this.month++
            this.generateMonth()
        },
        
        
        initialize: function(options) {
            this.lastDay = null
            this.onScroll = _.debounce(this.onScroll, 100)
            this.collection = new Backbone.Collection()
            this.days = new Backbone.Collection()
            
            var d = new Date()
            this.year = options.y !== undefined ? options.y : d.getFullYear()
            this.month = options.m !== undefined ? options.m : d.getMonth()
            
            var self = this
            var queryParams = {
                year: function() { return self.year },
                month: function() {
                    var m = self.month + 1
                    return m < 10 ? ('0'+m) : m
                },
                all: options.all,
            }

            if (options.all) queryParams.ty = app.type
            if (options.bl) queryParams.bl = options.bl

            this.visits = new Visits(null, {
                queryParams: queryParams,
                state: { pageSize: 9999 }
            })
            
            this.listenTo(this.visits, 'request', this.displaySpinner)
            this.listenTo(this.visits, 'sync', this.removeSpinner)
            this.listenTo(this.visits, 'error', this.removeSpinner)
            
            this.generateMonth()
        },

        
        getPrivateURL: function() {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/cal/ext',
                success: function(resp) {
                    self.ui.purl.html('<a class="button export" href="'+app.apiurl+resp+'"><i class="fa fa-external-link"></i> Export (Private URL)</a>')
                }
            })
        },
        
        
        onRender: function(){
            this.daylistview = new DayListView({ collection: this.days, el: this.$el.find('.calendar_days') })
            this.generateLinks()
            this.displaySpinner()
            
            this.$el.find('.calendar_main').scroll(this.onScroll.bind(this))
            if (!this.getOption('all')) this.getPrivateURL()
        },
        
        onDestroy: function() {
            this.$el.find('.calendar_main').unbind('scroll')
        },
        
        displaySpinner: function() {
            this.$el.addClass('loading')
        },
            
        removeSpinner: function() {
            this.$el.removeClass('loading')
        },
        
        generateLinks: function() {
            console.log(this.month, this.year)
            this.ui.mnext.text(Months[(this.month+1)%12])
            // javascript modulus doesnt work for negative numbers :(
            this.ui.mprev.text(Months[((this.month-1%12)+12)%12])
            this.ui.yprev.text(this.year-1)
            this.ui.ynext.text(this.year+1)
            this.ui.title.text(Months[this.month]+' '+this.year)
        },
        
        
        generateMonth: function() {
            this.visits.fetch().done(this.onGenerateMonth.bind(this))
        },
        
        onGenerateMonth: function() {
            // very confusingly new Date(..,..,0) returns the last day of the previous month...
            var daysinmonth = new Date(this.year, this.month+1, 0).getDate()
            var startday = new Date(this.year, this.month, 1).getDay()
            var endday = new Date(this.year, this.month, daysinmonth).getDay()

            console.log(daysinmonth, startday, endday)
            
            var days = []
            _.each(_.range(7), function(d) {
                days.push({ type: 'head', day: (((d+1)%7)+7)%7 })
            })            
            
            _.each(_.range((((startday-1)%7)+7)%7), function(d) {
                days.push({ type: 'pre' })
            })
            
            _.each(_.range(daysinmonth), function(d) {
                var date = new Date(this.year, this.month, d+1)
                var visits = this.visits.filter(function(v) {
                    return v.get('STISO') > date && v.get('STISO') < new Date(date.getTime()+(24*3600*1000))
                })
                
                days.push({ type: 'day', date: date, visits: visits })
            }, this)
            
            _.each(_.range(6%endday), function(d) {
                days.push({ type: 'post' })
            })
            
            this.collection.reset(days)
            this.generateLinks()
        
            this.days.reset(this.collection.where({ type: 'day' }))
            console.log(this.days)
        },
    })

})

