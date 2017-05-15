define(['marionette', 'views/table',
        'modules/blstats/collections/online',
        'modules/blstats/collections/actions',
    ], function(Marionette, TableView,
        OnlineUsers, Actions) {


    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Online Users</h1><div class="users"></div><div class="activity"></div>'),
        regions: {
            onl: '.users',
            act: '.activity',
        },
        
        initialize: function() {
            this.last = new Actions()
            this.last.fetch()
            
            this.online = new OnlineUsers()
            this.online.fetch()
        },
        
        onRender: function() {
            var columns = [
                { name: 'NAME', label: 'User', cell: 'string', editable: false },
                { name: 'COMMENTS', label: 'Location', cell: 'string', editable: false },
                { name: 'TIME', label: 'Time', cell: 'string', editable: false },
            ]
            
            this.onl.show(new TableView({ collection: this.online, columns: columns, search: false, tableClass: 'users', pages: true, backgrid: { emptyText: 'No users online' } } ))
            this.act.show(new TableView({ collection: this.last, columns: columns, search: false, tableClass: 'activity' }))
        },


        onDestroy: function() {
            this.online.stop()
        }
        
    })
    
})