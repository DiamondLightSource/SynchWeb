define(['marionette', 'modules/shipment/views/movecontainer', 'tpl!templates/shipment/containerli.html'], function(Marionette, MoveContainerView, template) {
    
    var EmptyDewar = Marionette.ItemView.extend({
        tagName: 'li',
        template: '<li>No Containers for this dewar</li>'
    })
    
    var ContainerItemView = Marionette.ItemView.extend({
        tagName: 'li',
        template: template,
        
        events: {
            'click a.move': 'moveContainer',
        },

        templateHelpers: {
            APIURL: app.apiurl,
            PROP: app.prop,
        },
        
        moveContainer: function(e) {
            e.preventDefault()
            app.dialog.show(new MoveContainerView({ model: this.model }))
            this.listenTo(app.dialog.currentView, 'container:moved', this.triggerRefresh, this)
        },
        
        triggerRefresh: function() {
            this.trigger('container:moved')
        },
    })
    
    return Marionette.CollectionView.extend({
        className: 'containers',
        tagName: 'ul',
        childView: ContainerItemView,
        emptyView: EmptyDewar,
        
        childEvents: {
            'container:moved': 'triggerRefresh',
        },
        
        triggerRefresh: function() {
            this.trigger('refresh:dewars')
        },
    })
    
})