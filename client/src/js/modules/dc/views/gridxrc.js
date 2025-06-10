define(['marionette',
    'modules/dc/collections/gridxrc',
    'views/table',
    'utils/table'], function(Marionette, GridXRC, TableView, table) {

    var linkIfSample = function(data) {
        if (data.BLSAMPLEID) {
            return '<a href="/samples/sid/'+data.BLSAMPLEID+'"><i class="fa fa-search"></i> '+data.NAME+'</a>'
        } else {
            return ''
        }
    }

    return Marionette.LayoutView.extend({
        template: _.template('<div class="summary"></div>'),
        regions: {
            summary: '.summary',
        },

        initialize: function(options) {
            this.collection = new GridXRC({ id: options.id })
            this.collection.fetch().done(this.render.bind(this))
        },

        onRender: function() {
            this.summary.show(new TableView({
                className: 'ui-tabs-panel',
                noTableHolder: true,
                collection: this.collection,
                columns: [
                    { label: 'Sample', cell: table.TemplateCell, template: d=>linkIfSample(d), editable: false },
                    { name: 'METHOD', label: 'Method', cell: 'string', editable: false },
                    { name: 'TOTALCOUNT', label: 'Strength', cell: 'string', editable: false },
                    { name: 'X', label: 'Pos X (Boxes)', cell: 'string', editable: false },
                    { name: 'Y', label: 'Pos Y (Boxes)', cell: 'string', editable: false },
                    { name: 'Z', label: 'Pos Z (Boxes)', cell: 'string', editable: false },
                    { name: 'SIZEX', label: 'Size X (Boxes)', cell: 'string', editable: false },
                    { name: 'SIZEY', label: 'Size Y (Boxes)', cell: 'string', editable: false },
                    { name: 'SIZEZ', label: 'Size Z (Boxes)', cell: 'string', editable: false },
                ],
                pages: false,
                backgrid: {
                    emptyText: 'No xray centring results available for this data collection',
                },
            }))
        },
    })

})
