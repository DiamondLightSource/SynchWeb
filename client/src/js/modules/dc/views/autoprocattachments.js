define(['marionette', 
    'backbone',
    'backgrid',
    'modules/dc/views/aiplots',
    'modules/dc/views/vue-plotly',
    'views/log',
    'views/table', 'utils'], 
    function(Marionette, Backbone, Backgrid, 
    AIPlotsView, PlotlyPlotView, LogView,
    TableView, utils) {

    // string for comparison with filepaths. Pulled from config to share across optionsCells.
    var persistentStorageSegment = undefined; 
    
    var OptionsCell = Backgrid.Cell.extend({
        events: {
            'click a.dl': utils.signHandler,
            'click a.vaplog': 'showLog',
            'click a.vapplot': 'showPlots',
        },

        render: function() {

            // Passed into the column from the layout below.
            var iCatUrl = this.column.escape('iCatUrl');
            var dcPurged = this.column.escape('dcPurgedProcessedData');

            // Files with persistentStorageSegment in their path are assumed to exist permanently and ignore the BLSESSION purged value
            var isPersistentFile = this.doesFilepathContainPersistentStorageSegment(this.model.get('FILEPATH'));

            if (!isPersistentFile && dcPurged !== "0") {
                // if the iCatURL is present, this file has been removed from store but may be available in iCat/Archive. ELSE likley an industry proposal so no iCat link provided.
                iCatUrl 
                    ? this.$el.html('<a class="button" href=' + iCatUrl +' target="_blank">iCat link</a>') 
                    : this.$el.html('<div>Removed</div>')
            }
            else {

                this.$el.html('<a href="'+app.apiurl+'/download/'+this.column.escape('urlRoot')+'/attachments/'+this.model.escape(this.column.get('idParam'))+'/dl/2" class="button dl"><i class="fa fa-download"></i> Download</a>')

                if (this.model.get('FILETYPE') == 'Log' || this.model.get('FILETYPE') == 'Logfile') {
                    this.$el.append('<a class="vaplog button" href="'+app.apiurl+'/download/'+this.column.escape('urlRoot')+'/attachments/'+this.model.escape(this.column.get('idParam'))+'/dl/1"><i class="fa fa-search"></i> View</a>')
                }

                if (this.model.get('FILETYPE') == 'Graph') {
                    this.$el.append('<a class="vapplot button" href="#"><i class="fa fa-line-chart"></i> View</a>')
                }
            }


            return this
        },

        doesFilepathContainPersistentStorageSegment: (filePath) => persistentStorageSegment ? filePath.includes(persistentStorageSegment) :  false,

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
        template: '<div><h1>Attachments</h1><p class="help">This page lists all attachments for the selected autoprocessing</p><p style="padding: 0.2rem"><b>Note: Removed Attachments (non-industrial) may be reached via the iCat Link.</b></p><div class="wrapper"></div></div>',
        regions: { wrap: '.wrapper' },
        urlRoot: 'ap',
        idParam: 'AUTOPROCPROGRAMATTACHMENTID',

        initialize: function(options) {
            persistentStorageSegment = app.options.get('visit_persist_storage_dir_segment');

            var proposalID = app.prop;
            var iCatProposalRootURL = this.getICatProposalRootUrl(proposalID);

            var columns = [
                { name: 'FILENAME', label: 'File', cell: 'string', editable: false },
                { name: 'FILETYPE', label: 'Type', cell: 'string', editable: false },
                { 
                    label: '', 
                    cell: OptionsCell, 
                    editable: false, 
                    urlRoot: this.getOption('urlRoot'), 
                    idParam: this.getOption('idParam'), 
                    dcPurgedProcessedData: options.dcPurgedProcessedData, 
                    iCatUrl: iCatProposalRootURL
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
         * @summary Use the icat_base_url to create a link to the proposal Root.
         * @see config.php & index.php
         * We're just passing in the iCat project Root URL for each but this could be further extended within each OptionsCell if we want to target a specifc visit etc.
         * @returns {URL | undefined} undefined if baseUrl not set OR if proposal begins with "in" | "sw".
         */
        getICatProposalRootUrl: function(proposalID) {
            // define prefixes that should skip the iCat link creation. Use Uppercase form.
            var denyIcatPrefixes = ["IN"];

            var proposalIdUppercase = proposalID.toUpperCase();
            var propsalPrefix = proposalIdUppercase.slice(0,2)
            var iCatBaseURl = app.options.get("icat_base_url");
            
            return proposalIdUppercase && iCatBaseURl && !denyIcatPrefixes.includes(propsalPrefix)
                ? new URL("browse/proposal/" + proposalIdUppercase + "/investigation" , iCatBaseURl)
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
