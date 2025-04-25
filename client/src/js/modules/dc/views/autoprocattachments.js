define(['marionette', 
    'backbone',
    'backgrid',
    'modules/dc/views/aiplots',
    'modules/dc/views/vue-plotly',
    'views/log',
    'views/cloudupload',
    'views/table', 'utils'], 
    function(Marionette, Backbone, Backgrid, 
    AIPlotsView, PlotlyPlotView, LogView, CloudUploadView,
    TableView, utils) {

    // string for comparison with filepaths. Pulled from config to share across optionsCells.
    var persistentStorageSegment = undefined; 

    var OptionsCell = Backgrid.Cell.extend({
        events: {
            'click a.dl': utils.signHandler,
            'click a.vaplog': 'showLog',
            'click a.vapplot': 'showPlots',
            'click a.vapupload': 'showCloudUpload',
        },

        render: function() {

            // Passed into the column from the layout.
            var iCatBaseUrl = this.column.escape('iCatUrl');
            var isIndustry = this.column.escape('isIndustryProposal').toLowerCase() === 'true';
            var isPurgedSession = this.column.escape('isPurgedSession').toLowerCase() === 'true';

            // Files with "visit_persist_storage_dir_segment" (config.php) in their path are assumed to exist permanently and ignore the BLSESSION purged value
            var isPersistentFile = persistentStorageSegment ? this.model.get('FILEPATH').includes(persistentStorageSegment) :  false;
            
            if (isPersistentFile == true | isPurgedSession == false) {

                var baseDownloadUrl = `${app.apiurl}/download/${this.column.escape('urlRoot')}/attachments/${this.model.escape(this.column.get('idParam'))}`
                
                // Default behaviour for download btn
                this.$el.html(`<a href="${baseDownloadUrl}/dl/2" class="button dl"><i class="fa fa-download"/> Download</a>`)

                // Additional btns per filetype
                switch (this.model.get('FILETYPE')) {
                    case 'Log':
                    case 'Logfile':
                        this.$el.append(`<a class="vaplog button" href="${baseDownloadUrl}/dl/1"> <i class="fa fa-search"/> View </a>`);
                        break;

                    case 'Graph':
                        this.$el.append('<a class="vapplot button" href="#"><i class="fa fa-line-chart"/> View</a>');
                        break;

                    case 'Result':
                        if (app.options.get('ccp4_cloud_upload_url')) {
                            this.$el.append('<a class="vapupload button" href="#"><i class="fa fa-cloud-upload"/> CCP4 Cloud</a>');
                        }
                        break;
                
                    default:
                        break;
                }
            }
            else {
                if (isPurgedSession == true) {
                    // Append for ANY assets of purged industrial proposals
                    if (isIndustry == true) { this.$el.html('<div>Deleted</div>') }
                    else {
                        // if !industrial Proposal && iCatURL is present in config, this file has been removed from store but may be available in iCat/Archive.
                        iCatBaseUrl !== ""
                            ? this.$el.html('<a class="button" href=' + iCatBaseUrl +' target="_blank"><i class="fa fa-external-link"/> iCat</a>') 
                            : this.$el.html('<div>iCatURL missing</div>')
                    }
                }
                
                // non purged session. This should be caught in the main if block!
            }

            return this
        },
        
        showCloudUpload: function(e) {
            e.preventDefault()
            app.dialog.show(new CloudUploadView({ model: this.model, collection: this.model.collection }))
        },

        showPlots: function(e) {
            e.preventDefault()

            // This entire solution is ugly...
            // We have to make a call to get the plot attachments so we can find out whether they are ploty files or not
            // This all will be made again by aiplots.js if it's not a plotly file :(
            this.appaid = this.model.get('AUTOPROCPROGRAMATTACHMENTID')

            let self = this

            Backbone.ajax({
                url: app.apiurl + '/download/plots',
                method: 'get',
                data: {
                    id: self.model.get('DATACOLLECTIONID'),
                    aid: self.model.get('AUTOPROCPROGRAMATTACHMENTID')
                },
                success: function(response){
                    var item

                    for(var i=0; i<response.length; i++){
                        if(response[i]['AUTOPROCPROGRAMATTACHMENTID'] == self.appaid){
                            item = response[i]
                        }
                    }

                    if(item['PLOTLY'] == true){
                        app.dialog.show(new DialogView({title: 'Plotly Chart', view: new PlotlyPlotView({data: item['PLOTS']}), autoSize: true}))
                    } else {
                        app.dialog.show(new DialogView({ title: 'Integration Statistic Plots', view: new AIPlotsView({ aid: self.model.get('AUTOPROCPROGRAMID'), id: self.model.get('DATACOLLECTIONID') }), autoSize: true }))
                    }
                },
                error: function(response){
                    console.log(response)
                }
            })
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
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: '<div><h1>Attachments</h1><p class="help">This page lists all attachments for the selected autoprocessing</p><div class="wrapper"></div></div>',
        regions: { wrap: '.wrapper' },
        urlRoot: 'ap',
        idParam: 'AUTOPROCPROGRAMATTACHMENTID',

        getTemplate: function(){
            // override the template, only show purgeMessage for purged, non-industrial proposals.
            var purgeMessage = (this.isPurgedSession == true && this.isIndustry == false) 
                ? `<p style="padding: 0.2rem"><b>Archived attachments can be retrieved from iCat.</b></p>`
                : "";

            return `<div><h1>Attachments</h1><p class="help">This page lists all attachments for the selected autoprocessing</p>${purgeMessage}<div class="wrapper"/></div>`;
        },

        initialize: function(options) {
            persistentStorageSegment = app.options.get('visit_persist_storage_dir_segment');

            var proposalID = app.prop;
            var iCatProposalRootURL = this.getICatProposalRootUrl(proposalID);

            this.isIndustry = this.hasIndustryPrefix(proposalID); // ! FIXME: Naive check.
            this.isPurgedSession = options.dcPurgedProcessedData !== "0";

            var columns = [
                { name: 'FILENAME', label: 'File', cell: 'string', editable: false },
                { name: 'FILETYPE', label: 'Type', cell: 'string', editable: false },
                { 
                    label: '', 
                    cell: OptionsCell, 
                    editable: false, 
                    urlRoot: this.getOption('urlRoot'), 
                    idParam: this.getOption('idParam'), 
                    isPurgedSession: this.isPurgedSession,
                    isIndustryProposal: this.isIndustry,
                    iCatUrl: iCatProposalRootURL,
                },
            ]
                        
            this.table = new TableView({ 
                collection: this.collection, 
                columns: columns, 
                tableClass: 'attachments', 
                loading: true, 
                noPageUrl: true,
                backgrid: { emptyText: 'No attachments found', } 
            })
        },

        /**
         * Naieve check wether this proposalID starts with ["in"].
         * @param {string} proposalID 
         * @returns {boolean}
         */
        hasIndustryPrefix: (proposalID) => ["in"].includes(proposalID.slice(0,2)),

        /**
         * @summary Use the icat_base_url to create a link to the proposal Root.
         * @see config.php & index.php
         * We're just passing in the iCat project Root URL for each but this could be further extended within each OptionsCell if we want to target a specifc visit etc.
         * @returns {URL | undefined} undefined if baseUrl not set OR if proposal begins with "in" | "sw".
         */
        getICatProposalRootUrl: function(proposalID) {
            var iCatBaseURl = app.options.get("icat_base_url");
            if (!iCatBaseURl) console.warn("'icat_base_url' has not been configured for purged attachments. @see config.php")

            return iCatBaseURl
                ? new URL("browse/proposal/" + proposalID.toUpperCase() + "/investigation" , iCatBaseURl)
                : undefined;
        },


        onRender: function() {
            this.wrap.show(this.table)
        },
          
        onShow: function() {
            this.table.focusSearch()
        },

    })
})
