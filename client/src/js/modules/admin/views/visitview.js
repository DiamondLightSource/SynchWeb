define(['marionette', 'backbone',
        'views/validatedrow',
        'utils/editable',
        'collections/users',
        'collections/beamlinesetups',
        'collections/beamcalendars',
        'views/table',
        'utils/table',
        'utils/kvcollection',
        'templates/admin/visitview.html'
    ], function(Marionette, Backbone, ValidatedRow, Editable,
        Users, BeamlineSetups, BeamCalendars, TableView, table, KVCollection, template) {

    var VisitUser = Backbone.Model.extend({
        baseUrl: '/proposal/visits/users',
        idAttribute: 'SHPKEY',
    })

    var VisitUsers = Users.extend({
        url: '/proposal/visits/users',
        model: VisitUser,
    })


    var YesNoEdit = Backgrid.SelectCell.extend({
        optionValues: function() {
            return [['Yes', '1'], ['No', '0']]
        }
    })

    var roles = [
        'Local Contact',
        'Local Contact 2',
        'Staff',
        'Team Leader',
        'Co-Investigator',
        'Principal Investigator',
        'Alternate Contact',
        'Data Access',
        'Team Member',
    ]
    var RolesCollection = Backbone.Collection.extend(_.extend({}, {
        keyAttribute: 'role',
        valueAttribute: 'role',
    }, KVCollection))
    var Roles = new RolesCollection(_.map(roles, function(r) { return { role: r } }))

    var ActionCell = Backgrid.Cell.extend({
        events: {
            'click a.save': 'saveUser',
            'click a.cancel': 'cancelUser',
            'click a.remove': 'removeUser',
        },

        saveUser: function(e) {
            e.preventDefault()
            this.model.save()
        },

        cancelUser: function(e) {
            e.preventDefault()
            if (this.model.isNew()) this.model.collection.remove(this.model)
        },

        removeUser: function(e) {
            e.preventDefault()
            this.model.destroy()
        },

        render: function() {
            if (this.model.isNew()) {
                this.$el.html('<a href="#" class="button save"><i class="fa fa-check"></i></a> <a href="#" class="button cancel"><i class="fa fa-times"></i></a>')
            } else {
                this.$el.html('<a href="#" class="button remove"><i class="fa fa-times"></i></a>')
            }

            return this
        }
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rusers: '.rusers',
        },

        ui: {
            addu: 'input[name=user]',
        },

        events: {
            'keypress @ui.addu': 'keypressUser',
        },

        templateHelpers: function() {
            return {
                editUsers: app.user_can('manage_vusers'),
            }
        },


        keypressUser: function(e) {
            if (e.which == 13) {
                var self = this
                Backbone.ajax({
                    type: 'POST',
                    success: function(resp) {
                        self.ui.addu.val('')
                        self.users.fetch()
                    }
                })
            }
        },

        saveUser: function(m) {
            if (m.isNew()) return
            console.log('save user', m)
            m.save(m.changedAttributes(), { patch: true })
        },

        getBeamline: function() {
            return this.model.get('BEAMLINENAME')
        },

        getBeamlineSetups: function() {
            this.beamlinesetups.fetch()
        },

        getStartDate: function() {
            return this.model.get('STARTDATE')
        },

        getBeamCalendars: function() {
            this.beamcalendars.fetch()
        },

        initialize: function(options) {
            this.beamlinesetups = new BeamlineSetups()
            this.beamlinesetups.queryParams.bl = this.getBeamline.bind(this)
            this.getBeamlineSetups()

            this.listenTo(this.model, 'change:BEAMLINENAME', this.getBeamlineSetups.bind(this))

            this.beamcalendars = new BeamCalendars()
            this.beamcalendars.queryParams.startdate = this.getStartDate.bind(this)
            this.getBeamCalendars()

            this.listenTo(this.model, 'change:BEAMCALENDARID', this.getBeamCalendars.bind(this))

            this.users = new VisitUsers(null, { queryParams: { visit: this.model.get('VISIT') }})
            this.users.fetch()

            var columns = [
                { name: 'FULLNAME', label: 'Full Name', cell: 'string', editable: false },
                { name: 'ROLE', label: 'Role', cell: table.SelectInputCell, options: Roles, editable: app.user_can('manage_vusers') },
                { name: 'REMOTE', label: 'Remote', cell: YesNoEdit, editable: app.user_can('manage_vusers') },
                { name: '', label: '', cell: ActionCell, editable: false },
            ]

            this.listenTo(this.users, 'change', this.saveUser)

            this.table = new TableView({ 
                collection: this.users,
                columns: columns, 
                tableClass: 'vusers', 
                loading: true, 
                backgrid: { emptyText: 'No users found' } 
            })
        },

        addUser: function(e, ui) {
            e.preventDefault()
            this.users.add(new VisitUser({
                SESSIONID: this.model.get('SESSIONID'),
                FULLNAME: ui.item.label,
                PERSONID: ui.item.value,
                REMOTE: 0,
                new: true
            }))

            this.ui.addu.val('')
        },

        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('STARTDATE', 'datetime')
            edit.create('ENDDATE', 'datetime')
            edit.create('BEAMLINENAME', 'text')
            edit.create('BEAMLINEOPERATOR', 'text')
            edit.create('SESSIONTYPE', 'text')
            edit.create('SCHEDULED', 'select', { data: { 1: 'Yes', 0: 'No' } })
            edit.create('ARCHIVED', 'select', { data: { 1: 'Yes', 0: 'No' } })
            edit.create('COMMENTS', 'textarea')
            
            var self = this
            edit.create('BEAMLINESETUPID', 'select', { data: function() {
                self.beamlinesetups.fetch({ async: false })
                return self.beamlinesetups.kv()
            } })

            edit.create('BEAMCALENDARID', 'select', { data: function() {
                self.beamcalendars.fetch({ async: false })
                return self.beamcalendars.kv()
            } })

            this.rusers.show(this.table)

            if (app.user_can('manage_vusers')) {
                this.ui.addu.autocomplete({ 
                    select: this.addUser.bind(this),
                    source: function(req, resp) {
                        Backbone.ajax({
                            url: app.apiurl+'/users',
                            data: {
                                s: req.term,
                            },
                            success: function(data) {
                                resp(_.map(data.data, function(item, i) {
                                    return {
                                        label: item.FULLNAME,
                                        value: item.PERSONID,
                                    }
                                }))
                            }
                        })
                    } 
                })
            }
        },
    })

})
