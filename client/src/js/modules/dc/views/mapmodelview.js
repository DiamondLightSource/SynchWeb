define(['marionette', 
    'uglymol', 'gzip', 
    'modules/dc/collections/downstreams', 
    'modules/dc/collections/dimplepeaks', 
    'modules/dc/views/dimplepeaktable', 
    'templates/dc/mapmodelview.html'], function(Marionette, Uglymol, zlib,
        DownStreams, DIMPLEPeaks, DIMPLEPeakTable,  template) {

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            peaks: 'div.peaks',
        },
        
        events: {
            'change @ui.res': 'gotoResidue',
        },

        ui: {
            viewer: '#viewer',
            res: 'select[name=residue]',
            hud: '#hud',
        },
        
        
        
        // /*
        //   Download Maps
        // */
        loadMaps: function() {
            var xhr = this.xhrWithStatus('Downloading Map 1')
            var self = this
            
            xhr.onload = function() {
                var gunzip = new zlib.Zlib.Gunzip(new Uint8Array(this.response))
                var plain = gunzip.decompress()
                self.viewer.load_map_from_buffer(plain.buffer, { format: 'ccp4' })
          
                if (self.getOption('ty') == 'dimple' || self.getOption('ty') == 'mrbump') {
                    var xhr2 = self.xhrWithStatus('Downloading Map 2')
                    xhr2.onload = function() {
                        var gunzip = new Zlib.Zlib.Gunzip(new Uint8Array(this.response))
                        var plain = gunzip.decompress()
                        self.viewer.load_map_from_buffer(plain.buffer, { format: 'ccp4', diff_map: true, })
          
                        self.onMapsLoaded()
                    }
          
                    xhr2.open('GET', app.apiurl+'/download/map/ty/'+self.getOption('ty')+'/id/'+self.model.get('ID')+'/map/2')
                    if (app.token) xhr2.setRequestHeader('Authorization','Bearer ' + app.token)
                    xhr2.responseType = 'arraybuffer'
                    xhr2.send()
                    
                } else {
                    self.onMapsLoaded()
                }
            }
          
            if (this.getOption('ty') == 'bigep') {
                var map_url = app.apiurl+'/download/map/ty/'+this.getOption('ty')+
                                         '/dt/'+this.getOption('dt')+'/ppl/'+this.getOption('ppl')+
                                         '/id/'+this.model.get('ID')
            } else {
                var map_url = app.apiurl+'/download/map/ty/'+this.getOption('ty')+'/id/'+this.model.get('ID')
            }
            xhr.open('GET', map_url)
            xhr.responseType = 'arraybuffer'
            if (app.token) xhr.setRequestHeader('Authorization','Bearer ' + app.token)
            xhr.send();
        },
        
        
        onMapsLoaded: function() {
            if (this.getOption('ty') == 'dimple') this.loadPeaks()
            else this.gotoResidue()
            
            this.ui.hud.text('H shows help.')
        },
        


        /*
          Get chains from PDB file
        */
        generateChains: function() {
            var residues = this.viewer.selected.bag.model.get_residues()
            console.log('res', residues)

            this.ui.res.empty()
            _.each(residues, function(r,k) {
              $('<option value="'+k+'">'+k+' '+r[0].resname+'</option>').appendTo(this.ui.res)
            }, this)
    
        },
        
        
        gotoResidue: function(e) {
            var residues = this.viewer.selected.bag.model.get_residues()
            if (this.ui.res.val() in residues) {
                var res = residues[this.ui.res.val()]

                this.viewer.select_atom({ bag: this.viewer.selected.bag, atom: res[0] }, { steps: 10 })
                this.viewer.request_render()
                

                
            }
        },
        
        
        /*
         Get Peak List
        */
        loadPeaks: function() {
            var ds = new DownStreams(null, { id: this.model.get('ID') })
            var self = this
            ds.fetch().done(function() {
                var dimple = ds.findWhere({ TYPE: 'Dimple' })
                var peaks = new DIMPLEPeaks(dimple.get('PKLIST'), { parse: true })
                self.peaktable = new DIMPLEPeakTable({ collection: peaks })
                self.listenTo(self.peaktable, 'peak:show', self.gotoPeak, self)
                self.peaks.show(self.peaktable)
                
                if (peaks.length) self.peaks.$el.show()
                else self.gotoResidue()
            })
        },
        
        gotoPeak: function(x,y,z) {
            console.log('goto peak!', x, y, z)
            this.viewer.camera.zoom = 70
            this.viewer.recenter([x,y,z], [100,0,0], 10)
            this.viewer.request_render()
        },


        loadMapModel: function() {
            if (this.getOption('ty') == 'bigep') {
                var pdb_url = app.apiurl+'/download/map/pdb/1/ty/'+this.getOption('ty')+
                                         '/dt/'+this.getOption('dt')+'/ppl/'+this.getOption('ppl')+
                                         '/id/'+this.model.get('ID')
            } else {
                var pdb_url = app.apiurl+'/download/map/pdb/1/ty/'+this.getOption('ty')+'/id/'+this.model.get('ID')
            }

            this.viewer.load_pdb(pdb_url, null, this.generateChains.bind(this))
            this.loadMaps()
        },


        onDomRefresh: function() {
            this.$el.find('.peaks').hide()
            this.viewer = new Uglymol.Viewer({viewer: 'viewer', hud: 'hud', help: 'help'})
            this.viewer.xhr_headers = { Authorization: 'Bearer ' + app.token }
            this.loadMapModel()
        },
                

                
        xhrWithStatus: function(title) {
            var xhr = new window.XMLHttpRequest()
            var self = this
            xhr.addEventListener('progress', function(e) {
                self.ui.hud.text(title+' '+((e.loaded/e.total)*100).toFixed(0) + '%')
            })
            return xhr
        },
    })
    


})