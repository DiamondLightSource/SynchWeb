define(['marionette', 
    'backgrid', 
    'views/table',
    'utils/table'], 
    function(Marionette, Backgrid, TableView, table) {
        
        
    var ClickableRow = table.ClickableRow.extend({
        event: 'useradm:show',
        argument: 'PERSONID',
    })
        
    return Marionette.LayoutView.extend({
        clickableRow: ClickableRow,
        className: 'content',
        template: _.template('<h1>Users</h1><p class="help">This page lists all users</p><div class="ra"><a href="admin/users/add" class="button" title="Add new user"><i class="fa fa-plus"></i> Add User</a></div><div class="wrapper"></div>'),
        regions: { 'wrap': '.wrapper' },
        
        initialize: function(options) {
            var columns = [
                { name: 'GIVENNAME', label: 'Given Name', cell: 'string', editable: false },
                { name: 'FAMILYNAME', label: 'Family Name', cell: 'string', editable: false },
                { name: 'LOGIN', label: 'Login', cell: 'string', editable: false },
             ]
                                        
            this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'proposals', filter: 's', search: options.params.s, loading: true, backgrid: { row: this.getOption('clickableRow'), emptyText: 'No proposals found', } })
        },
                                                                            
        onRender: function() {
            this.wrap.show(this.table)
        },
            
        onShow: function() {
            this.table.focusSearch()
        },
    })

})
