define(['marionette', 'backbone', 'utils'], function(Marionette, Backbone, utils) {

    var UserItem = Marionette.ItemView.extend({
        template: _.template(''),
        tagName: 'li',
        attributes: { 'data-testid': 'protein-element-list-item' },
        events: {
            'click a.delete': 'deleteElement',
        },

        render: function() {
            UserItem.__super__.render.call(this)
            const deleteButton = '<a class="button button-notext delete" href="#"><i class="fa fa-times"></i> <span>Delete</span></a>'
            this.$el.append(this.model.get('NAME')+' <span class="r novertpad">'+deleteButton+'</span>')
        },

        deleteElement: function(e) {
            e.preventDefault()
            this.model.destroy()
        },
    })

    var EmptyUserItem = Marionette.ItemView.extend({
        template: _.template('No elements associated with this protein'),
        tagName: 'li',
        className: 'empty-message',
        attributes: { 'data-testid': 'protein-element-no-item' },
    })
    
    return Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'proteinelements clearfix',
        attributes: { 'data-testid': 'protein-element-list' },
        childView: UserItem,
        emptyView: EmptyUserItem,
        childViewOptions: function(model) {
            return this.options
        }
    })
})
