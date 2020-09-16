/**
 * View a Collection of Crystals as XPDF samples
 */

define([
    'marionette',
    'backgrid',
    'views/table',
    'utils/table',
    'modules/types/xpdf/utils/phasecompositor',
    'templates/types/xpdf/samples/samplelist.html'], function(
        Marionette,
        Backgrid,
        TableView,
        table,
        phaseCompositor,
        template) {


    var ClickableRow = table.ClickableRow.extend({
        event: 'xsamples:view',
        argument: 'CRYSTALID',
        cookie: true,
    })


    var CompositionCell = Backgrid.Cell.extend({
        initialize: function(options) {
            CompositionCell.__super__.initialize.call(this, options)
            this.listenTo(this.model.get('components'), 'reset add remove', this.render)
        },

        render: function() {
            if (this.model.get('components').length) {
                var comp = phaseCompositor.composeComposition(this.model.get('components'), this.model.get('components').pluck('ABUNDANCE'), true)
                this.$el.text(comp)
            }
            return this
        }
    })

    
    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',

        row: ClickableRow,

        templateHelpers: function() {
            return {
                TYPE: this.collection.queryParams.pid ? 'phase' : 'proposal'
            }
        },

        regions: {
            wrap: '.samples',
        },

        ui: {
            new: 'a.new'
        },
    
        onRender: function() {
            if (this.getOption('hideButton')) this.ui.new.hide()

            this.wrap.show(new TableView({
                tableClass: 'proteins',
                collection: this.collection,
                columns: [
                    { name: 'NAME', label: 'Name', cell: table.TemplateCell, editable: false, template: '<% if (NAME) { %><%-NAME.replace(/__/g, " ") %><% } %>' },
                    { name: 'ACRONYM', label: 'Acronym', cell: 'string', editable: false },
                    { name: 'COMPOSITION', label: 'Composition', cell: CompositionCell, editable: false },
                    { name: 'THEORETICALDENSITY', label: 'Density', cell: 'string', editable: false },
                    { name: 'NPHASES', label: '# Phases', cell: table.TemplateCell, editable: false, template: '<%-((COMPONENTIDS||[]).length+1)%>' },
                    // { label: '', cell: table.TemplateCell, editable: false, renderable: !this.getOption('hideNewInstance'), template: '<a class="button" href="/instances/add/cid/<%-CRYSTALID%>"><i class="fa fa-plus"></i></a>' },
                ],
                backgrid: {
                    row: this.getOption('row'),
                    emptyText: 'No samples found'
                }
            }))
        },
    })

})
