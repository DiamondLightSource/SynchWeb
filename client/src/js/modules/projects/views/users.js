define(['marionette'], function(Marionette) {


    var UserItem = Marionette.ItemView.extend({
        template: _.template('<%-FULLNAME%><% if (IS_OWNER) { %><span class="r"><a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a></span><% } %>'),
        tagName: 'li',
        
        events: {
            'click a.delete': 'deleteUser',
        },
        
        deleteUser: function(e) {
            this.model.destroy()
        },
    })
    
    
    var EmptyUserItem = Marionette.ItemView.extend({
        template: _.template('No users registered on this project'),
        tagName: 'li',
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'visits clearfix',
        childView: UserItem,
        emptyView: EmptyUserItem,
    })
    

})