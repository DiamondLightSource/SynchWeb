define(['marionette',
    'collections/datacollections',
    'collections/samples',
    'views/dialog',
    'views/table',
    'utils/table',
    'backbone.paginator',
    'tpl!templates/dc/queuebuilder.html',
    'tpl!templates/dc/queue.xml',
    'jquery-ui',
    ], function(Marionette, DataCollections, Samples, DialogView, TableView, table, PagableCollection, template, queuexml) {
        
      
    var DC = Backbone.Model.extend({
        initialize: function(attrs, options) {
            this.on('change', this.addDist.bind(this))
            this.addDist()
        },
        
        defaults: {
            COMMENTS: '',
        },
        
        addDist: function() {
            //console.log('init dc', this)
            //this.set({ DISTANCE: 0 }, { silent: true })
            
            this.set({ DELTA: this.get('OVERLAP') != 0 ? (parseFloat(this.get('AXISRANGE'))-parseFloat(this.get('OVERLAP'))): 0}, { silent: true })
            this.set({ AP: null }, { silent: true })
            /*_.each(this.apertures, function(v,k) {
                if (this.get('COMMENTS').indexOf(k) > -1) {
                    this.set({ AP: v }, { silent: true })
                }
            }, this)*/
        },
        
        /*
        apertures: {
            'Aperture: Large':'LARGE_APERTURE',
            'Aperture: Medium':'MEDIUM_APERTURE',
            'Aperture: Small':'SMALL_APERTURE',
            'Aperture: 10':'In_10',
            'Aperture: 20':'In_20',
            'Aperture: 30':'In_30',
            'Aperture: 50':'In_50',
            'Aperture: 70': 'In_70'
        }*/
    })
        
    var DataCollectionQueue = PagableCollection.extend({
        model: DC,
        mode: 'client',
        state: {
            pageSize: 10
        },
    })
        
        
    var StatusCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty();
            
            var st = ''
            _.each(['R', 'SC', 'AI', 'DC', 'AP'], function(t) {
                if (this.model.get(t) > 0) st = '<li class="'+t+'"></li>'
            }, this)
            
            if (st) this.$el.append('<ul class="status">'+st+'</ul>')
            
            return this;
        }
    })
        
        
    var QueueCell = Backgrid.Cell.extend({
        events: {
            'click a': 'queueSample',
        },
        
        initialize: function(options) {
            //console.log(this.model, options)
            this.listenTo(this.model, 'queue:remove', this.render, this)
            QueueCell.__super__.initialize.call(this, options)
        },
        
        queueSample: function(e) {
            e.preventDefault()
            var dc = this.dc()
            
            if (dc) {
                dc.collection.remove(dc)
                this.render()
                
            } else {
                var self = this
                this.last = new DataCollections(null, { running: false, queryParams: { t: 'dc', sid: this.model.get('BLSAMPLEID') } })
                
                this.last.fetch().done(this.addToQueue.bind(this))
            }
        },
            
        addToQueue: function() {
            var data = {
                BLSAMPLEID: this.model.get('BLSAMPLEID'),
                ACRONYM: this.model.get('ACRONYM'),
                SAMPLE: this.model.get('NAME'),
                CPOS: this.model.get('SCLOCATION'),
                SPOS: this.model.get('LOCATION'),
            }
            var last = this.last.at(0) ? this.last.at(0).toJSON() : {}

            this.column.get('queue').add(new DC(_.extend({}, last, data)))
            this.render()
        },
        
        render: function() {
            //console.log('render cell', this.dc())
            this.$el.empty()
            this.$el.append('<a href="#" class="button '+(this.dc() ? 'button-highlight' : '')+'"><i class="fa fa-'+(this.dc() ? 'times':'plus')+'"></i></a>')
            
            return this
        },
        
        dc: function() {
            return this.column.get('queue').findWhere({ BLSAMPLEID: this.model.get('BLSAMPLEID') })
        },
    })
    
        
    var RemoveCell = Backgrid.Cell.extend({
        events: {
            'click a': 'removeSample',
        },

        removeSample: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
            this.model.trigger('queue:remove')
        },
        
        render: function() {
            this.$el.empty()
            this.$el.append('<a href="#" class="button"><i class="fa fa-times"></i></a>')
            
            return this
        },
    })
        
        
    var InputCell = Backgrid.Cell.extend({
        events: {
            'keyup input': 'updateModel',
            'blur input': 'updateModel',
        },
        
        updateModel: function() {
            var d = {}
            d[this.column.get('name')] = this.$el.find('input').val()
            this.model.set(d, { silent: true })
        },
        
        render: function() {
            this.$el.empty()
            this.$el.append('<input type="text" name="'+this.column.get('name')+'" value="'+this.model.get(this.column.get('name'))+'" />')
            
            return this
        },
    })
    
        
    return Marionette.LayoutView.extend({
        title: 'Build GDA Queue',
        template: template,
        className: 'content',
    
        regions: {
            smps: '.smpls',
            que: '.queue',
        },
        
        templateHelpers: function() {
            return {
                BL: this.getOption('bl'),
                VISIT: this.getOption('visit')
            }
        },
        
        events: {
            'dragstart .drag': 'doDrag',
        },
        
        doDrag: function(e) {
            e.originalEvent.dataTransfer.effectAllowed='move';
            e.originalEvent.dataTransfer.setData('text', this.generateXML());
            //console.log('drag',e)
        },
        
        initialize: function(options) {
            this.path = '/dls/'+this.getOption('bl')+'/data/'+new Date().getFullYear()+'/'+this.getOption('visit')
            this.dcs = options.dcs
            
            this.collection = new Samples(null, { state: { pageSize: 10 }, queryParams: { visit: options.visit } })
            this.listenTo(this.collection, 'change', this.drawStatus, this)
            var self = this
            this.collection.fetch()
            
            this.queue = new DataCollectionQueue()
            
            var columns = [
                { name: 'NAME', label: 'Name', cell: 'string', editable: false },
                { name: 'ACRONYM', label: 'Protein', cell: 'string', editable: false },
                { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: false },
                { label: 'Container', cell: table.TemplateCell, template: '<%-CONTAINER%> <%-LOCATION%>', editable: false },
                { label: 'Snapshot', cell: table.TemplateCell, test: 'DCID', editable: false, template: '<img class="img" src="'+app.apiurl+'/image/id/<%-DCID%>" /> <img class="img" src="'+app.apiurl+'/image/n/2/id/<%-DCID%>" />' },
                { name: 'SC', label: '# Screens', cell: 'string', editable: false },
                { name: 'SCRESOLUTION', label: 'Res', cell: 'string', editable: false },
                { name: 'DC', label: '# DCs', cell: 'string', editable: false },
                { name: 'DCRESOLUTION', label: 'Res', cell: 'string', editable: false },
                { label: 'Status', cell: StatusCell, editable: false },
                { label: '', cell: QueueCell, queue: this.queue, editable: false },
            ]
            
            if (app.mobile()) {
                _.each([], function(v) {
                    columns[v].renderable = false
                })
            }
            
            this.table = new TableView({ collection: this.collection, columns: columns, tableClass: 'samples', filter: 'sSearch', loading: true, backgrid: { emptyText: 'No samples assigned' } })
            
            
            var columns = [
                { name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                { name: 'ACRONYM', label: 'Protein', cell: 'string', editable: false },
                //{ name: 'DIR', label: 'Directory', cell: 'string', editable: false },
                //{ name: 'IMP', label: 'Prefix', cell: 'string', editable: false },
                { name: 'AXISSTART', label: 'Start', cell: 'string', editable: false },
                { name: 'AXISRANGE', label: 'Osc', cell: 'string', editable: false },
                { name: 'DELTA', label: 'Delta', cell: 'string', editable: false },
                { name: 'NUMIMG', label: '# Images', cell: 'string', editable: false },
                { name: 'EXPOSURETIME', label: 'Exposure', cell: 'string', editable: false },
                { name: 'TRANSMISSION', label: 'Transmission', cell: 'string', editable: false },
                { name: 'WAVELENGTH', label: 'Wavelength', cell: 'string', editable: false },
                { name: 'RESOLUTION', label: 'Resolution', cell: 'string', editable: false },
                { label: '', cell: RemoveCell, editable: false },
            ]
            
            this.queuetable = new TableView({ collection: this.queue, columns: columns, tableClass: 'queue', backgrid: { emptyText: 'No samples queued' } })
        },
        

        onRender: function() {
            this.smps.show(this.table)
            this.que.show(this.queuetable)
        },
        

        
        // Create xml for gda
        generateXML: function() {
            var rows = this.queue.map(function(m) {
                m.set('VISITPATH', this.path)
                return queuexml(m.toJSON())
            }, this).join('')
            
            return '<?xml version="1.0" ?><ExtendedCollectRequests><usingDna>false</usingDna>'+rows+'</ExtendedCollectRequests>'
        },

        
    })


})