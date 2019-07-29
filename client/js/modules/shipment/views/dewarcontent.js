define(['marionette', 'modules/shipment/views/movecontainer', 
    'views/pages',
    'utils',
    'templates/shipment/containerli.html'], function(Marionette, MoveContainerView, PagesView,
        utils, template) {
    
    var EmptyDewar = Marionette.ItemView.extend({
        tagName: 'li',
        template: '<li>No Containers for this dewar</li>'
    })
    
    var ContainerItemView = Marionette.ItemView.extend({
        tagName: 'li',
        template: template,
        
        events: {
            'click a.move': 'moveContainer',
            'click a.print': utils.signHandler,
        },

        templateHelpers: function() {
            return {
                APIURL: app.apiurl,
                PROP: app.prop,
            }
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
    
    var ContainersView = Marionette.CollectionView.extend({
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

    return Marionette.LayoutView.extend({
        template: _.template('<div class="rcont"></div><div class="rpages page_wrap"></div>'),
        regions: {
            rcont: '.rcont',
            rpages: '.rpages',
        },

        onRender: function() {
            this.rcont.show(new ContainersView({ collection: this.getOption('collection') }))
            this.rpages.show(new PagesView({ collection: this.getOption('collection') }))
        }
    })
    
})