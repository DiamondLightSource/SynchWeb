define(['marionette', 'backbone',
        'utils/editable',
        'collections/visits',
        'modules/proposal/visit_list',
        'utils/table',
        'templates/admin/proposalview.html'
    ], function(Marionette, Backbone, Editable,
        Visits, VisitsList, table, template) {

    var ClickableRow = table.ClickableRow.extend({
        event: 'visit:show',
        argument: 'VISIT',
    })

    var LinksCell = table.TemplateCell.extend({
        template: '',
    })

    // var EditVisitsList = VisitsList.extend({ 
    //     clickableRow: ClickableRow, 
    //     linksCell: LinksCell,
    //     showTitle: false,
    // })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,

        regions: {
            rvisits: '.rvisits'
        },

        initialize: function(options) {
            this.visits = new Visits()
            this.visits.queryParams.prop = this.model.get('PROPOSAL')
            this.visits.fetch()
        },

        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('PROPOSALCODE', 'text')
            edit.create('PROPOSALNUMBER', 'text')
            edit.create('TITLE', 'text')
            edit.create('STATE', 'select', { data: { Open: 'Open', Closed: 'Closed' } })

            this.rvisits.show(new EditVisitsList({ params: {}, collection: this.visits }))
        }

    })

})
