define(['marionette', 
	'modules/cell/collections/pdbcodes',
	'modules/cell/collections/analysed',

	'modules/cell/models/autoproc',
	'modules/cell/views/autoproc',
	'modules/cell/views/autoproc_years',

    'modules/cell/models/states',
    'modules/cell/views/states',

    'modules/cell/models/beamlines',
    'modules/cell/views/beamlines',

	'views/filter',
	'views/table',
	'utils/table',
	'tpl!templates/cell/pdbs.html',

	], function(Marionette, PDBCodes, Analysed, Autoproc, AutoprocPie, AutoprocBars, States, StatesPie, Beamlines, BeamlineBars, FilterView, TableView, table, template) {
    
    return Marionette.LayoutView.extend({
    	template: template,
    	className: 'content',

    	regions: {
    		ana: '.analysed',
            ty: '.ty',
    	},

    	events: {
    		'click @ui.proc': 'processPDBs',
    		'click @ui.upd': 'updateAPP',
            'change @ui.dist': 'updateDiff',
    	},

    	ui: {
    		tol: 'input[name=tol]',
    		proc: 'a.process',
    		state: '.processing',
    		app: '#aps',
    		apb: '#apstats',
    		dist: 'input[name=dist]',
    		upd: 'a.update',

            sta: '#visit_pie',

            bl: '#pdbs',
            bl2: '#pdbs2',

            cd: '.celldiff',
    	},

        updateDiff: function(e) {
            this.ui.cd.html(Math.sqrt(Math.pow(this.ui.dist.val(), 2)/3).toFixed(2))
            this.autoproc.fetch()
        },

    	updateAPP: function(e) {
    		e.preventDefault()
    		this.autoproc.fetch()
    	},


    	initialize: function(options) {
            this.updateDiff = _.debounce(this.updateDiff, 100)

    		this.analysed = new Analysed()
    		this.analysed.fetch()

            this.types = new FilterView({
                url: false,
                collection: this.analysed,
                name: 't',
                filters: [
                    { id: 'match', name: 'Matched'},
                    { id: 'mismatch', name: 'Mismatch'},
                    { id: 'noresults', name: 'No Results'},
                    { id: 'nomatch', name: 'No Match'},
                ]  
            })

    		var columns = [
                { name: 'CODE', label: 'Code', cell: 'string', editable: false },
                { name: 'PDBDATE', label: 'Release Date', cell: 'string', editable: false },
                { name: 'PDBBEAMLINENAMESTRIPPED', label: 'PDB Bl', cell: 'string', editable: false },
                { name: 'BEAMLINEMATCHTEXT', label: 'Bl Match', cell: 'string', editable: false },
                { name: 'AUTHORMATCHTEXT', label: 'Author Match', cell: 'string', editable: false },
                { label: 'Nearest', cell: table.TemplateCell, editable: false, test: 'BEAMLINENAME', template: '<%=BEAMLINENAME%> (<%=DISTANCE%>)' },
                { name: 'BEAMLINES', label: 'Beamlines', cell: 'string', editable: false },
                { name: 'AUTOPROCCOUNT', label: 'Integrations', cell: 'string', editable: false },
                { name: 'STATUS', label: 'Status', cell: 'string', editable: false },
                { label: '', cell: table.TemplateCell, editable: false, template: '<a href="/cell/pdb/<%=CODE%>" class="button"><i class="fa fa-search"></i></a> <a class="button" href="http://www.rcsb.org/pdb/explore/explore.do?structureId=<%=CODE%>"><i class="fa fa-external-link"></i></a>' },
            ]
            
            if (app.mobile()) {
                _.each([3,4,5,6,8], function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.anatable = new TableView({ collection: this.analysed, columns: columns, tableClass: 'analysed', filter: 's', noPageUrl: true, noSearchUrl: true, loading: true, backgrid: { emptyText: 'No analysed PDBs found' } })

            var self = this
			this.autoproc = new Autoproc()
			this.autoproc.dist = function() {
				return self.ui.dist.val()
			}

            this.states = new States()
            this.states.fetch()

            this.beamlines = new Beamlines()
            this.beamlines.fetch()
    	},


    	onRender: function() {
    		this.ana.show(this.anatable)
            this.ty.show(this.types)

			this.updateDiff()
    		this.app = new AutoprocPie({ model: this.autoproc, el: this.ui.app })
    		this.apb = new AutoprocBars({ model: this.autoproc, el: this.ui.apb })

            this.sta = new StatesPie({ model: this.states, el: this.ui.sta })

            this.bls = new BeamlineBars({ model: this.beamlines, el: this.ui.bl, second: true })
            this.bls2 = new BeamlineBars({ model: this.beamlines, el: this.ui.bl2 })
    	},


    	processPDBs: function(e) {
    		e.preventDefault()

			this.ui.proc.hide()
    		this.counts = { success: 0, fail: 0 }
    	
		    var query = '<orgPdbQuery>'+
		        '<queryType>org.pdb.query.simple.XrayDiffrnSourceQuery</queryType>'+
		        '<description>Diamond</description>'+
		        '<diffrn_source.pdbx_synchrotron_site.comparator>contains</diffrn_source.pdbx_synchrotron_site.comparator>'+
		        '<diffrn_source.pdbx_synchrotron_site.value>DIAMOND</diffrn_source.pdbx_synchrotron_site.value>'+
		        '</orgPdbQuery>'
		  
		    Backbone.ajax({
		        url: 'http://www.rcsb.org/pdb/rest/search/',
		        data: query,
		        type: 'POST',
		        success: this.getProcessedPDBs.bind(this)
		    })
    	},

    	getProcessedPDBs: function(pdbs) {
    		this.pdbs = pdbs.split('\n')
    		this.processed = new PDBCodes()
    		this.processed.fetch({
    			success: this.doProcessPDBs.bind(this)
    		})
    	},

    	doProcessPDBs: function() {
    		this.toprocess = _.difference(this.pdbs, this.processed.pluck('CODE')).reverse().slice(1)
    		console.log(this.toprocess.length, this.pdbs.length, this.toprocess[0])
    		this.processPDB(0)
    	},

    	processPDB: function(id) {
    		if (id > this.toprocess.length) {
    			this.ui.proc.show()
    			return
    		}

			this.ui.state.html(id+'/'+this.toprocess.length+' PDB files processed, '+this.counts.success+' successful, '+this.counts.fail+' failures')

    		var p = this.toprocess[id]
    		var self = this

    		Backbone.ajax({
            	url: 'http://www.rcsb.org/pdb/rest/customReport?pdbids='+p+'&customReportColumns=structureTitle,unitCellAngleAlpha,unitCellAngleBeta,unitCellAngleGamma,lengthOfUnitCellLatticeA,lengthOfUnitCellLatticeB,lengthOfUnitCellLatticeC,structureAuthor,citationAuthor,diffractionSource,resolution,releaseDate',
	            type: 'GET',
	            dataType: 'xml',
	            timeout: 5000,
	            success: function(xml){
	                var data = { pdb: p }
	                $(xml).find('record').each(function(i,r) {
	                    _.each({ a: 'lengthOfUnitCellLatticeA',
	                            b: 'lengthOfUnitCellLatticeB',
	                            c: 'lengthOfUnitCellLatticeC',
	                            al: 'unitCellAngleAlpha',
	                            be: 'unitCellAngleBeta',
	                            ga: 'unitCellAngleGamma',
	                           }, function(v, k) {
	                        data[k] = $(r).find('dimStructure\\.'+v).text()
	                    })
	                            
	                    data['title'] = $(r).find('dimStructure\\.structureTitle').text()
	                                           
	                    // add 25% tolerance on resolution limit
	                    data['res'] = $(r).find('dimStructure\\.resolution').text()*1.25
	                                 
	                    if ($(r).find('dimStructure\\.diffractionSource').text() != 'null') data['bl'] = $(r).find('dimStructure\\.diffractionSource').text()
	                    if ($(r).find('dimStructure\\.structureAuthor').text() != 'null') data['author'] = $(r).find('dimStructure\\.structureAuthor').text()
	                    data['year'] = $(r).find('dimStructure\\.releaseDate').text()
	                })
	               
	                Backbone.ajax({
	                    url: app.apiurl+'/cell/process',
	                    type: 'POST',
	                    data: data,
	                    success: function(json){
	                       self.counts.success++
	                       self.processPDB(id+1)
	                    },
	                    error: function(xhr, status, error) {
	                        console.log(xhr, status, error)
	                        self.counts.fail++
	                        self.processPDB(id+1)
	                    }
	                })
	            }
	        })


    	},

    })

})
