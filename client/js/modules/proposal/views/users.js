define(['marionette', 'collections/users'], function(Marionette, Users) {

    
    var UserItem = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<%=FULLNAME%> - <% if (LAST) { %><%=VISITS%> Visits (Last Visit: <%=LAST%>)<% } else { %>*NEW*<% } %>'),
        className: function() {
            return this.model.get('VISITS') == 0 ? 'new' : ''
        },
    })
    
    var LoadingView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<i class="fa fa-spin fa-spinner"></i>')
    })
    
    return Marionette.CollectionView.extend({
        //template: _.template('<h1>Users</h1><ul class="users"></ul>'),
        //childViewContainer: '.users',
        tagName: 'ul',
        childView: UserItem,
        emptyView: LoadingView,
        className: 'visit_users',
        
        initialize: function(options) {
            this.collection = new Users()
            this.collection.queryParams.visit = options.visit
            this.collection.fetch()
        }
    })
    
       
})