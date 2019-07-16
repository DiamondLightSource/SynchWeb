define(['marionette',
    'backgrid',
    'views/table',
    'models/datacollection',
    'modules/dc/collections/apstatuses',
    'modules/dc/collections/autointegrations',
    'utils',
    'tpl!templates/dc/summary.html'], 
    function(Marionette, Backgrid, TableView, DataCollection, APStatuses, AutoIntegrations,
        utils,
        template) {

    
    var APDataCollection = DataCollection.extend({
        defaults: {
            APLOADED: false,
        },
    })
    
    
    var APCell = Backgrid.Cell.extend({
        initialize: function(options) {
            APCell.__super__.initialize.call(this,options)
            this.listenTo(this.model, 'change reset', this.render, this)
            this.template = options.column.get('template')
        },
        
        render: function() {
            this.$el.empty();
            
            if (this.model.get('APLOADED') == true && this.model.get('BESTAP')) {
                var b = this.model.get('BESTAP')
                var t = _.template(_.result(this, 'template'))
                this.$el.html(t(b.toJSON()))
                
            } else if (this.model.get('APLOADED') == true) {
                this.$el.html('')
                
            } else {
                this.$el.html('<i class="fa fa-spin fa-spinner"></i>')
            }
            
            
            this.delegateEvents();
            return this;
        }
    })
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            wrap: '.wrapper',
        },

        collectionEvents: {
            'update sync reset': 'updateStatus',
        },
        
        events: {
            'click a[name=update]': 'scoreAPS',
            'click a.dll': utils.signHandler,
        },
        
        ui: {
            rmerge: 'input[name="rmerge"]',
            res: 'input[name="res"]',
            isigi: 'input[name="isigi"]',
            c: 'input[name="comp"]',
            sg: 'input[name="sg"]',
        },
        
        initialize: function(options) {
            this.statuses = new APStatuses()
        },
        
        updateStatus: function() {
            console.log('updating status')
            var self = this
            var deferreds = []
            this.statuses.fetch({ type: 'POST', data: { ids: this.collection.pluck('ID') } }).done(function() {
                self.statuses.each(function(s) {
                    var ai = new AutoIntegrations(null, { id: s.get('ID') })
                    var d = ai.fetch().then(function() {
                        var dc = self.collection.findWhere({ ID: s.get('ID') })
                        dc.set({ AUTOINTEGRATIONS: ai }, { silent: true })
                    })
                    deferreds.push(d)
                })
                
                $.when.apply($, deferreds).then(function() {
                    self.collection.each(function(m) {
                        m.set({ APLOADED: true }, { silent: m.get('AUTOINTEGRATIONS').length ? true: false })
                    })
                    self.scoreAPS()
                })
            })
        },

        
        onRender: function() {
            var columns = [
                { name: 'FILETEMPLATETRIM', label: 'Prefix', cell: 'string', editable: false },
                { name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                { name: 'ST', label: 'Date', cell: 'string', editable: false },
                { name: 'NUMIMG', label: '# Images', cell: 'string', editable: false },
                { name: 'AXISRANGE', label: 'Osc', cell: 'string', editable: false },
                { name: 'EXPOSURETIME', label: 'Exposure', cell: 'string', editable: false },
                { name: 'TRANSMISSION', label: 'Transmission', cell: 'string', editable: false },
                { label: 'Spacegroup', cell: APCell, template: '<%-SG%> <br /><%-TYPE%>', editable: false },
                { label: 'Unit Cell', cell: APCell, template: '<%-CELL.CELL_A%> (<%-CELL.CELL_AL%>)<br /><%-CELL.CELL_B%> (<%-CELL.CELL_BE%>)<br /><%-CELL.CELL_C%> (<%-CELL.CELL_GA%>)', editable: false },
                { label: 'Resolution', cell: APCell, template: '<%-SHELLS.overall.RLOW%> - <%-SHELLS.overall.RHIGH%><br /><%-SHELLS.innerShell.RLOW%> - <%-SHELLS.innerShell.RHIGH%><br /><%-SHELLS.outerShell.RLOW%> - <%-SHELLS.outerShell.RHIGH%>', editable: false },
                { label: 'Rmeas', cell: APCell, template: '<span class="<%-CLASS.RMEAS.overall%>"><%-SHELLS.overall.RMEAS%></span><br /><span class="<%-CLASS.RMEAS.innerShell%>"><%-SHELLS.innerShell.RMEAS%></span><br /><span class="<%-CLASS.RMEAS.outerShell%>"><%-SHELLS.outerShell.RMEAS%></span>', editable: false },
                { label: 'Completeness', cell: APCell, template: '<span class="<%-CLASS.COMPLETENESS.overall%>"><%-SHELLS.overall.COMPLETENESS%></span><br /><span class="<%-CLASS.COMPLETENESS.innerShell%>"><%-SHELLS.innerShell.COMPLETENESS%></span><br /><span class="<%-CLASS.COMPLETENESS.outerShell%>"><%-SHELLS.outerShell.COMPLETENESS%></span>', editable: false },
                { label: '', cell: APCell, template: '<a href="'+app.apiurl+'/download/id/<%-DCID%>/aid/<%-AID%>" class="button button-notext dll" title="Download MTZ file"><i class="fa fa-download"></i> <span>Download MTZ file</span></a>', editable: false },
                
            ]
            
            this.wrap.show(new TableView({
                collection: this.collection,
                columns: columns,
                tableClass: '',
                filter: 's',
                loading: true,
                backgrid: { emptyText: 'No data collections found', }
            
            }))
            
            this.updateStatus()
        },
        
        
        scoreAPS: function(e) {
            if (e) e.preventDefault()
            console.log('scoring')
            
            // metric weights
            var weights = {
                rmerge: this.ui.rmerge.val(),
                res: this.ui.res.val(),
                isigi: this.ui.isigi.val(),
                c: this.ui.c.val(),
                sg: this.ui.sg.is(':checked')
            }
            
            // shell weights - should probably have per shell metric weights...
            var sweights = { overall: 1, innerShell: 0.5, outerShell: 1 }
            
            var max = {res: {}, isig: {}, resm: {}, rdiff: {}}
            _.each(sweights, function(w, sh) {
                max.res[sh] = 0
                max.isig[sh] = 0
                max.resm[sh] = 999
                max.rdiff[sh] = 0
            })
            
            this.collection.each(function(dc) {
                if (dc.get('APLOADED')) {
                    var aps = dc.get('AUTOINTEGRATIONS')
                    aps.each(function(d) {
                        if (d.get('PROCESSINGSTATUS') != 1) return

                        _.each(sweights, function(w, sh) {
                            var s = d.get('SHELLS')[sh]
                            if (parseFloat(s.RHIGH) > max.res[sh]) max.res[sh] = parseFloat(s.RHIGH)
                            if (parseFloat(s.RHIGH) < max.resm[sh]) max.resm[sh] = parseFloat(s.RHIGH)
                            if (parseFloat(s.ISIGI) > max.isig[sh]) max.isig[sh] = parseFloat(s.ISIGI)
                        })
                    })
                    
                    _.each(sweights, function(w, sh) {
                        max.rdiff[sh] = max.res[sh] - max.resm[sh]
                    })
                    
                    var best = null
                    var best_score = 0
                    aps.each(function(d) {
                        if (d.get('PROCESSINGSTATUS') != 1) return

                        var score = 0
                        _.each(sweights, function(w, sh) {
                            var s = d.get('SHELLS')[sh]
                   
                            var res = ((max.res[sh] - parseFloat(s.RHIGH))/max.rdiff[sh])*weights.res
                                var rmerge = (1 - parseFloat(s.RMERGE))*weights.rmerge
                                var isigi = (parseFloat(s.ISIGI)/max.isig[sh])*weights.isigi
                            var comp = (parseFloat(s.COMPLETENESS)/100)*weights.c
                  
                            score += (res + rmerge + isigi + comp) * w
                        })
                           
                        score *= (weights.sg ? (this.ui.sg.val() ? this.ui.sg.val() == d.get('SG').replace(/\s+/g,'') : 1) : 1)
                        
                        //console.log('each ap', score)
                                
                        if (score > best_score) {
                            best_score = score
                            best = d
                        }
                           
                    }, this)

                    //console.log('setting best', best)
                    if (best) dc.set('BESTAP', best)
                }
            }, this)
                                
            return false
        },
    })

})