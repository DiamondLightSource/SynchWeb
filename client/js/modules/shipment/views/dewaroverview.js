define(['marionette', 
  'backgrid',
  'views/table', 'views/filter', 
  'collections/bls', 'modules/shipment/collections/dhl-tracking', 
  'tpl!templates/shipment/dewaroverview.html',
  'jquery', 'jquery-ui'], 
  function(Marionette, Backgrid, TableView, FilterView, Beamlines, DHLTracking,
    template, $) {
    
  var TrackingCell = Backgrid.Cell.extend({
      render: function() {
          this.$el.empty();
        
          var $el = this.$el 
          // this.model.get('DELIVERYAGENT_AGENTNAME') &&this.model.get('DELIVERYAGENT_AGENTNAME').toLowerCase() == 'dhl'
          if (this.model.get('TRACKINGNUMBERTOSYNCHROTRON') && this.model.get('TRACKINGNUMBERTOSYNCHROTRON').length <= 10) {
              $el.html('<i class="fa fa-spin fa-cog"></i>')
              var dhl = new DHLTracking(null, { queryParams: { DEWARID: this.model.get('DEWARID'), prop: this.model.get('PROP') } })
              dhl.fetch({
                  success: function() {
                      var last = dhl.last()
                      $el.text(last.get('STATE')+': '+last.get('LOCATION'))
                  },

                  error: function() {
                      $el.empty()
                  }
              })
          }
          
          return this;
      }
    })

    
    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },
        onClick: function() {
            app.cookie(this.model.get('PROP'))
            app.trigger('shipment:show', this.model.get('SHIPPINGID'))
        },
    })
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: template,
        regions: { wrap: '.wrapper', type: '.bl', img: '.img' },
        
        ui: {
            fe: 'input[name=firstexperiment]'
        },

        events: {
            'change @ui.fe': 'updateDate'
        },

        templateHelpers: function() {
            return {
                can: app.user_can
            }
        },

        updateDate: function() {
            this.collection.queryParams.firstexperimentdate = this.ui.fe.val() ? this.ui.fe.val() : null
            this.collection.fetch()
        },

        initialize: function(options) {
            this.beamlines = new Beamlines(null, { ty: app.type })
            this.ready = this.beamlines.fetch()

            var columns = [{ name: 'FIRSTEXPERIMENTST', label: 'Start Date', cell: 'string', editable: false },
                           { name: 'FIRSTEXPERIMENT', label: 'Visit', cell: 'string', editable: false },
                           { name: 'BEAMLINENAME', label: 'Beamline', cell: 'string', editable: false },
                           { name: 'LOCALCONTACT', label: 'Local Contact', cell: 'string', editable: false },
                           { name: 'SHIPPINGNAME', label: 'Shipment', cell: 'string', editable: false },
                           { name: 'CODE', label: 'Dewar Name', cell: 'string', editable: false },
                           { name: 'FACILITYCODE', label: 'Dewar Code', cell: 'string', editable: false },
                           { name: 'CONTAINERS', label: 'Containers', cell: 'string', editable: false },
                           { name: 'DELIVERYAGENT_AGENTNAME', label: 'Courier', cell: 'string', editable: false },
                           { name: 'TRACKINGNUMBERTOSYNCHROTRON', label: 'Track # to', cell: 'string', editable: false },
                           { name: 'DEWARSTATUS', label: 'Status', cell: 'string', editable: false },
                           { name: 'STORAGELOCATION', label: 'Location', cell: 'string', editable: false },
                           { label: 'Tracking', cell: TrackingCell, editable: false }]
                          
            this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'dewars', filter: 's', search: options.params.s, loading: true, backgrid: { row: ClickableRow, emptyText: 'No dewars found', } })
        },
                                          
        onRender: function() {
            this.wrap.show(this.table)
            $.when(this.ready).done(this.showFilter.bind(this))
            this.ui.fe.datepicker({ dateFormat: "dd-mm-yy" })
        },

        showFilter: function() {
            this.ty = new FilterView({
                url: false,
                collection: this.collection,
                name: 'bl',
                filters: this.beamlines.map(function(b) { return { id: b.get('BEAMLINE'), name: b.get('BEAMLINE') } }),
            })
            this.type.show(this.ty)

            this.ty2 = new FilterView({
                url: false,
                collection: this.collection,
                name: 'requestedimager',
                filters: [{ id: '1', name: 'Imager Requested'}],
            })
            this.img.show(this.ty2)
        },
          
        onShow: function() {
            this.table.focusSearch()
        },
        
    })

})