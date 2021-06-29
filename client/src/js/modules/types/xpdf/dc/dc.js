define([
    'backbone',
    'modules/types/gen/dc/dc',
    'modules/types/gen/dc/datplot',
    'modules/types/xpdf/dc/views/autointegration',
    'utils',
    'templates/types/xpdf/dc/dc.html'], function(Backbone, DCItemView, DatPlot, DCAutoIntegrationView, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        // imageStatusItem: DCImageStatusItem,
        
        events: {
            'click .holder h1.ap': 'loadAP',
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.dd': utils.signHandler,
            'click a.k8s': 'initiatePod',
            'click a.podReady': 'openPod'
        },

        ui: {
            temp: 'span.temp',
            exp: 'i.expand',
            cc: '.dcc',
            rp: 'a.reprocess',

            launcher: 'a.k8s',
            loader: 'span.podLoader',
            podReady: 'a.podReady'
        },

        // Check if this DC has a MAXIV Viewer pod active for current user
        onRender: function() {
            this.isPodRunning(this)
        },

        onDestroy: function() {
            if (this.getOption('plotView')) this.plotview.destroy()
            if (this.strat) this.strat.destroy()
            if (this.ap) this.ap.destroy()

            this.imagestatus.destroy()
            this.apstatus.destroy()

            clearInterval(this.timer)
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },

        loadAP: function(e) {
            if (!this.ap) {
              this.ap = new DCAutoIntegrationView({ id: this.model.get('ID'), el: this.$el.find('div.autoproc') })
            } else this.ap.$el.slideToggle()
        },

        initiatePod: function(e) {
            e.preventDefault()
            this.ui.launcher.css('display', 'none')
            this.ui.loader.css('display', 'inline')

            let self = this
            Backbone.ajax({
                url: app.apiurl + '/pod/maxiv/hdf5/' + this.model.get('ID'),
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
                    self.ui.loader.css('display', 'none')
                    self.ui.launcher.css('display', 'inline')

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
                    url: app.apiurl + '/pod/maxiv/hdf5/status/' + podId,
                    method: 'get',
                    success: function(response){
                        console.log(response[0])

                        if(response[0].STATUS == 'Running'){
                            self.ui.loader.css('display', 'none')
                            self.ui.podReady.css('display', 'inline')
                            self.ui.podReady.attr('data-podip', response[0].IP)

                            self.podActive = true
                            self.startTimer()
                        } else if (response[0].STATUS == 'Failed') {
                            self.ui.loader.css('display', 'none')
                            self.ui.launcher.css('display', 'inline')
                            app.alert({message: response[0].MESSAGE})
                        } else {
                            count++
                            self.ui.loader[0].childNodes[0].textContent = 'Starting Pod...' + response[0].STATUS + ' '

                            if(count < 10){
                                setTimeout(function(){check(count)}, 1000)
                            }
                            else {
                                self.ui.loader.css('display', 'none')
                                self.ui.launcher.css('display', 'inline')
                                app.alert({message: 'Something got stuck trying to launch your pod, please try again later'})
                            }
                        }
                    },
                    error: function(response){
                        self.ui.loader.css('display', 'none')
                        self.ui.launcher.css('display', 'inline')
                        console.log('error getting pod status: ' + response)
                    }
                })
            }
            check(count)
        },

        openPod: function(e){
            e.preventDefault()
            var ip = this.ui.podReady.attr('data-podip')
            window.open('http://'+ip+':8081')
        },

        startTimer: function(){
            let self = this
            var timer = setInterval(function(){ self.isPodRunning(self) }, 5000)
            this.timer = timer
        },

        isPodRunning: function(self){
            Backbone.ajax({
                url: app.apiurl + '/pod/maxiv/hdf5/running/' + self.model.get('ID'),
                method: 'get',
                data: { user: app.user },
                success: function(response){
                    if(response[0]){
                        // When navigating pages the ui elements may not immediately be available (from onRender)
                        // Check they are available for intended use to avoid errors that hurt performance
                        if(typeof(self.ui.launcher) == 'object'){
                            self.ui.launcher.css('display', 'none')
                            self.ui.podReady.css('display', 'inline')
                            self.ui.podReady.attr('data-podip', response[0].IP)

                            if(!self.podActive){
                                self.podActive = true
                                self.startTimer()
                            }
                        }
                    } else {
                        self.ui.loader.css('display', 'none')
                        self.ui.podReady.css('display', 'none')
                        self.ui.launcher.css('display', 'inline')
                        self.podActive = false
                        clearInterval(self.timer)
                    }
                },
                error: function(response){
                    console.log(response)
                    app.alert({message: 'Failed to get status of pod for data collection: ' + self.model.get('ID')})
                }
            })
        }
    })

})
