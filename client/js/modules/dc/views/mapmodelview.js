define(['marionette', 'three', 'glmol', 'gzip', 'modules/dc/collections/downstreams', 'modules/dc/collections/dimplepeaks', 'modules/dc/views/dimplepeaktable', 'tpl!templates/dc/mapmodelview.html', 'ms'], function(Marionette, THREE, GLmol, Zlib, DownStreams, DIMPLEPeaks, DIMPLEPeakTable,  template) {

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',
        
        regions: {
            peaks: 'div.peaks',
        },
        
        events: {
            'change @ui.sym': 'symmetryMates',
            'change @ui.chain': 'refreshResidues',
            'change @ui.res': 'gotoResidue',
            'click button[name=next]': 'nextResidue',
            'click button[name=prev]': 'prevResidue',
            'click a.fullscreen': 'requestFullScreen',
        },
        
        ui: {
            glmol: '#glmol01',
            src: '#glmol01_src',
            sym: 'input[name=symmat]',
            status: '.status_bar',
            chain: 'select[name=chain]',
            res: 'select[name=residue]',
            m1: '.maps .m1',
            m2: '.maps .m2',
        },
        
        templateHelpers: function() {
            return {
                VIS_LINK: app.prop+'-'+this.model.get('VN')
            }
        },
        
        
        
        /*
          Download Model
        */
        download: function() {
            console.log('downloading map')
            Backbone.ajax({
                url: app.apiurl+'/download/map/pdb/1/ty/'+this.getOption('ty')+'/id/'+this.model.get('ID'),
                type: 'GET',
                xhr: this.xhrWithStatus.bind(this, 'Downloading Model'),
                success: this.onDownload.bind(this)
            })
        },
        
        onDownload: function(resp) {
            this.ui.src.val(resp);
            this.glmol.loadMolecule();
            this.generateChains()
            this.loadMaps()
        },
        
        
        /*
          Download Maps
        */
        loadMaps: function() {
            var xhr = this.xhrWithStatus('Downloading Map 1')
            var self = this
            
            xhr.onload = function() {
                var gunzip = new Zlib.Gunzip(new Uint8Array(this.response));
                var plain = gunzip.decompress();
                self.parseCCP4(plain.buffer, 0x5555aa, '2fofc', 1.5);
          
                if (self.getOption('ty') == 'dimple' || self.getOption('ty') == 'mrbump') {
                    var xhr2 = self.xhrWithStatus('Downloading Map 2')
                    xhr2.onload = function() {
                        var gunzip = new Zlib.Gunzip(new Uint8Array(this.response));
                        var plain = gunzip.decompress();
                        self.parseCCP4(plain.buffer, 0x33cc33, 'fofc', 2.8);
                        self.parseCCP4(plain.buffer, 0xcc3333, 'fofc', -2.8);
          
                        self.getSymOps(self.onMapsLoaded.bind(self))
                    }
          
                    xhr2.open('GET', app.apiurl+'/download/map/ty/'+self.getOption('ty')+'/id/'+self.model.get('ID')+'/map/2');
                    xhr2.responseType = 'arraybuffer';
                    xhr2.send();
                    
               } else {
                    self.getSymOps(self.onMapsLoaded.bind(self))
               }
            }
          
            xhr.open('GET', app.apiurl+'/download/map/ty/'+this.getOption('ty')+'/id/'+this.model.get('ID'));
            xhr.responseType = 'arraybuffer';
            xhr.send();
        },
        
        
        onMapsLoaded: function() {
            this.glmol.rebuildScene();
            this.glmol.rotationGroup.position.z = -80;
            
            if (this.getOption('ty') == 'dimple') this.loadPeaks()
            else this.gotoResidue()
            
            this.ui.status.hide()
        },
        
        
        /*
         Get Symmetry Operators
        */
        getSymOps: function(callback) {
            var p = this.glmol.protein
            var self = this
            
            Backbone.ajax({
                url: app.apiurl+'/dc/sym',
                data: { a: p.a,
                        b: p.b,
                        c: p.c,
                        al: p.alpha,
                        be: p.beta,
                        ga: p.gamma,
                        sg: p.spacegroup.replace(/\s+/g, '')
                    },
                type: 'GET',
                xhr: function() { return self.xhrWithStatus('Generating Symmetry Mates') },
                
                success:function(ops) {
                    _.each(ops, function(o,m) {
                        if (self.glmol.protein.symMat[m] == undefined) self.glmol.protein.symMat[m] = new THREE.Matrix4().identity();
                        _.each(o, function(e,n) {
                            self.glmol.protein.symMat[m].elements[n]      = e[0]
                            self.glmol.protein.symMat[m].elements[n + 4]  = e[1]
                            self.glmol.protein.symMat[m].elements[n + 8]  = e[2]
                            self.glmol.protein.symMat[m].elements[n + 12] = e[3]
                        })
                    })
                   
                    if (_.isFunction(callback)) callback()
                }
           })

        },
        
        
        symmetryMates: function() {
            this.glmol.rebuildScene()
            this.updateMesh()
            this.glmol.show()
        },
        
        
        /*
          Get chains from PDB file
        */
        generateChains: function() {
            this.chains = {}
            _.each(this.glmol.atoms, function(a,i) {
              if (a) {
                if (a.chain == ' ') a.chain = 'A'
                if (!(a.chain in this.chains)) this.chains[a.chain] = {}
                if (!(a.resi in this.chains[a.chain])) this.chains[a.chain][a.resi] = {name: a.resn, atoms: {}}
                   
                this.chains[a.chain][a.resi].atoms[a.atom] = a
              }
            }, this)

            this.ui.chain.empty()
            _.each(this.chains, function(c,n) {
              $('<option value="'+n+'">'+n+'</option>').appendTo(this.ui.chain)
            }, this)
          
            this.refreshResidues()
        },
        
        
        refreshResidues: function() {
            this.ui.res.empty()
            if (this.ui.chain.val() in this.chains) {
                _.each(this.chains[this.ui.chain.val()], function(r,i) {
                    $('<option value="'+i+'">'+i+' '+r.name+'</option>').appendTo(this.ui.res)
                }, this)
            }
        },
        
        
        /*
         Navigate Residues
        */
        gotoNext: function(prev) {
            var cur = this.ui.res.val()
            var idx = this.ui.res.find('option').index(this.ui.res.find('option[value="'+cur+'"]'))
            var nidx = prev ? (idx - 1) : (idx + 1)
            var val = this.ui.res.find('option').eq(nidx).val()
            this.ui.res.val(val).trigger('change')
        },
        
        nextResidue: function(e) {
            e.preventDefault()
            this.gotoNext()
        },
        
        prevResidue: function(e) {
            e.preventDefault()
            this.gotoNext(1)
        },
        
        gotoResidue: function() {
            if (this.ui.chain.val() in this.chains) {
                var ch = this.chains[this.ui.chain.val()]
                if (this.ui.res.val() in ch) {
                    var res = ch[this.ui.res.val()]
                    
                    if ('CA' in res.atoms) atom = res.atoms['CA']
                    else {
                        _.each(res.atoms, function(a){
                            atom = a
                            return false
                        })
                    }
                    
                    this.glmol.rotationGroup.position.z = -110
                    this.glmol.modelGroup.position.x = -atom.x;
                    this.glmol.modelGroup.position.y = -atom.y;
                    this.glmol.modelGroup.position.z = -atom.z;
                    
                    this.updateMesh();
                    this.glmol.show();
                }
            }
        },
        
        
        /*
         Get Peak List
        */
        loadPeaks: function() {
            var ds = new DownStreams(null, { id: this.model.get('ID') })
            var self = this
            ds.fetch().done(function() {
                var dimple = ds.findWhere({ TYPE: 'Dimple'})
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
            // not sure why coords are inverted?
            this.glmol.modelGroup.position.x = -x
            this.glmol.modelGroup.position.y = -y
            this.glmol.modelGroup.position.z = -z

            this.updateMesh();
            this.glmol.show();
        },
        
        
        /*
         Set map sigma level
        */
        onSlide: function(id, e, ui) {
            if (id == 1) {
                this.mapSigma(0, ui.value)
                this.ui.m1.siblings('span').html(ui.value)
            } else {
                this.mapSigma(1, ui.value)
                this.mapSigma(2, -ui.value)
                this.ui.m2.siblings('span').html(ui.value)
            }
            console.log('slide', arguments)
        },
        
        mapSigma: function(id, sigma) {
            var m = this.glmol.maps[id]
            var abs = m.map_header.AMEAN + sigma * m.map_header.ARMS
            m.mc.generateGeometry(m.mc.cc, m.mc.cr, m.mc.cs, this.getOption('ty') == 'dimple' ? 15 : 50, abs);
        },
        
        
        requestFullScreen: function() {
            var element = this.$el.find('#map_model')[0]
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
            return false
        },
  
        
        defineRepFromController: function() {
            var all = this.getAllAtoms();
            if (this.ty == 'dimple' || this.ty == 'mrbump') {
                this.colorByAtom(all, {});
                var asu = new THREE.Object3D();
                this.drawBondsAsLine(asu, all, this.lineWidth * 2);
                //if (symmat)
                this.drawSymmetryMatesWithTranslation2(this.modelGroup, asu, this.protein.symMat);
                this.modelGroup.add(asu)
            }
            this.drawUnitcell(this.modelGroup);
            
            var nonBonded = this.getNonbonded(all);
            this.drawAsCross(this.modelGroup, nonBonded, 0.3, true);
            
            _.each(this.maps, function(m, i) {
                this.modelGroup.add(m.mesh);
            }, this)
            
            this.slabNear = -8; this.slabFar = 8;
        },
        
        
        updateMesh: function() {
            _.each(this.glmol.maps, function(m,i) {
                var ortho_to_frac = new THREE.Matrix4().getInverse(m.mesh.matrix);
                var center = ortho_to_frac.multiplyVector3(this.glmol.modelGroup.position.clone());
                var mc = m.mc
                
                var geo = mc.generateGeometry(Math.floor(-center.x) - mc.ncstart,
                    Math.floor(-center.y) - mc.nrstart,
                    Math.floor(-center.z) - mc.nsstart, (this.getOption('ty') == 'dimple' || this.getOption('ty') == 'mrbump') ? 15 : 50, mc.isol);
                
                console.log('map', i, center, geo)
            }, this)
        },
        
        /*
          Parse CCP4 Map Format
        */
        parseCCP4: function(data, color, name, sig) {
            var t = new Date();
            var header_int = new Int32Array(data, 0, 56);
            var header_float = new Float32Array(data, 0, 56);
            var map_header = {};
            map_header.NC = header_int[0];
            map_header.NR = header_int[1];
            map_header.NS = header_int[2];
            map_header.NCSTART = header_int[4];
            map_header.NRSTART = header_int[5];
            map_header.NSSTART = header_int[6];
            map_header.NX = header_int[7];
            map_header.NY = header_int[8];
            map_header.NZ = header_int[9];
            map_header.a = header_float[10];
            map_header.b = header_float[11];
            map_header.c = header_float[12];
            map_header.alpha = header_float[13];
            map_header.beta = header_float[14];
            map_header.gamma = header_float[15];
            map_header.MAPC = header_int[16];
            map_header.MAPR = header_int[17];
            map_header.MAPS = header_int[18];
            map_header.ISPG = header_int[22];
            map_header.NSYMBT = header_int[23];
            map_header.AMEAN = header_float[21];
            map_header.ARMS = header_float[54];
            
            var map = {name: name}
            
            map.map_header = map_header;
            map.map_data = new Float32Array(data, 256 * 4 + map_header.NSYMBT, map_header.NC * map_header.NR * map_header.NS);
            
            map.mc = new THREE.MarchingCubes(map.map_data,
                map_header.NC, map_header.NR, map_header.NS,
                map_header.NCSTART, map_header.NRSTART, map_header.NSSTART);
            var geo = map.mc.generateGeometry(0, 0, 0, 0, map_header.AMEAN + (sig ? sig : 1.5) * map_header.ARMS); // dummy
            
            var mesh = new THREE.Line(geo, new THREE.LineBasicMaterial({color: (color ? color : 0x5555AA), linewidth: 1}));
            mesh.type = THREE.LinePieces;
            
            var basis_a = [map_header.a, 0, 0];
            var basis_b = [map_header.b * Math.cos(Math.PI / 180.0 * map_header.gamma),
                map_header.b * Math.sin(Math.PI / 180.0 * map_header.gamma),
                0];
            var basis_c = [map_header.c * Math.cos(Math.PI / 180.0 * map_header.beta),
                map_header.c * (Math.cos(Math.PI / 180.0 * map_header.alpha)
                - Math.cos(Math.PI / 180.0 * map_header.gamma)
                    * Math.cos(Math.PI / 180.0 * map_header.beta))
                / Math.sin(Math.PI / 180.0 * map_header.gamma), 0];
            basis_c[2] = Math.sqrt(map_header.c * map_header.c * Math.sin(Math.PI / 180.0 * map_header.beta)
                * Math.sin(Math.PI / 180.0 * map_header.beta) - basis_c[1] * basis_c[1]);
            
            var basis = [0, basis_a, basis_b, basis_c];
            var nxyz = [0, map_header.NX, map_header.NY, map_header.NZ];
            var mapcrs = [0, map_header.MAPC, map_header.MAPR, map_header.MAPS];
            
            mesh.matrix.set(basis[mapcrs[1]][0] / nxyz[mapcrs[1]], basis[mapcrs[2]][0] / nxyz[mapcrs[2]], basis[mapcrs[3]][0] / nxyz[mapcrs[3]], 0,
            basis[mapcrs[1]][1] / nxyz[mapcrs[1]], basis[mapcrs[2]][1] / nxyz[mapcrs[2]], basis[mapcrs[3]][1] / nxyz[mapcrs[3]], 0,
            basis[mapcrs[1]][2] / nxyz[mapcrs[1]], basis[mapcrs[2]][2] / nxyz[mapcrs[2]], basis[mapcrs[3]][2] / nxyz[mapcrs[3]], 0,
            0, 0, 0, 1);
            
            mesh.matrixAutoUpdate = false;
            
            map.mesh = mesh;
            console.log("Generate map mesh: ", +new Date() - t);
            this.glmol.maps.push(map)
        },
        
        initialize: function(options) {
            this.chains = {}
        },
            
        
        onDomRefresh: function() {
            this.ui.m1.slider({
                step: 0.1,
                value: 1.5,
                min: 0.5,
                max: 3,
                slide: this.onSlide.bind(this, 1)
            })
                
            if (this.getOption('ty') == 'dimple' ||  this.getOption('ty') == 'mrbump') {
                this.ui.m2.slider({
                    step: 0.1,
                    value: 2.8,
                    min: 2,
                    max: 6,
                    slide: this.onSlide.bind(this, 2)
                })
            } else this.ui.m2.parent().hide()
                
                
            this.$el.find('.peaks').hide()
            
            this.ui.glmol.height(600)
                
            this.glmol = new GLmol('glmol01', true);
            this.glmol.repressZoom = true
            this.glmol.maps = []
            this.glmol.ty = this.getOption('ty')
                
            this.glmol.defineRepresentation = this.defineRepFromController
                
            this.glmol.current = 1
                
            var self = this
            this.glmol.translate_callback = function() {
                self.updateMesh()
                self.glmol.show()
            }
                
            this.download()
        },
                
                
        // Not sure what to clean up here...
        onDestroy: function() {
                
        },
        
                
                
        xhrWithStatus: function(title) {
            var xhr = new window.XMLHttpRequest()
            var self = this
            xhr.addEventListener('progress', function(e) {
                self.ui.status.html(title+' '+((e.loaded/e.total)*100).toFixed(0) + '%')
            })
            return xhr
        },
    })
    


})