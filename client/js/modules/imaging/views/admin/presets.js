define(['marionette', 
    'modules/imaging/collections/plans',
    'modules/imaging/models/plan',

    'views/table',
    'utils/table',

    'collections/bls',

    'modules/imaging/models/plan_point_vmxi',
    'modules/imaging/models/plan_grid_vmxi',
    'modules/imaging/models/plan_xfe_vmxi',

    'tpl!templates/imaging/presetadmin.html','tpl!templates/imaging/queuepoint.html', 
    'tpl!templates/imaging/queuegrid.html', 'tpl!templates/imaging/queuexfe.html',
    ], function(Marionette,
        Plans, Plan,
        TableView, table,
        Beamlines,
        VMXiPoint, VMXiGrid, VMXiXFE,
        template, pointemplate, gridtemplate, xfetemplate) {



    var SaveCell = Backgrid.Cell.extend({
        events: {
            'click a.save': 'save',
            'click a.cancel': 'cancel',
        },

        save: function(e) {
            e.preventDefault()

            if (this.model.isValid(true) && this.model.get('_valid')) {
                var self = this
                this.model.save({}, {
                    success: function() {
                        self.render()
                    }
                })
            }
        },

        cancel: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },

        render: function() {
            this.$el.empty()
            if (this.model.isNew()) {
                this.$el.html('<a href="#" class="button save"><i class="fa fa-save"></i></a> <a href="#" class="button cancel"><i class="fa fa-times"></i></a>')
            }

            return this
        }
    })

    
    var ExperimentCell = Backgrid.Cell.extend({
        plans: {
            SAD: VMXiPoint,
            MESH: VMXiGrid,
            XFE: VMXiXFE,
        },

        events: {
            'change input': 'updateModel',
            'blur input': 'updateModel',
            'keyup input': 'updateModel',
            'change select': 'updateModel',
        },

        updateModel: function(e) {
            console.log('up mod', $(e.target).attr('name'))
            this.model.set($(e.target).attr('name'), $(e.target).val())
            this.plan.set(this.model.toJSON())
            this.validate({ attr: $(e.target).attr('name'), val: $(e.target).val() })
            this.preSave()
        },

        preSave: function() {
            if (this.plan.isValid(true)) {
                this.model.set('_valid', true)
            } else {
                this.model.set('_valid', false)
            }
        },

        validate: function(options) {
            var error = this.plan.preValidate(options.attr, options.val)
            var attr = this.$el.find('[name='+options.attr+']')
            if (error) this.invalid(attr, error)
            else this.valid(attr)
        },

        invalid: function(attr, error) {
            $(attr).removeClass('fvalid').addClass('ferror')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            $(attr).removeClass('ferror').addClass('fvalid').siblings('span.errormessage').remove()
        },

        initialize: function(options) {
            ExperimentCell.__super__.initialize.call(this,options)

            this.listenTo(this.model, 'change:EXPERIMENTKIND', this.render, this)
            this.listenTo(this.model, 'refresh', this.render, this)

            this.preSave = _.debounce(this.preSave, 1000)
        },

        bindModel: function() {
            if (this.model.get('EXPERIMENTKIND') in this.plans) {
                this.plan = new this.plans[this.model.get('EXPERIMENTKIND')]()
            } else this.plan = new Plan()

            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
                model: this.plan,
                selector: 'name',
                valid: function(view, attr) {
                  view.valid(view.$el.find('[name="'+attr+'"]'))
                },
                invalid: function(view, attr, error) {
                  view.invalid(view.$el.find('[name="'+attr+'"]'), error)
                }
            })

            this.plan.set(this.model.toJSON())
            this.listenTo(this.plan, 'computed:changed', this.updateComputed)
        },

        updateComputed: function() {
            _.each(this.plan.computed(), function(k) {
                this.$el.find('[name='+k+']').val(this.plan.get(k)).trigger('change')
            }, this)
        },

        render: function(e) {
            console.log('render cell exp')
            var types = {
                'SAD': pointemplate,
                'MESH': gridtemplate,
                'XFE': xfetemplate,
            }

            this.$el.empty()
            if (this.model.get('EXPERIMENTKIND') in types) {
                this.$el.html(types[this.model.get('EXPERIMENTKIND')](this.model.toJSON()))
            }

            this.bindModel()
            this.updateComputed()

            return this
        },
    })


    var ExperimentKindCell = Backgrid.Cell.extend({

        events: {
            'change select': 'updateModel'
        },

        updateModel: function() {
            this.model.set('EXPERIMENTKIND', this.$el.find('select').val())
        },

        types: [
            { name: 'Point Collection', type: 'SAD' }, 
            { name: 'Fluorescence', type: 'XFE' },
            { name: 'Grid Scan', type: 'MESH' },
        ],

        render: function() {
            var options = ''
            _.each(this.types, function(o) {
                options += '<option value="'+o.type+'">'+o.name+"</option>"
            })

            this.$el.html('<select name="EXPERIMENTKIND">'+options+'</select>')
            this.$el.find('select').val(this.model.get('EXPERIMENTKIND'))

            return this
        }

    })
    


    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rprs: '.presets',
        },

        events: {
            'click a.add': 'addPlan',
        },

        addPlan: function(e) {
            e.preventDefault()
            this.plans.add(new Plan({ EXPERIMENTKIND: 'SAD' }))
        },


        templateHelpers: function() {
            return {
                PRESETPROPOSAL: app.options.get('preset_proposal'),
            }
        },

        initialize: function(options) {
            this.beamlines = new Beamlines(null, { ty: app.type })
            this.beamlines.fetch()

            this.plans = new Plans()
            this.plans.fetch()
            this.listenTo(this.plans, 'change', this.savePlan)
        },

        savePlan: function(m, v) {
            console.log('model changed', arguments)
            if (!m.isNew()) m.save(m.changedAttributes(), { patch: true })
        },


        onRender: function() {
            this.rprs.show(new TableView({
                collection: this.plans,
                tableClass: 'subsamples', 
                columns: [
                    { name: 'BEAMLINENAME', label: 'Beamline', cell: table.SelectInputCell, editable: true, options: this.beamlines },
                    { name: 'COMMENTS', label: 'Name', cell: table.ValidatedCell, editable: true },
                    { label: 'Exp. Type', cell: ExperimentKindCell, editable: false },
                    { label: 'Parameters', cell: ExperimentCell, editable: false },
                    { label: '', cell: SaveCell, editable: false },

                ],
                backgrid: {
                    emptyText: 'No preset defined'
                }
            }))
        }


    })



})