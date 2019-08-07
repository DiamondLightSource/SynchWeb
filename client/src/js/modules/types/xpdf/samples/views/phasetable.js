/**
 * Given a collection of phases, draw a view that displays the phases, allows
 * addition or removal and editing of their abundance.
 */

define([
    'marionette',
    'utils/table',
    'views/table',
    'views/dialog',
    'collections/proteins',
    'modules/types/xpdf/samples/views/phaselist',
    'modules/types/xpdf/samples/views/phaseadd',
    'templates/types/xpdf/samples/phasetable.html'
    ], function(
            Marionette,
            table,
            TableView,
            DialogView,
            Proteins,
            PhaseList,
            AddPhase,
            template
    ) {
    

    var RemoveCell = table.TemplateCell.extend({
        events: {
            'click a.rem': 'doRemove',
        },

        doRemove: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },

        render: function() {
            this.$el.html('<a class="button rem" title="Remove Phase" href="#"><i class="fa fa-times"></i></a>')
            return this
        }
    })


    var PhaseDialog = DialogView.extend({
        title: 'Add Phase', 
        className: 'content', 
        autoSize: true,

        buttons: {
            'Add': 'onAdd',
            'Cancel': 'closeDialog',
        },

        onAdd: function() {
            this.closeDialog()
        },
    })



    return Marionette.LayoutView.extend({
        template: template,
        regions: {
            table: '.table',
        },
        events: {
            'click a.addphase': 'addPhase',
            'click a.newphase': 'addNewPhase',
        },

        ui: {
            buttons: '.buttons'
        },

        editable: true,
        
        initialize: function() {
            this.allphases = new Proteins()
            this.allphases.queryParams.seq = 1
            this.allphases.fetch()
        },
        
        onRender: function() {
            var columns = [
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'SEQUENCE', label: 'Composition', cell: 'string', editable: false },
                { name: 'ABUNDANCE', label: 'Fraction', cell: table.ValidatedCell, editable: this.getOption('editable') },
                { label: '', cell: table.TemplateCell, editable: false, template: '<a class="button" title="View Phase" href="/phases/pid/<%-PROTEINID%>"><i class="fa fa-search"></i></a>' },
            ]

            if (this.getOption('editable')) columns.push({ label: '', cell: RemoveCell, editable: false })

            this.table.show(new TableView({
                collection: this.collection,
                columns: columns,
                pages: false,
                backgrid: {
                    emptyText: 'No phases found'
                }
            }))

            if (!this.getOption('editable')) this.ui.buttons.hide()
        },

        
        addPhase: function(e) {
            e.preventDefault()

            var phaseList = new PhaseList({ collection: this.allphases, selectable: true })
            app.dialog.show(new PhaseDialog({ view: phaseList }))
            this.listenTo(app.dialog.currentView, 'close', this.doAddPhases, this)
        },

        doAddPhases: function() {
            var selected = this.allphases.where({ isGridSelected: true })
            var abpp = (Math.max(0, 1-this.collection.totalAbundance())/selected.length).toFixed(3)

            _.each(selected, function(p) {
                p.set({ isGridSelected: false })
                var np = p.clone()
                np.set('ABUNDANCE', abpp)
                this.collection.add(np)
            }, this)

        },


        
        addNewPhase: function(e) {
            e.preventDefault()

            var addPhaseView = new AddPhase({ dialog: true })
            this.listenTo(addPhaseView, 'phase:added', this.doAddNewPhase)
            app.dialog.show(new DialogView({ title: 'Add New Phase', className: 'content', view: addPhaseView, autoSize: true }))
        },

        doAddNewPhase: function(phase) {
            this.allphases.add(phase)
            var np = phase.clone()
            np.set('ABUNDANCE', Math.max(0, 1-this.collection.totalAbundance()).toFixed(3))
            this.collection.add(np)
        },

        
    })

})
