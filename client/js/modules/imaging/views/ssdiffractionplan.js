define(['marionette',
    
    'modules/imaging/models/plan',
    'modules/imaging/collections/plans',

    'modules/imaging/views/presetadd',

    'utils/editable',
    'tpl!templates/imaging/ssdiffractionplan.html',
    'backbone', 'backbone-validation'
    ], function(Marionette, 
        DiffractionPlan, DiffractionPlans, PresetAddView,
        Editable, template, Backbone) {
    
    
        
    return Marionette.ItemView.extend({
        className: 'content',
        template: template,
        
        modelEvents: {
            'change:EXPERIMENTKIND': 'toggleType',
        },

        ui: {
            plan: 'select[name=preset]',
        },

        events: {
            'click a.save': 'savePreset',
            'click a.apply': 'applyPreset',
        },

        savePreset: function(e) {
            e.preventDefault()

            var preset = new DiffractionPlan()

            _.each(['EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'REQUIREDRESOLUTION'], function(k) {
                preset.set(k, this.model.get(k))
            }, this)

            app.dialog.show(new DialogView({ 
                title: 'Add Diffraction Plan Preset',
                className: 'content', 
                view: new PresetAddView({ dialog: true, model: preset }),
                autoSize: true 
            })) 
        },

        applyPreset: function(e) {
            e.preventDefault()

            var p = this.plans.findWhere({ DIFFRACTIONPLANID: this.ui.plan.val() })
            console.log(p)
            if (p) {
                _.each(['EXPERIMENTKIND', 'PREFERREDBEAMSIZEX', 'PREFERREDBEAMSIZEY', 'EXPOSURETIME', 'REQUIREDRESOLUTION'], function(k) {
                    this.model.set(k, p.get(k))
                }, this)
                this.model.save({})
                this.render()
            }
        },



        toggleType: function(e) {
            if (this.model.get('EXPERIMENTKIND') == 'OSC') {
                this.$el.find('.grid').hide()
                this.$el.find('.data').show()

            } else {
                this.$el.find('.grid').show()
                this.$el.find('.data').hide()
            }
        },


        initialize: function(options) {
            Backbone.Validation.bind(this);

            this.plans = new DiffractionPlans()
            this._ready = this.plans.fetch()
        },

        updatePlans: function(e) {
            this.ui.plan.html(this.plans.opts())
        },
        
        
        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('EXPERIMENTKIND', 'select', { data: { 'MESH': 'Grid Scan', 'OSC': 'Data Collection' }});
            edit.create('X', 'text');
            edit.create('Y', 'text');
            edit.create('COMMENTS', 'text');
            edit.create('WAVELENGTH', 'text');
            edit.create('TRANSMISSION', 'text');
            edit.create('PREFERREDBEAMSIZEX', 'text');
            edit.create('PREFERREDBEAMSIZEY', 'text');
            edit.create('BOXSIZEX', 'text');
            edit.create('BOXSIZEY', 'text');
            edit.create('EXPOSURETIME', 'text');
            edit.create('REQUIREDRESOLUTION', 'text');
            edit.create('AXISSTART', 'text');
            edit.create('AXISRANGE', 'text');
            edit.create('NUMBEROFIMAGES', 'text');
            edit.create('KAPPASTART', 'text');
            
            this.toggleType()

            $.when(this._ready).done(this.updatePlans.bind(this))
        },
        
    })
        
})