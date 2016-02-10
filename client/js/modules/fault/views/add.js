define(['views/form',
    'modules/fault/models/fault',
    
    'collections/visits',
    'collections/users',
    
    'modules/fault/collections/bls',
    'modules/fault/collections/systems',
    'modules/fault/collections/components',
    'modules/fault/collections/subcomponents',
    
    'tpl!templates/fault/add.html',
    'jquery',
    'backbone',
    
    'jquery-ui',
    'jquery-ui.timepicker',
    'backbone-validation',
    
    ], function(FormView,
        Fault, Visits, Users, Beamlines, Systems, Components, SubComponents,
        template, $_, Backbone) {


    return FormView.extend({
        template: template,
        
        createModel: function() {
            this.model = new Fault()
        },
        
        ui: {
            bl: 'select[name=BEAMLINE]',
            visit: 'select[name=SESSIONID]',
            btl: 'select[name=BEAMTIMELOST]',
            res: 'select[name=RESOLVED]',
        
            system: 'select[name=SYSTEMID]',
            component: 'select[name=COMPONENTID]',
            subcomponent: 'select[name=SUBCOMPONENTID]',
            assignee: 'input[name=ASSIGNEE]',
        },
        
        events: {
            'change @ui.bl': 'updateFromBeamline',
            'change @ui.system': 'updateComponents',
            'change @ui.component': 'updateSubComponents',
        
            'change @ui.btl': 'toggleLost',
            'change @ui.res': 'toggleRes',
        },
        
        updateFromBeamline: function() {
            this.updateVisits()
            this.updateSystems()
        },
        
        toggleLost: function() {
            this.ui.btl.val() == 1 ? this.$el.find('.beamtime_lost').slideDown() : this.$el.find('.beamtime_lost').slideUp()
            if (this.ui.btl.val()) {
                this.$el.find('input[name=BEAMTIMELOST_STARTTIME]').val(this.$el.find('input[name=STARTTIME]').val())
                this.$el.find('input[name=BEAMTIMELOST_ENDTIME]').val(this.$el.find('input[name=STARTTIME]').val())
            }
        },
            
        toggleRes: function() {
            this.ui.res.val() > 0 ? this.$el.find('.resolution').slideDown() : this.$el.find('.resolution').slideUp()
            if (this.ui.res.val()) {
                this.$el.find('input[name=ENDTIME]').val(this.$el.find('input[name=STARTTIME]').val())
            }
        },
                    
                    
        
        onRender: function(options) {
            var self = this
            
            this.beamlines = new Beamlines()
            this.beamlines.fetch().done(function() {
                self.ui.bl.html(self.beamlines.opts())
                self.updateVisits()
                self.updateSystems()
            })
            
            this.visits = new Visits(null, {
                queryParams: {
                    started: 1,
                    all: 1,
                    bl: function() {
                        return self.ui.bl.val()
                    }
                },
            })
            
            
            this.systems = new Systems(null, {
                queryParams: {
                    bl: function() {
                        console.log('getting bl in sys', self.ui.bl.val())
                        return self.ui.bl.val()
                    }
                }
            })
            
            this.components = new Components(null, {
                queryParams: {
                    bl: function() {
                        return self.ui.bl.val()
                    },
                    sid: function() {
                        return self.ui.system.val()
                    }
                }
            })
            
            this.subcomponents = new SubComponents(null, {
                queryParams: {
                    bl: function() {
                        return self.ui.bl.val()
                    },
                    cid: function() {
                        return self.ui.component.val()
                    }
                }
            })
            
            
            
            this.$el.find('input[name=STARTTIME],input[name=ENDTIME],input[name=BEAMTIMELOST_STARTTIME],input[name=BEAMTIMELOST_ENDTIME]').datetimepicker({ dateFormat: "dd-mm-yy" })
            
            this.$el.find('.beamtime_lost').hide()
            this.$el.find('.resolution').hide()
            
            this.ui.btl.html(_.map(this.model.btlOptions, function(v,k) { return '<option value="'+k+'">'+v+'</option>' }))
            this.ui.res.html(_.map(this.model.resolvedOptions, function(v,k) { return '<option value="'+k+'">'+v+'</option>' }))

            this.allusers = new Users()
            this.ui.assignee.autocomplete({source: this.getUsers.bind(this) })
        },

        getUsers: function(req, resp) {
            var self = this
            this.allusers.queryParams.term = req.term
            this.allusers.fetch({
                success: function(data) {
                    resp(self.allusers.map(function(m) {
                        return {
                            label: m.get('FULLNAME'),
                            value: m.get('LOGIN'),
                        }
                    }))
                }
            })
        },
        
        
        updateVisits: function() {
            this.visits.fetch().done(this.doUpdateVisits.bind(this))
        },
        
        doUpdateVisits: function() {
            this.ui.visit.html(this.visits.opts())
        },
        
        
        updateSystems: function() {
            this.systems.fetch().done(this.doUpdateSystems.bind(this))
        },
        doUpdateSystems: function() {
            this.ui.system.html(this.systems.opts())
            this.updateComponents()
        },

        
        updateComponents: function() {
            console.log('sys val', this.ui.system.val())
            this.components.fetch().done(this.doUpdateComponents.bind(this))
        },
        doUpdateComponents: function() {
            this.ui.component.html(this.components.opts())
            this.updateSubComponents()
        },

        
        updateSubComponents: function() {
            this.subcomponents.fetch().done(this.doUpdateSubComponents.bind(this))
        },
        doUpdateSubComponents: function() {
            this.ui.subcomponent.html(this.subcomponents.opts())
        },
        
        
        
        success: function(model, response, options) {
            console.log('success from fault add')
            app.trigger('fault:show', model.get('FAULTID'))
        },

        failure: function(model, response, options) {
            console.log('failure from fault add')
            app.alert({ message: 'Something went wrong registering this fault report, please try again'})
        },
    })

})