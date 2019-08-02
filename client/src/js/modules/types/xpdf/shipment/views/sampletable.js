/*
 * A table of the instances in an XPDF sample changer.
 */

define(['backgrid',
    'modules/shipment/views/sampletable',
    'views/dialog',
    'modules/types/xpdf/samples/views/samplecontainerview',
    'templates/types/xpdf/shipment/sampletable.html',
    'templates/types/xpdf/shipment/sampletablerow.html',
    'templates/types/xpdf/shipment/sampletablerowedit.html',
    ], function(
    Backgrid,
    SampleTableView,
    DialogView,
    SampleContainerView,
    table, tablerow, tablerowedit
    ) {
    
    var GridRow = SampleTableView.GridRow.extend({
        rowTemplate: tablerow, 
        editTemplate: tablerowedit,

        events: _.extend({}, SampleTableView.GridRow.prototype.events, {
            'click a.cont': 'showEditContainers',
        }),

        showEditContainers: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Edit Containers', className: 'content', view: new SampleContainerView({ dialog: true, parent: this.model }), autoSize: true }))
        },

        initialize: function(options) {
            GridRow.__super__.initialize.call(this, options)

            if (options && options.crystals) {
                this.crystals = options.crystals
                this.listenTo(this.crystals, 'reset add change', this.updateCrystals, this)
            }
        },

        onRender: function() {
            GridRow.__super__.onRender.call(this)

            this.$el.find('select[name=CRYSTALID]').combobox({ invalid: this.invalidCrystal.bind(this), change: this.selectCrystal.bind(this), select: this.selectCrystal.bind(this) })
            this.updateCrystals()

            if (this.model.get('CRYSTALID') > -1) this.$el.find('select[name=CRYSTALID]').combobox('value', this.model.get('CRYSTALID'))
        },

        invalidCrystal: function(ui, val) {
            ui.combobox('value', -1).trigger('change')    
        },

        selectCrystal: function(ui, val) {
            this.validateField.apply(this,arguments)
            var c = this.crystals.findWhere({ CRYSTALID: this.$el.find('select[name=CRYSTALID]').combobox('value') })
            if (c) {
                this.model.set({
                    CRYSTAL: c.get('NAME'),
                    PROTEINID: c.get('PROTEINID'),
                    THEORETICALDENSITY: c.get('THEORETICALDENSITY'),
                })
            }
        },

        editSample: function(e) {
            GridRow.__super__.editSample.call(this, e)
            this.updateCrystals()
        },

        updateCrystals: function() {
            this.$el.find('select[name=CRYSTALID]').html(this.crystals.opts())
            this.$el.find('select[name=CRYSTALID]').combobox('value', this.model.get('CRYSTALID'))
        },
    })


    var SampleTableView = SampleTableView.extend({
        template: table,
        childView: GridRow,

        initialize: function(options) {
            SampleTableView.__super__.initialize.call(this, options)
            this.options.childViewOptions.crystals = options.crystals
        },
    })
    
    return SampleTableView
})
