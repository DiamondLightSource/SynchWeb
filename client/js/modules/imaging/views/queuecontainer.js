define(['marionette',
    
    'collections/subsamples',
    'views/table',
    
    'tpl!templates/imaging/queuecontainer.html',
    ], function(Marionette, 
        SubSamples,
        TableView,
        template) {
    

    var LocationCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty()
            var name = this.column.get('type').getName(this.model.get('LOCATION'))
            var drop = this.column.get('type').getDrop(this.model.get('LOCATION'))
            this.$el.html(name+'d'+drop)
            
            this.delegateEvents()
            return this
        }
    })


    var ExpDetailsCell = Backgrid.Cell.extend({
        render: function() {
            this.$el.empty()
            
            var tpl = ''
            var ty = this.model.get('EXPERIMENTKIND')

            if (ty) {
                tpl = 'Exp: <%=EXPOSURETIME%>s, &lambda;: <%=WAVELENGTH%>, dmin: <%=REQUIREDRESOLUTION%>&Ang;, Beam Size: <%=PREFERREDBEAMSIZEX%>x<%=PREFERREDBEAMSIZEY%>&micro;m'
                if (ty == 'MESH') tpl += ', Box Size: <%=BOXSIZEX%>x<%=BOXSIZEY%>&micro;m'
                if (ty == 'OSC') tpl += ', # Img: <%=NUMBEROFIMAGES%>, &Omega;: St <%=AXISSTART%>&deg;, Osc <%=AXISRANGE%>&deg;'
            }

            var temp =  _.template(tpl)
            this.$el.html(temp(this.model.toJSON()))

            this.delegateEvents()
            return this
        }
    })

    var DimmedRow = Backgrid.Row.extend({

        render: function() {
            DimmedRow.__super__.render.call(this)
            if (this.model.get('EXPERIMENTKIND')) this.$el.addClass('active')
            return this
        },

    })

    
        
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        
        regions: {
            smps: '.subsamples',
        },
        
        events: {
            'click button.submit': 'queueContainer',
        },


        queueContainer: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/queue',
                data: {
                    cid: this.model.get('CONTAINERID')
                },
                success: function(resp) {
                    self.model.set('QUEUED', 1)

                    if (self.getOption('dialog')) {
                        app.alert({ message: 'Container Successfully Queued' })
                        if (app.dialog.currentView) app.dialog.currentView.closeDialog()
                    }
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong queuing this container' })
                }
            })
        },
        
        
        initialize: function(options) {
            Backbone.Validation.bind(this);

            this.type = options && options.type

            this.subsamples = new SubSamples()
            this.subsamples.queryParams.cid = this.model.get('CONTAINERID')
            this.subsamples.fetch()
        },
        
        
        onRender: function() {
            var columns = [{ name: 'SAMPLE', label: 'Sample', cell: 'string', editable: false },
                           { label: 'Location', cell: LocationCell, editable: false, type: this.type },
                           { name: 'X', label: 'X', cell: 'string', editable: false },
                           { name: 'Y', label: 'Y', cell: 'string', editable: false },
                           { name: 'EXPERIMENTKIND', label: 'Exp Type', cell: 'string', editable: false },
                           { label: 'Details', cell: ExpDetailsCell, editable: false },
            ]

            if (app.mobile()) {
                _.each([], function(v) {
                    columns[v].renderable = false
                })
            }

            this.table = new TableView({ 
                collection: this.subsamples, 
                columns: columns, 
                tableClass: 'subsamples', 
                loading: true,
                backgrid: { row: DimmedRow, emptyView: 'No sub samples found' },
            })

            this.smps.show(this.table)
        },
        
    })
        
})
