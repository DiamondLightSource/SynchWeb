define([
    'backbone',
    'modules/types/gen/dc/dc',
    'modules/types/gen/dc/datplot',
    'modules/dc/views/apstatusitem',
    'modules/dc/views/downstream',
    'utils',
    'templates/types/xpdf/dc/dc.html'], function(Backbone, DCItemView, DatPlot, APStatusItem, DCDownstreamView, utils, template) {
    //'templates/types/xpdf/dc/dc.html'], function(Backbone, DCItemView, DatPlot, DCAutoIntegrationView, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        apStatusItem: APStatusItem,
        
        events: {
            'click .holder h1.dp': 'loadAP',
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.dd': utils.signHandler,
            'click li.parent': 'toggleNodeShow',
            'click a.k8s': 'initiatePod',
            'click a.podReady': 'openPod'
        },

        ui: {
            temp: 'span.temp',
            exp: 'i.expand',
            cc: '.dcc',
            rp: 'a.reprocess',

            params: '.params',

            launcher: 'a.k8s',
            loader: 'span.podLoader',
            podReady: 'a.podReady'
        },

        onDomRefresh: function() {
            var params = JSON.parse(this.model.get('SCANPARAMS'))
            if(params != null){
                var output = this.buildScanParams(params, '<ul style="padding-left: 10px">', 0)
                this.ui.params[0].innerHTML = "Scan Params: " + output
            }
            
        },

        // Check if this DC has a H5Web Viewer pod active for current user
        onRender: function() {
            this.isPodRunning(this)
            this.listenTo(app, 'pod:started', this.podStarted)
            this.listenTo(app, 'pod:shutdown', this.podShutdown)
        },

        onDestroy: function() {
            if (this.getOption('plotView')) this.plotview.destroy()
            if (this.strat) this.strat.destroy()
            if (this.ap) this.ap.destroy()

            this.imagestatus.destroy()
            this.apstatus.destroy()

            clearInterval(this.timer)
        },

        // Check if this DC has a H5Web Viewer pod active for current user
        onRender: function() {
            this.isPodRunning(this)
            this.listenTo(app, 'pod:started', this.podStarted)
            this.listenTo(app, 'pod:shutdown', this.podShutdown)
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

        loadAP: function() {
            if (!this.ap) {
              this.ap = new DCDownstreamView({ id: this.model.get('ID'), el: this.$el.find('div.downstream') })
            } else this.ap.$el.slideToggle()
        },

        buildScanParams: function(params, output, level){
            for(var key in params){

                if(typeof params[key] == 'object'){
                    output = output + '<li class=\"parent\" id=\"' + key + '_' + level +  '\" style=\"font-weight:bold\">' + key + '</li>'
                    level++
                    output = output + '<li id=\"' + key + '_' + level + '\" style=\"display:none\"><ul style=\"padding-left: ' + 10*level + 'px\">'
                    output = this.buildScanParams(params[key], output, level)
                    output = output + '</ul></li>'
                    level--
                } else {
                    // position absolute for better formatted wrapped text, though it does break some margin/padding inheritance
                    output = output + '<li><span style=\"font-weight: bold\">' + key + ':</span> <span style=\"position:absolute\">' + params[key] + '</span></li>'
                }
            }
            return output
        },

        toggleNodeShow: function(e){
            var parent = e.target.id
            var level = parent.substring(parent.length-1, parent.length)
            level++

            // Not the Marionette way, but scaling the DOM for dynamically generated content with this.ui.params is more code for little gain
            // TRY this.$el.find('id').css() - Setting properties with this didn't work
            var child = document.getElementById(parent.substring(0, parent.length-1)+level)
            if(child.style.display == 'none'){
                child.style.display = 'inline'
            } else {
                child.style.display = 'none'
            }
        },
        
        initiatePod: function(e) {
            e.preventDefault()
            this.ui.launcher.css('display', 'none')
            this.ui.loader.css('display', 'inline')

            let self = this
            Backbone.ajax({
                url: app.apiurl + '/pod/h5web/' + this.model.get('ID'),
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
                    url: app.apiurl + '/pod/h5web/status/' + podId,
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

            var visit = this.model.get('DIRFULL').match(/[a-z]{2}[0-9]{5}-\d+/)[0]
            var index = this.model.get('DIRFULL').indexOf(visit)
            var path = this.model.get('DIRFULL').substring(index+visit.length+1, this.model.get('DIRFULL').length)

            if(path)
                window.open('http://'+ip+':8089/?file=' + path + '/' + this.model.get('FILETEMPLATE'))
            else
                window.open('http://'+ip+':8089/?file=' + this.model.get('FILETEMPLATE'))
        },

        startTimer: function(){
            let self = this
            var timer = setInterval(function(){ self.isPodRunning(self) }, 5000)
            this.timer = timer
        },

        isPodRunning: function(self){
            Backbone.ajax({
                url: app.apiurl + '/pod/h5web/running/' + self.model.get('ID'),
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
                            app.trigger('pod:started', response[0].IP)

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
                        app.trigger('pod:shutdown')
                    }
                },
                error: function(response){
                    console.log(response)
                    app.alert({message: 'Failed to get status of pod for data collection: ' + self.model.get('ID')})
                }
            })
        },

        podStarted: function(ip){
            this.ui.launcher.css('display', 'none')
            this.ui.podReady.css('display', 'inline')
            this.ui.podReady.attr('data-podip', ip)
        },
        podShutdown: function(){
            this.ui.launcher.css('display', 'inline')
            this.ui.podReady.css('display', 'none')
        }
    })

})
