define(['marionette',
    
    'collections/visits',
    
    'modules/fault/collections/bls',
    'modules/fault/collections/systems',
    'modules/fault/collections/components',
    'modules/fault/collections/subcomponents',
    
    'utils/editable',
    'utils',
    'tpl!templates/fault/view.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, Visits, Beamlines, Systems, Components, SubComponents,
Editable, utils, template, Backbone) {
    
    
        
    return Marionette.ItemView.extend({
        className: 'content',
        template: template,
        
        templateHelpers: {
            APIURL: app.apiurl
        },

        initialize: function(options) {
            Backbone.Validation.bind(this, {
                invalid: function(view, attr, error) {
                    console.log(attr, error)
                }
            });

        },
        
        modelEvents: {
            'change:RESOLVED': 'toggleRes',
            'change:BEAMTIMELOST': 'toggleBTL',
            'change:BEAMTIMELOST_STARTTIME': 'calcLost',
            'change:BEAMTIMELOST_ENDTIME': 'calcLost',
        },
        
        ui: {
            btlst: 'input[name="BEAMTIMELOST_STARTTIME"]',
            btlen: 'input[name="BEAMTIMELOST_ENDTIME"]',
            lost: 'span.LOST',
        },
        
        onRender: function() {
            if (app.user == this.model.get('OWNER') || app.user_can('fault_global')) {
                var self = this
            
                this.beamlines = new Beamlines()
                this.beamlines.fetch()
                
                this.visits = new Visits(null, {
                    queryParams: {
                        prev: 1,
                        all: 1,
                        bl: function() {
                            return self.model.get('BEAMLINE')
                        }
                    },
                })
                
                this.systems = new Systems(null, {
                    queryParams: {
                        bl: function() {
                            return self.model.get('BEAMLINE')
                        }
                    }
                })
                
                this.components = new Components(null, {
                    queryParams: {
                        bl: function() {
                            return self.model.get('BEAMLINE')
                        },
                        sid: function() {
                            return self.model.get('SYSTEMID')
                        }
                    }
                })
                
                this.subcomponents = new SubComponents(null, {
                    queryParams: {
                        bl: function() {
                            return self.model.get('BEAMLINE')
                        },
                        cid: function() {
                            return self.model.get('COMPONENTID')
                        }
                    }
                })
                
                
                var edit = new Editable({ model: this.model, el: this.$el })
                edit.create('TITLE', 'text')
                edit.create('BEAMLINE', 'select', { data: function() {
                    self.beamlines.fetch({ async: false })
                    return self.beamlines.kv()
                } })
                edit.create('SESSIONID', 'select', { data: function() {
                    self.visits.fetch({ async: false })
                    return self.visits.kv()
                } }, true)
                edit.create('SYSTEMID', 'select', { data: function() {
                    self.systems.fetch({ async: false })
                    return self.systems.kv()
                } })
                edit.create('COMPONENTID', 'select', { data: function() {
                    self.components.fetch({ async: false })
                    return self.components.kv()
                } })
                edit.create('SUBCOMPONENTID', 'select', { data: function() {
                    self.subcomponents.fetch({ async: false })
                    return self.subcomponents.kv()
                } })
                edit.create('STARTTIME', 'datetime')
                edit.create('DESCRIPTION', 'markdown')
                edit.create('BEAMTIMELOST', 'select', { data: { 0: 'No', 1: 'Yes' } })
                edit.create('BEAMTIMELOST_STARTTIME', 'datetime')
                edit.create('BEAMTIMELOST_ENDTIME', 'datetime')
                edit.create('RESOLVED', 'select', { data: { 0: 'No', 1: 'Yes', 2: 'Partially' } })
                edit.create('ENDTIME', 'datetime')
                edit.create('RESOLUTION', 'markdown')
            }
            
            this.toggleRes(true)
            this.toggleBTL(true)        
        },

        
        toggleBTL: function(onload) {
            this.model.get('BEAMTIMELOST') == 1 ? this.$el.find('.beamtime_lost')[onload ? 'show' : 'slideDown']() : this.$el.find('.beamtime_lost')[onload ? 'hide' : 'slideUp']()
        },
        
        
        toggleRes: function() {
            this.model.get('RESOLVED') != 0 ? this.$el.find('.fresolved').show() : this.$el.find('.fresolved').hide()
        },
        
        calcLost: function() {
            var diff = utils._date_to_unix(this.ui.btlen.val()) - utils._date_to_unix(this.ui.btlst.val())
            this.ui.lost.text(diff.toFixed(1))
        }
        
    })
        
})