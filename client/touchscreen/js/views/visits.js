define(['marionette', 'tpl!templates/visits.html'], function(Marionette, template) {

    var VisitItem = Marionette.ItemView.extend({
        template: _.template('<a data-role="nav-main" href="/visit/<%=VISIT%>"><%=VISIT%> - <%=ST%></a>'),
        tagName: 'li',
        
        events: {
            //click: 'click',
        },
        
        click: function(e) {
            e.preventDefault()
            e.stopPropagation()
            
            app.trigger('assign:visit', this.model.get('VISIT'))
        }
    })
    
    
    return Marionette.CompositeView.extend({
        template: template,
        childViewContainer: 'ul',
        childView: VisitItem,
        
        attributes: {
            'data-url': 'visits',
            'data-role': 'page'
        },
        
        templateHelpers: function() {
            var first = this.collection.at(0)
            b = first ? first.get('BL') : ''
            
            return {
                bl: b
            }
        },
        
        initialize: function() {
            this.listenTo(this.collection, 'sync', this.queueRefresh, this)
            this.listenTo(this.collection, 'sync', this.refreshList, this)
            this.refreshThread = null
            this.queueRefresh()
        },
        
        queueRefresh: function() {
            clearTimeout(this.refreshThread)
            var self = this
            this.refreshThread = setTimeout(function() {
                self.collection.fetch()
            }, 60*15*1000)
            //}, 10*1000)
        },
        
        onDestroy: function() {
            clearTimeout(this.refreshThread)
        },
        
        refreshList: function() {
            this.$el.find('ul').listview().listview('refresh')
        }
    })
    

})