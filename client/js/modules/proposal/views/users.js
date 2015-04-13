define(['marionette', 'collections/users'], function(Marionette, Users) {

    
    var UserItem = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<%=FULLNAME%> - <% if (LAST) { %><%=VISITS%> Visits (Last Visit: <%=LAST%>)<% } else { %>*NEW*<% } %>'),
        className: function() {
            return this.model.get('VISITS') == 0 ? 'new' : ''
        },
    })
    
    
    return Marionette.CollectionView.extend({
        template: _.template('<h1>Users</h1><ul class="users"></ul>'),
        childViewContainer: '.users',
        childView: UserItem,
        className: 'visit_users',
        
        initialize: function(options) {
            this.collection = new Users(null, { visit: options.visit })
            this.collection.fetch()
        }
    })
    
       
})