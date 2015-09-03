define(['marionette',

    'views/table',
    'utils/table',

    'modules/admin/collections/permissions',
    'modules/admin/collections/users',

    'tpl!templates/admin/viewgroup.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, TableView, table,
        Permissions, Users,
        template, Backbone) {
    
    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        
        onClick: function(e) {
            if (!($(e.target).is('i') || $(e.target).is('a'))) return
            
            console.log('click', this.url, this.idcolumn, this.model.get(this.idcolumn))
            var self = this
            Backbone.ajax({ 
                url: this.url+'/'+this.model.get(this.idcolumn),
                type: 'DELETE',
                success: function() {
                    self.model.collection.remove(self.model)
                }
            })

        },
    })
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            usrs: '.users',
            prms: '.perms',
        },

        ui: {
            addu: 'input[name=user]',
            addp: 'input[name=permission]',
        },


        events: {
            'keypress @ui.addu': 'keypressUser',
            'keypress @ui.addp': 'keypressPermission',
        },


        keypressUser: function(e) {
            if (e.which == 13) {
                var self = this
                Backbone.ajax({
                    url: app.apiurl+'/users/groups/'+this.model.get('USERGROUPID')+'/users/'+this.ui.addu.val(),
                    type: 'POST',
                    success: function(resp) {
                        self.ui.addu.val('')
                        self.users.fetch()
                    }
                })
            }
        },

        keypressPermission: function(e) {
            if (e.which == 13) {
                var self = this
                Backbone.ajax({
                    url: app.apiurl+'/users/groups/'+this.model.get('USERGROUPID')+'/permission/'+this.ui.addp.val(),
                    type: 'POST',
                    success: function(resp) {
                        self.ui.addp.val('')
                        self.permissions.fetch()
                    }
                })
            }
        },

        
        initialize: function(options) {
            this.permissions = new Permissions()
            this.permissions.queryParams.gid = this.model.get('USERGROUPID')
            this.permissions.fetch()

            this.users = new Users()
            this.users.queryParams.gid = this.model.get('USERGROUPID')
            this.users.fetch()

            var columns = [
                { name: 'TYPE', label: 'Name', cell: 'string', editable: false },
                { name: 'DESCRIPTION', label: 'Description', cell: 'string', editable: false },
                { label: '', cell: table.TemplateCell, editable: false, template: '<a class="button" href="#"><i class="fa fa-times"></i></a>' },
            ]

            var DeleteRow = ClickableRow.extend({
                url: app.apiurl+'/users/groups/'+this.model.get('USERGROUPID')+'/permission',
                idcolumn: 'PERMISSIONID'
            })

            this.permstable = new TableView({ 
                collection: this.permissions, 
                columns: columns, 
                tableClass: 'permissions', 
                filter: 's', 
                search: options.params && options.params.s, 
                loading: true, 
                backgrid: { 
                    row: DeleteRow,
                    emptyText: 'No permissions found'
                }, 
            })


            var columns = [
                { name: 'GIVENNAME', label: 'First Name', cell: 'string', editable: false },
                { name: 'FAMILYNAME', label: 'Surname', cell: 'string', editable: false },
                { name: 'LOGIN', label: 'Login', cell: 'string', editable: false },
                { label: '', cell: table.TemplateCell, editable: false, template: '<a class="button" href="#"><i class="fa fa-times"></i></a>' },
            ]

            var DeleteRow = ClickableRow.extend({
                url: app.apiurl+'/users/groups/'+this.model.get('USERGROUPID')+'/users',
                idcolumn: 'PERSONID'
            })

            this.userstable = new TableView({ 
                collection: this.users, 
                columns: columns, 
                tableClass: 'users', 
                filter: 's', 
                search: options.params && options.params.s, 
                loading: true, 
                backgrid: { 
                    row: DeleteRow,
                    emptyText: 'No users found'
                }, 
            })
        },
        
        
        onRender: function() {
            this.prms.show(this.permstable)
            this.usrs.show(this.userstable)

            this.ui.addp.autocomplete({ 
                source: function(req, resp) {
                    Backbone.ajax({
                        url: app.apiurl+'/users/permissions',
                        data: {
                            s: req.term,
                        },
                        success: function(data) {
                            resp(_.map(data.data, function(item, i) {
                                console.log(item, i)
                                return {
                                    label: item.TYPE,
                                    value: item.PERMISSIONID,
                                }
                            }))
                        }
                    })
                } 
            })

            this.ui.addu.autocomplete({ 
                source: function(req, resp) {
                    Backbone.ajax({
                        url: app.apiurl+'/users',
                        data: {
                            s: req.term,
                        },
                        success: function(data) {
                            resp(_.map(data.data, function(item, i) {
                                console.log(item, i)
                                return {
                                    label: item.FULLNAME,
                                    value: item.PERSONID,
                                }
                            }))
                        }
                    })
                } 
            })
            
        },
        
    })
        
})
