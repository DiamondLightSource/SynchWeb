define(['marionette'], function(Marionette) {


    var UserItem = Marionette.ItemView.extend({
        template: _.template('<%-NAME%> <span class="r"><a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a></span>'),
        tagName: 'li',
        
        events: {
            'click a.delete': 'deleteCIF',
        },
        
        deleteCIF: function(e) {
            this.model.destroy()
        },
    })
    
    
    var EmptyUserItem = Marionette.ItemView.extend({
        template: _.template('No CIFs registered to this phase'),
        tagName: 'li',
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'visits clearfix',
        childView: UserItem,
        emptyView: EmptyUserItem,
    })
    

})