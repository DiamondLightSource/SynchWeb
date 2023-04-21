define(['marionette', 'backbone',
        'views/validatedrow',
        'utils/editable',

        'modules/admin/models/group',
        'modules/admin/collections/groups',

        'modules/admin/models/permission',
        'modules/admin/collections/permissions',

        'templates/admin/groups.html',
        'templates/admin/groupstable.html',
        'templates/admin/groupstablerow.html',
        'templates/admin/groupstablerownew.html',
        'templates/admin/permstable.html',
        'templates/admin/permstablerow.html',
        'templates/admin/permstablerownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, ValidatedRow, Editable,
        Group, Groups, Permission, Permissions,
        template, table, rowtemplate, rowtemplatenew,
        ptable, prowtemplate, prowtemplatenew) {
    
    var GridRow = ValidatedRow.extend({
        getTemplate: function() {
            return this.model.get('new') || this.model.get('edit') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        events: {
            'click': 'rowClick',
            'click a.cancel': 'cancel',
            'click a.edit': 'edit',
        },

        edit: function(e) {
            e.preventDefault()
            this.model.set('edit', true)
            this.render()
        },


        cancel: function(e) {
            e.preventDefault()

            if (this.model.get('new')) {
                this.model.collection.remove(this.model)	
            } else {
                this.model.set('edit', false)
                this.render()
            }
        },

        rowClick: function(e) {
            if (this.model.get('new') || this.model.get('edit')) return
            app.trigger('group:show', this.model.get('USERGROUPID'))
        },
        
        setData: function() {
            var data = {}
            _.each(['NAME', 'TYPE', 'DESCRIPTION'], function(f) {
                data[f] = $('[name='+f+']').val()
            })

            this.model.set(data)
        },

        success: function(m,r,o) {
            this.model.set('new', false)
            this.model.set('edit', false)

            this.render()
        },
        
        error: function(m,r,o) {
            app.message('Something went wrong creating this dewar, please try again')
        },
        
        
        initialize: function() {

        },
    
        onRender: function() {
            console.log('rendering row')
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this)
        },
        
    })


    var EmptyView = Marionette.ItemView.extend({
        tagName: 'tr',
    })
        
    var TableView = Backbone.Marionette.CompositeView.extend({
        tagName: "table",
        template: table,
        childView: GridRow,
        

        childEvents: {
            'row:click': 'rowClick',
        },

        rowClick: function(view, m) {
            this.trigger('row:click', m)
        },


    })


    var EmptyGroupsView = EmptyView.extend({
        template: _.template('<td colspan="6">No groups defined</td>')
    })

    var GroupsView = TableView.extend({
        emptyView: EmptyGroupsView,
        className: 'groups',
    })


    var EmptyPermsView = EmptyView.extend({
        template: _.template('<td colspan="6">No permissions defined</td>')
    })

    var PermsGridRow = GridRow.extend({
        getTemplate: function() {
            return this.model.get('new') || this.model.get('edit') ? prowtemplatenew : prowtemplate
        },

        rowClick: function() {},
    })

    var PermsView = TableView.extend({
        emptyView: EmptyPermsView,
        template: ptable,
        className: 'perms',
        childView: PermsGridRow,
    })



    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: {
            grps: '.groups',
            prms: '.perms',
        },

        events: {
            'click .add_group': 'addGroup',
            'click .add_perm': 'addPerm',
        },

        addGroup: function(e) {
            e.preventDefault()
            this.groups.add(new Group({
                new: true
            }))
        },

        addPerm: function(e) {
            e.preventDefault()
            this.perms.add(new Permission({
                new: true
            }))
        },


        initialize: function(options) {
            this.groups = new Groups()
            this.groups.fetch()

            this.perms = new Permissions()
            this.perms.fetch()
        },

        onRender: function(){
            var groupview = new GroupsView({ collection: this.groups })
            this.grps.show(groupview)

            var prmsview = new PermsView({ collection: this.perms })
            this.prms.show(prmsview)
        },

    })
})