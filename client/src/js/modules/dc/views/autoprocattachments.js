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

    
    var OptionsCell = Backgrid.Cell.extend({
        events: {
            'click a.dl': utils.signHandler,
            'click a.vaplog': 'showLog',
            'click a.vapplot': 'showPlots',
            'click a.k8s': 'initiatePod',
            'click a.podReady': 'openPod'
        },

        render: function() {
            this.$el.html('<a href="'+app.apiurl+'/download/'+this.column.escape('urlRoot')+'/attachments/'+this.model.escape(this.column.get('idParam'))+'/dl/1" class="button dl"><i class="fa fa-download"></i> Download</a>')

            if (this.model.get('FILETYPE') == 'Log' || this.model.get('FILETYPE') == 'Logfile') {
                this.$el.append('<a class="vaplog button" href="'+app.apiurl+'/download/'+this.column.escape('urlRoot')+'/attachments/'+this.model.escape(this.column.get('idParam'))+'/dl/1"><i class="fa fa-search"></i> View</a>')
            }

            if (this.model.get('FILETYPE') == 'Graph') {
                this.$el.append('<a class="vapplot button" href="#"><i class="fa fa-line-chart"></i> View</a>')
            }

            if(this.model.get('FILETYPE') == 'Result' && this.canUseH5Web(this.model.get('FILENAME'))) {
                this.$el.append('<a href="#" class="button k8s">Launch H5Web Viewer</a>')
                this.$el.append('<span class="podLoader" style="display:none">Starting Pod...<i class="fa icon grey fa-cog fa-spin"></i></span>')
                this.$el.append('<a href="#" class="button podReady" style="display:none">Ready!</a>')
            }

            this.isPodRunning(this)
            this.listenTo(app, 'pod:started', this.podStarted)
            this.listenTo(app, 'pod:shutdown', this.podShutdown)

            return this
        },

        canUseH5Web: function(filename) {
            extensions = ['.nxs', '.h5', '.hdf', '.hdf5', '.ptyr']

            for(var i=0; i<extensions.length; i++){
                if(filename.endsWith(extensions[i]))
                    return true
            }
            return false
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

        // Mostly copied from xpdf dc except ui object to get html elemtns doesn't work here. Used this.$el.find() instead
        initiatePod: function(e) {
            e.preventDefault()
            this.$el.find('.k8s')[0].style.display = 'none'
            this.$el.find('.podLoader')[0].style.display = 'inline'

            let self = this
            Backbone.ajax({
                url: app.apiurl + '/pod/h5web/' + this.model.get('DATACOLLECTIONID'),
                method: 'get',
                data: {
                    user: app.user
                },
                success: function(response){
                    console.log('success: ' + response.podId)
                    self.pollPodStartupStatus(response.podId)
                },
                error: function(response){
                    console.log('error: ' + response)
                    self.$el.find('.podLoader')[0].style.display = 'none'
                    self.$el.find('.k8s')[0].style.display = 'inline'

                    let responseObj
                    let alertMessage = "Failed to spin up pod"

                    try {
                        responseObj = JSON.parse(response.responseText)
                        if('message' in responseObj)
                            alertMessage = alertMessage + ': ' + responseObj.message
                    } catch(e) {
                        console.log('Response was not JSON', e)
                    }

                    app.alert({message: alertMessage})
                }
            })
        },

        pollPodStartupStatus: function(podId){
            let self = this
            var count = 0;
            var check = function(count){
                Backbone.ajax({
                    url: app.apiurl + '/pod/h5web/status/' + podId,
                    method: 'get',
                    success: function(response){
                        console.log(response[0])

                        if(response[0].STATUS == 'Running'){
                            self.$el.find('.podLoader')[0].style.display = 'none'
                            self.$el.find('.podReady')[0].style.display = 'inline'
                            self.$el.find('.podReady')[0].setAttribute('data-podip', response[0].IP)

                            self.podActive = true
                            self.startTimer()
                        } else if (response[0].STATUS == 'Failed') {
                            self.$el.find('.podLoader')[0].style.display = 'none'
                            self.$el.find('.k8s')[0].style.display = 'inline'
                            app.alert({message: response[0].MESSAGE})
                        } else {
                            count++
                            self.$el.find('.podLoader')[0].childNodes[0].textContent = 'Starting Pod...' + response[0].STATUS + ' '

                            if(count < 10){
                                setTimeout(function(){check(count)}, 1000)
                            }
                            else {
                                self.$el.find('.podLoader')[0].style.display = 'none'
                                self.$el.find('.k8s')[0].style.display = 'inline'
                                app.alert({message: 'Something got stuck trying to launch your pod, please try again later'})
                            }
                        }
                    },
                    error: function(response){
                        self.$el.find('.podLoader')[0].style.display = 'none'
                        self.$el.find('.k8s')[0].style.display = 'inline'
                        console.log('error getting pod status: ' + response)
                    }
                })
            }
            check(count)
        },

        openPod: function(e){
            e.preventDefault()
            var ip = this.$el.find('.podReady')[0].getAttribute('data-podip')

            var visit = this.model.get('FILEPATH').match(/[a-z]{2}[0-9]{5}-\d+/)[0]
            var index = this.model.get('FILEPATH').indexOf(visit)
            var path = this.model.get('FILEPATH').substring(index+visit.length+1, this.model.get('FILEPATH').length)

            window.open('http://'+ip+':8089/?file='+ path + '/' + this.model.get('FILENAME'))
        },

        startTimer: function(){
            let self = this
            var timer = setInterval(function(){ self.isPodRunning(self) }, 5000)
            this.timer = timer
        },

        isPodRunning: function(self){
            Backbone.ajax({
                url: app.apiurl + '/pod/h5web/running/' + self.model.get('DATACOLLECTIONID'),
                method: 'get',
                data: { user: app.user },
                success: function(response){
                    if(response[0]){
                        // When navigating pages the ui elements may not immediately be available (from onRender)
                        // Check they are available for intended use to avoid errors that hurt performance
                        if(self.$el.find('.k8s')[0]){
                            self.$el.find('.k8s')[0].style.display = 'none'
                            self.$el.find('.podReady')[0].style.display = 'inline'
                            self.$el.find('.podReady')[0].setAttribute('data-podip', response[0].IP)
                            app.trigger('pod:started', response[0].IP)

                            if(!self.podActive){
                                self.podActive = true
                                self.startTimer()
                            }
                        }
                    } else {
                        if(self.$el.find('.k8s')[0]){
                            self.$el.find('.podLoader')[0].style.display = 'none'
                            self.$el.find('.podReady')[0].style.display = 'none'
                            self.$el.find('.k8s')[0].style.display = 'inline'

                            self.podActive = false
                            clearInterval(self.timer)
                            app.trigger('pod:shutdown')
                        }
                    }
                },
                error: function(response){
                    console.log(response)
                    app.alert({message: 'Failed to get status of pod for data collection: ' + self.model.get('ID')})
                }
            })
        },

        podStarted: function(ip){
            if(this.$el.find('.k8s')[0]){
                this.$el.find('.k8s')[0].style.display = 'none'
                this.$el.find('.podReady')[0].style.display = 'inline'
                this.$el.find('.podReady')[0].setAttribute('data-podip', ip)
            }
        },
        podShutdown: function(){
            if(this.$el.find('.k8s')[0]){
                this.$el.find('.k8s')[0].style.display = 'inline'
                this.$el.find('.podReady')[0].style.display = 'none'
            }
        }
    })

    return Marionette.LayoutView.extend({
        className: 'content',
        template: '<div><h1>Attachments</h1><p class="help">This page lists all attachments for the selected autoprocessing</p><div class="wrapper"></div></div>',
        regions: { wrap: '.wrapper' },
        urlRoot: 'ap',
        idParam: 'AUTOPROCPROGRAMATTACHMENTID',

        initialize: function(options) {
            var columns = [
                { name: 'FILENAME', label: 'File', cell: 'string', editable: false },
                { name: 'FILETYPE', label: 'Type', cell: 'string', editable: false },
                { label: '', cell: OptionsCell, editable: false, urlRoot: this.getOption('urlRoot'), idParam: this.getOption('idParam') },
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

        onRender: function() {
            this.wrap.show(this.table)
        },
          
        onShow: function() {
            this.table.focusSearch()
        },

    })
})