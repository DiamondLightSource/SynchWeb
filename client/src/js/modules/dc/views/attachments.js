define(['marionette', 
    'backgrid',
    'views/table', 
    'collections/attachments', 
    'views/log',
    'views/cloudupload',
    'utils'], 
    function(Marionette, Backgrid, TableView, attachments, LogView, CloudUploadView, utils) {

    
    var OptionsCell = Backgrid.Cell.extend({
        events: {
            'click a.dl': utils.signHandler,
            'click a.rsv': 'closeDialog',
            'click a.vatlog': 'showLog',
            'click a.vatupload': 'showCloudUpload',
        },

        closeDialog: function() {
            this.model.set('clicked', true)
        },

        showLog: function(e) {
            e.preventDefault()
            var url = $(e.target).attr('href')
            var self = this
            utils.sign({
                url: url,
                callback: function(resp) {
                    app.dialog.show(new LogView({ title: self.model.get('FILENAME') + ' Log File', url: url+'?token='+resp.token }))
                }
            })
        },

        showCloudUpload: function(e) {
            e.preventDefault()
            app.dialog.show(new CloudUploadView({ model: this.model, collection: this.model.collection }))
        },

        render: function() {
            // This was using an 'id' passed into the column as the dcid (getOption('id')).
            // However, this is not present when loading attachments from a data collection group
            // Use the value from the queried collection instead
            var dcid = this.model.escape('DATACOLLECTIONID')

            this.$el.append('<a href="'+app.apiurl+'/download/attachment/id/'+dcid+'/aid/'+this.model.escape('DATACOLLECTIONFILEATTACHMENTID')+'" class="button dl"><i class="fa fa-download"></i> Download</a>')

            if (this.model.get('FILETYPE') == 'log') {
                this.$el.append('<a href="'+app.apiurl+'/download/attachment/id/'+dcid+'/aid/'+this.model.escape('DATACOLLECTIONFILEATTACHMENTID')+'" class="button vatlog"><i class="fa fa-search"></i> View</a>')
            }

            if (this.model.get('FILETYPE') == 'recip') {
                this.$el.append('<a href="/dc/rsv/id/'+dcid+'" class="button rsv"><i class="fa fa-search"></i> Reciprocal Space Viewer</a>')
            }

            if (app.options.get('ccp4_cloud_upload_url') && this.model.get('FILETYPE') == 'params') {
                this.$el.append('<a class="vatupload button" href="#"><i class="fa fa-cloud-upload"></i> CCP4 Cloud</a>')
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
            this.attachments.queryParams.dcg = this.getOption('dcg')
            this.attachments.fetch()

            var columns = [
                { name: 'FILEFULLPATH', label: 'File', cell: 'string', editable: false },
                { name: 'FILETYPE', label: 'Type', cell: 'string', editable: false },
                { label: '', cell: OptionsCell, editable: false },
            ]
                        
            this.table = new TableView({ 
                collection: this.attachments, columns: columns, tableClass: 'attachments', loading: true, 
                noPageUrl: true,
                backgrid: { emptyText: 'No attachments found', } })
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
