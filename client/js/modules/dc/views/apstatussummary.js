define(['marionette', 
    'backgrid', 
    'views/table', 
    'modules/dc/collections/apstatuses', 
    'modules/dc/views/reprocess', 
    'tpl!templates/dc/apstatussummary.html'], 
    function(Marionette, 
        Backgrid, 
        TableView, 
        APStatuses, 
        ReprocessView, 
        template) {

    var APCell = Backgrid.Cell.extend({
        initialize: function(options) {
            APCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change reset', this.render, this)
            this.template = options.column.get('template')
        },
        
        render: function() {
            this.$el.empty();
            
            if (this.model.get('APLOADED') == true) {
                var tmpl = _.template(this.template)
                this.$el.html(tmpl(this.model.toJSON()))
                
            }
            
            this.delegateEvents();
            return this;
        }
    })
    
    var RPCell = APCell.extend({
        events: {
            'click a.reprocess': 'reprocess',
        },
        
        reprocess: function(e) {
            e.preventDefault()
            
            if (app.dialog.currentView instanceof ReprocessView) app.dialog.currentView.collection.add(this.model)
            else app.dialog.show(new ReprocessView({ model: this.model, visit: this.model.get('VISIT') }))
        }

    })
    
    var APItemCell = Backgrid.Cell.extend({
        initialize: function(options) {
            APItemCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change reset', this.render, this)
            this.template = '<i class="fa fa-spin fa-spinner"></i>'
        },
        
        render: function() {
            this.$el.empty();
            
            var id = this.model.get('ID')
            var res = this.model.get('STATES')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']
        
            var label = this.column.get('label')
            this.$el.html(_.template(this.template))
            if (this.model.get('APLOADED') == true) {
               this.$el.html(val[res[label]])
            }
            this.delegateEvents();
            return this;
        }
    })
    
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { wrap: '.wrapper' },
        
        collectionEvents: {
            'update sync reset': 'updateStatus',
        },
        
        initialize: function(options) {
            this.statuses = new APStatuses()
            this.columns = [
                    { name: 'FILETEMPLATETRIM', label: 'Prefix', cell: 'string', editable: false },
                    { label: 'Sample', cell: APCell, template: '<% if (BLSAMPLEID) { %><a href="/samples/sid/<%-BLSAMPLEID%>" class="wrap sample"><%-SAMPLE%></a><% } %>', editable: false },
                    { name: 'ST', label: 'Date', cell: 'string', editable: false },
                    { label: 'Fast DP', cell: APItemCell, editable: false },
                    { label: 'Xia2/3d', cell: APItemCell, editable: false },
                    { label: 'Xia2/3dii', cell: APItemCell, editable: false },
                    { label: 'DIALS', cell: APItemCell, editable: false },
                    { label: 'MultiXia2/XDS', cell: APItemCell, editable: false },
                    { label: 'MultiXia2/DIALS', cell: APItemCell, editable: false },
                    { label: 'autoPROC', cell: APItemCell, editable: false },
                    { label: 'Fast EP', cell: APItemCell, editable: false },
                    { label: 'Big EP/XDS', cell: APItemCell, editable: false },
                    { label: 'Big EP/DIALS', cell: APItemCell, editable: false },
                    { label: 'Dimple', cell: APItemCell, editable: false },
                    { label: 'MrBUMP', cell: APItemCell, editable: false },
                    { label: '', cell: RPCell, template: '<a href="#" class="reprocess button button-notext" title="Reprocess"><i class="fa fa-cog"></i> <span>Reprocess</span></a>', editable: false },
                    { label: '', cell: APCell, template: '<a href="/dc/visit/'+this.model.escape('VISIT')+'/id/<%-ID%>" class="button button-notext dll" title="Open data collection"><i class="fa fa-arrow-right"></i> <span>Open data collection</span></a>', editable: false },
                    ]
        },
         
        updateStatus: function() {
            console.log('updating status')
            var self = this
            this.statuses.fetch({ type: 'POST', data: { ids: this.collection.pluck('ID') } }).done(function() {
                self.collection.each(function(dc) {
                    var s = self.statuses.findWhere({ ID: dc.get('ID') })
                    var st = s.get('STATES')
                    dc.set({ STATES: st,
                             APLOADED: true })
                })
            })
        },
        
        onRender: function() {
            
            this.updateStatus()
            
            this.wrap.show(new TableView({
                collection: this.collection,
                columns: this.columns,
                tableClass: '',
                filter: 's',
                loading: true,
                backgrid: { row: Backgrid.Row,
                            emptyText: 'No data collections found', }
            
            }))
            
        }
    })
})