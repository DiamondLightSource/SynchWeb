define(['marionette', 'tpl!templates/assign/selectvisit.html'], function(Marionette, template) {

    
    var VisitView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<a href="/assign/visit/<%=VISIT%>"><%=VISIT%></a>: <%=BL%> - <%=ST%>'),
        className: function() {
            if (this.model.get('ACTIVE') == 1) return 'active'
        },
    })

    var EmptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('No upcoming / current visits')
    })

    return Marionette.CompositeView.extend({
        template: template,
        className: 'content',
        childView: VisitView,
        childViewContainer: 'ul.visits',
        emptyView: EmptyView
        
    })
    

})