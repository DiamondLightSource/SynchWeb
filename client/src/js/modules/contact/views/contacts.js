define(['marionette', 'views/table', 'utils/table'], function(Marionette, TableView, table) {
    
  var ClickableRow = table.ClickableRow.extend({
    event: 'contact:show',
    argument: 'LABCONTACTID',
  })
    
  return Marionette.LayoutView.extend({
    className: 'content',
    // TODO - move this into its own template file and use a templateHelper CAN_CREATE for consistency with proteins
    template: '<div><h1>Home Lab Contacts</h1><p class="help">This page shows registered home laboratory contacts. This information is generally used to return shipments back after an experiment</p><div class="ra"><a class="button add" href="/contacts/add"><i class="fa fa-plus"></i> Add Home Lab Contact</a></div><div class="wrapper"></div></div>',
    regions: { 'wrap': '.wrapper' },
    ui: {
      add: 'a.add',
    },

    initialize: function(options) {
      var columns = [
        { name: 'CARDNAME', label: 'Card Name', cell: 'string', editable: false },
        { name: 'GIVENNAME', label: 'First Name', cell: 'string', editable: false },
        { name: 'FAMILYNAME', label: 'Surname', cell: 'string', editable: false },
        { name: 'ADDRESS', label: 'Address', cell: 'string', editable: false },
        { name: 'CITY', label: 'City', cell: 'string', editable: false },
        { name: 'POSTCODE', label: 'Postcode', cell: 'string', editable: false },
        { name: 'COUNTRY', label: 'Country', cell: 'string', editable: false },
        { name: 'PHONENUMBER', label: 'Phone No.', cell: 'string', editable: false },
        { name: 'LABNAME', label: 'Laboratory', cell: 'string', editable: false },
      ]
        
      if (app.mobile()) {
        _.each([2,3,4,5,6], function(v) {
            columns[v].renderable = false
        })
      }
        
      this.table = new TableView({ collection: options.collection, columns: columns, tableClass: 'proposals', filter: 's', loading: true, backgrid: { row: ClickableRow, emptyText: 'No contacts found' } })
    },
                                      
    onRender: function() {
      if (app.proposal && app.proposal.get('ACTIVE') != 1) this.ui.add.hide()
      this.wrap.show(this.table)
    },
      
    onShow: function() {
      this.table.focusSearch()
    },
  })

})