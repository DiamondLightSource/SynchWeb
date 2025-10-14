define(['marionette',
    'modules/fault/collections/bls',
    'modules/fault/collections/systems',
    'modules/fault/collections/components',
    'modules/fault/collections/subcomponents',
    'templates/fault/filters.html',
    ], function(Marionette, Beamlines, Systems, Components, SubComponents, filtertemplate) {
    
    return FilterView = Marionette.ItemView.extend({
        template: filtertemplate,
        className: 'filter filter-nohide',
        
        ui: {
            bl: 'select[name=BEAMLINE]',
            system: 'select[name=SYSTEMID]',
            component: 'select[name=COMPONENTID]',
            subcomponent: 'select[name=SUBCOMPONENTID]',
        },
        
        events: {
            'change @ui.bl': 'updateSystems',
            'change @ui.system': 'updateComponents',
            'change @ui.component': 'updateSubComponents',
            'change @ui.subcomponent': 'refetch',
            'click a.clear': 'clearFilters',
            'change select': 'updateUrlFragment',
        },

        updateUrlFragment: function() {
            const frags = {
                bl: 'bl',
                sys: 'system',
                com: 'component',
                sub: 'subcomponent',
            }

            let url = window.location.pathname

            let searchFrag = ''
            const searchMatch = url.match(/\/s\/.*$/)
            if (searchMatch) {
                searchFrag = searchMatch[0]
                url = url.replace(searchFrag, '')
            }

            _.each(frags, function(v, f) {
                url = url.replace(new RegExp('\\/'+f+'\\/\\w+'), '')
                if (this.ui[v].val()) url += '/'+f+'/'+this.ui[v].val()
            }, this)
            
            url += searchFrag
            window.history.pushState({}, '', url)
        },

        clearFilters: function(e) {
            e.preventDefault()
            
            this.ui.bl.val('')
            this.ui.system.val('')
            this.ui.component.val('')
            this.ui.subcomponent.val('')
            this.updateUrlFragment()
            
            this.collection.fetch()
            this.updateSystems()
        },
        
        initialize: function() {
            var self = this
            this.collection.queryParams.bl = function() {
                return self.ui.bl.val()
            }
            this.collection.queryParams.sid = function() {
                return self.ui.system.val()
            }
            this.collection.queryParams.cid = function() {
                return self.ui.component.val()
            }
            this.collection.queryParams.scid = function() {
                return self.ui.subcomponent.val()
            }

            this.firstLoad = true
            var vals = _.unique(_.values(this.getOption('params')))
            if (vals.length) {
                if (vals[0] == null) this.firstLoad = false
            }
        },
        
        refetch: function() {
            this.collection.fetch()
        },
        
        onRender: function() {
            var self = this
            
            this.beamlines = new Beamlines()
            this.updateBeamlines()

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
        },
        
        updateBeamlines: function(e) {
            this.beamlines.fetch().done(this.doUpdateBeamlines.bind(this,e))
        },
        doUpdateBeamlines: function(e) {
            this.ui.bl.html('<option value="">-</option><option value="P01">Phase I</option>'+this.beamlines.opts())
            if (this.getOption('params') && this.getOption('params').beamline) {
                this.ui.bl.val(this.getOption('params').beamline)
                this.updateSystems()
            }
        },
        
        updateSystems: function(e) {
            this.systems.fetch().done(this.doUpdateSystems.bind(this,e))
        },
        doUpdateSystems: function(e) {
            var val = this.ui.system.val()
            this.ui.system.html('<option value="">-</option>'+this.systems.opts()).val(val)
            if (this.getOption('params') && this.getOption('params').system && this.firstLoad) {
                this.ui.system.val(this.getOption('params').system)
                this.updateComponents()
            } else {
                this.collection.fetch()
            }
        },
        
        updateComponents: function(e) {
            this.components.fetch().done(this.doUpdateComponents.bind(this,e))
        },
        doUpdateComponents: function(e) {
            var val = this.ui.component.val()
            this.ui.component.html('<option value="">-</option>'+this.components.opts()).val(val)
            if (this.getOption('params') && this.getOption('params').component && this.firstLoad) {
                this.ui.component.val(this.getOption('params').component)
                this.updateSubComponents()
            } else {
                this.collection.fetch()
            }
        },

        updateSubComponents: function(e) {
            this.subcomponents.fetch().done(this.doUpdateSubComponents.bind(this,e))
        },
        doUpdateSubComponents: function(e) {
            var val = this.ui.subcomponent.val()
            this.ui.subcomponent.html('<option value="">-</option>'+this.subcomponents.opts()).val(val)
            if (this.getOption('params') && this.firstLoad) this.ui.subcomponent.val(this.getOption('params').subcomponent)
            if (e || this.firstLoad) this.collection.fetch()
            if (this.firstLoad) this.firstLoad = false
        },
      
    })

})
