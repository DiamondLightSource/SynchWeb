define(['marionette'], function(Marionette) {


    var UserItem = Marionette.ItemView.extend({
        template: _.template('<%-NAME%> <% if (CODE) { %>[CODE]<% } else { %>[File]<% } %> <span class="r"><a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a></span>'),
        tagName: 'li',
        attributes: { 'data-testid': 'protein-pdb-list-item' },
        events: {
            'click a.delete': 'deleteUser',
        },
        
        deleteUser: function(e) {
            this.model.destroy()
        },
    })
    
    
    var EmptyUserItem = Marionette.ItemView.extend({
        template: _.template('No PDBs registered to this protein'),
        tagName: 'li',
        attributes: { 'data-testid': 'protein-pdb-no-item' },
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'visits clearfix',
        attributes: { 'data-testid': 'protein-pdb-list' },
        childView: UserItem,
        emptyView: EmptyUserItem,
    })
    

})