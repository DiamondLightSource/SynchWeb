define(['marionette', 'views/table', 'collections/attachments', 'utils'], function(Marionette, TableView, attachments, utils) {

    
    var OptionsCell = Backgrid.Cell.extend({
        events: {
            'click a.dl': utils.signHandler,
            'click a.rsv': 'closeDialog',
        },

        closeDialog: function() {
            this.model.set('clicked', true)
        },

        render: function() {

            this.$el.append('<a href="'+app.apiurl+'/download/attachment/id/'+this.column.get('id')+'/aid/'+this.model.get('DATACOLLECTIONFILEATTACHMENTID')+'" class="button dl"><i class="fa fa-download"></i> Download</a>')

            if (this.model.get('FILETYPE') == 'recip') {
                this.$el.append('<a href="/dc/rsv/id/'+this.column.get('id')+'" class="button rsv"><i class="fa fa-search"></i> Reciprocal Space Viewer</a>')
            }

            return this
        }
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: '<div><h1>Attachments</h1><p class="help">This page lists all attachments for the selected datacollection</p><div class="wrapper"></div></div>',
        regions: { wrap: '.wrapper' },
    

        initialize: function(options) {
            this.attachments = new attachments()
            this.listenTo(this.attachments, 'change:clicked', this.closeDialog)

            this.attachments.queryParams.id = this.getOption('id')
            this.attachments.fetch()

            var columns = [
                { name: 'FILEFULLPATH', label: 'File', cell: 'string', editable: false },
                { name: 'FILETYPE', label: 'Type', cell: 'string', editable: false },
                { label: '', cell: OptionsCell, editable: false, id: this.getOption('id') },
            ]
                        
            this.table = new TableView({ collection: this.attachments, columns: columns, tableClass: 'attachments', loading: true, backgrid: { emptyText: 'No attachments found', } })
        },

        closeDialog: function() {
            this.trigger('dialog:close')
        },
        

        onRender: function() {
            this.wrap.show(this.table)
        },
          
        onShow: function() {
            this.table.focusSearch()
        },

    })
})