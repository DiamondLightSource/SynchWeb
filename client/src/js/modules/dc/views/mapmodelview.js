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
        
        
        /*
          Download Maps
        */
        loadMaps: function() {
            this.mapsToLoad = this.downstream.get('FEATURES').MAPMODEL[1];
            this.mapsLoaded = 0
            this.doLoadMaps(1, this.onMapsLoaded.bind(this))
        },
        

        doLoadMaps: function(id, cb) {
            var self = this
            var xhr = this.xhrWithStatus('Downloading Map '+id)
            xhr.onload = function() {
                if (xhr.status == 0 || xhr.status != 200) {
                    this.onerror(xhr.status)

                } else {
                    var gunzip = new zlib.Zlib.Gunzip(new Uint8Array(this.response))
                    var plain = gunzip.decompress()
                    self.viewer.load_map_from_buffer(plain.buffer, { format: 'ccp4' })
                }
                
                self.mapsLoaded++
                if (self.mapsLoaded < self.mapsToLoad) {
                    setTimeout(function() {
                        self.doLoadMaps(++id, cb)
                    }, 500)
                    
                } else {
                    setTimeout(cb, 500)
                }
            }

            xhr.onerror = function(status) {
                self.ui.hud.text('Error loading map ' + id + ' Status: ' + status)
            }

            var map_url = app.apiurl+'/processing/downstream/mapmodel/'+this.getOption('aid') + '?map='+id+'&prop='+ app.prop
            xhr.open('GET', map_url)
            xhr.responseType = 'arraybuffer'
            if (app.token) xhr.setRequestHeader('Authorization','Bearer ' + app.token)
            xhr.send();
        },

        
        onMapsLoaded: function() {
            this.loadPeaks()
            this.ui.hud.text('H shows help.')
        },
        


        /*
          Get chains from PDB file
        */
        generateChains: function() {
            var residues = this.viewer.selected.bag.model.get_residues()
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
            if (this.downstream.get('PKLIST')) {
                var peaks = new DIMPLEPeaks(this.downstream.get('PKLIST'), { parse: true })
                this.peaktable = new DIMPLEPeakTable({ collection: peaks })
                this.listenTo(this.peaktable, 'peak:show', this.gotoPeak, this)
                this.peaks.show(this.peaktable)
                
                if (peaks.length) this.peaks.$el.show()
                else this.gotoResidue()
            } else {
                this.gotoResidue()
            }
        },
        
        gotoPeak: function(x,y,z) {
            console.log('goto peak!', x, y, z)
            this.viewer.camera.zoom = 70
            this.viewer.recenter([x,y,z], [100,0,0], 10)
            this.viewer.request_render()
        },


        loadDownStream: function() {
            downstreams = new DownStreams(null, { id: this.model.get('ID') })
            var self = this
            downstreams.fetch().done(function() {
                self.downstream = downstreams.findWhere({ AID: self.getOption('aid') })
                self.loadMapModel()
            })
        },

        loadMapModel: function() {
            var pdb_url = app.apiurl+'/processing/downstream/mapmodel/'+this.getOption('aid')+'?prop='+app.prop
            this.viewer.load_pdb(pdb_url, null, this.generateChains.bind(this))
            this.loadMaps()
        },


        onDomRefresh: function() {
            this.$el.find('.peaks').hide()
            this.viewer = new Uglymol.Viewer({viewer: 'viewer', hud: 'hud', help: 'help'})
            this.viewer.xhr_headers = { Authorization: 'Bearer ' + app.token }
            this.loadDownStream()
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