define(['marionette',
    
    'utils/editable',
    'collections/proteins',
    'collections/samples',
    'collections/datacollections',
    'collections/users',
    
    'modules/projects/models/user',
    'collections/users',
    
    'modules/dc/datacollections',
    'modules/samples/views/list',
    'modules/samples/views/proteinlist',
    
    'modules/projects/views/users',
    
    'templates/projects/projectview.html',
    'backbone', 'jquery', 'backbone-validation'
    ], function(Marionette, Editable, Proteins, Samples, DCCol, Users, ProjectUser, ProjectUsers, DCView, SampleList, ProteinList, ProjectUserView, template, Backbone, $) {
    
    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            dc: '.datacollections',
            smp: '.samples',
            prt: '.proteins',
            usr: 'div.users',
        },
        
        events: {
            'click @ui.imp': 'toggleImplicit',
            'keypress @ui.user': 'keypressUser',
        },
        
        ui: {
            imp: 'a.imp',
            user: 'input[name=adduser]',
        },
        
        keypressUser: function(e) {
            console.log(e.which==13, e.which)
            if (e.which == 13) {
                var user = new ProjectUser({
                    PROJECTID: this.model.get('PROJECTID'),
                    PERSONID: this.ui.user.val()
                })
                
                var self = this
                user.save({}, {
                    success: function(a,b,c) {
                        console.log('succes', a,b,c)
                        self.users.add(user)
                    },
                    error: function(a,b,c) {
                        app.message('Something went wrong adding that user, please try again')
                    }
                })
            }
        },
        
        initialize: function(options) {
            Backbone.Validation.bind(this);

            this.allusers = new Users()
            this.users = new Users(null, { model: ProjectUser })
            this.users.queryParams.pjid = this.model.get('PROJECTID')
            this.users.fetch()
            
            this.implicit = 1
            
            this.proteins = new Proteins(null, { queryParams: { pjid: this.model.get('PROJECTID'), imp: this.isImplicit.bind(this) }, state: { pageSize: 5 } })
            this.proteins.fetch()
            
            this.samples = new Samples(null, { queryParams: { pjid: this.model.get('PROJECTID'), imp: this.isImplicit.bind(this) }, state: { pageSize: 5 } })
            this.samples.fetch()
            
            this.dcs = new DCCol(null, { queryParams: { pjid: this.model.get('PROJECTID'), imp: this.isImplicit.bind(this), pp: 5 } })
            this.dcs.fetch()
        },
        
        
        isImplicit: function() {
            return this.implicit
        },
        
        toggleImplicit: function(e) {
            e.preventDefault()
            this.implicit = this.implicit ? 0 : 1
            this.ui.imp.children('span').text(this.implicit ? 'Implicit' : 'Explicit')
            this.proteins.fetch()
            this.samples.fetch()
            this.dcs.fetch()
        },
        
        
        getUsers: function(req, resp) {
            var self = this
            this.allusers.queryParams.s = req.term
            this.allusers.fetch({
                success: function(data) {
                    resp(self.allusers.map(function(m) {
                        return {
                            label: m.get('FULLNAME'),
                            value: m.get('PERSONID'),
                        }
                    }))
                }
            })
        },


        onRender: function() {
            console.log("PROJECT VIEW AUTO?")
            this.ui.user.autocomplete({ source: this.getUsers.bind(this) })
            
            if (this.model.get('IS_OWNER')) {
                var edit = new Editable({ model: this.model, el: this.$el })
                edit.create('TITLE', 'text')
                edit.create('ACRONYM', 'text')
            }

            this.dc.show(new DCView({ model: this.model, collection: this.dcs, params: { visit: null }, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.smp.show(new SampleList({ collection: this.samples, noPageUrl: true, noFilterUrl: true, noSearchUrl: true }))
            this.prt.show(new ProteinList({ collection: this.proteins, noPageUrl: true, noSearchUrl: true }))
            
            var self = this
            this.usr.show(new ProjectUserView({
                collection: this.users,
                childViewOptions: function() {
                    var is_owner = self.model.get('IS_OWNER')
                    return {
                        templateHelpers: function() {
                            return {
                                IS_OWNER: is_owner,
                            }
                        }
                    }
                }
            }))
        },
        
    })
        
})
