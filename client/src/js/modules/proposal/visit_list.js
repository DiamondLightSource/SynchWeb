// define(['marionette', 'backgrid', 'views/table', 'collections/visits', 'utils/table',
//     'utils',
//     'templates/proposal/visitlinks.html',
//     'templates/types/saxs/proposal/visitlinks.html',
    
//     ], function(Marionette, Backgrid, TableView, Visits, table, utils, visitlinks, saxsvisitlinks) {


//     var ClickableRow = table.ClickableRow.extend({
//         event: 'dclist:show',
//         argument: 'VISIT',
//     })
    

//     var LinksCell = table.TemplateCell.extend({
//         events: {
//             'click a.dll': utils.signHandler,
//         },

//         getTemplate: function() {
//             return this.model.get('TYPE') == 'saxs' ? saxsvisitlinks : visitlinks
//         }
//     })

//     var ArchivedCell = Backgrid.Cell.extend({
//         render: function() {
//             this.$el.empty()
//             if (this.model.get('ARCHIVED') == '1') this.$el.html('<i class="fa fa-archive r" title="This visit is archived, data is no longer avaialble on disk"></i>')
//             return this
//         }
//     })

       
//   return Marionette.LayoutView.extend({
//     linksTemplate: visitlinks,
//     linksCell: LinksCell,
//     clickable: true,
//     clickableRow: ClickableRow,
//     showTitle: true,
      
//     className: 'content',
//     template: _.template('<% if (showTitle) { %><h1>Visit List</h1><% } %><p class="help">This page lists the visits available to the currently selected proposal</p><div class="wrapper"></div>'),
//     regions: { 'wrap': '.wrapper' },

//     templateHelpers: function() {
//       return {
//           showTitle: this.getOption('showTitle')
//       }
//     },

//     initialize: function(options) {
//       var columns = [{ name: 'ST', label: 'Start', cell: 'string', editable: false },
//                      { name: 'EN', label: 'End', cell: 'string', editable: false },
//                      { name: 'VIS', label: 'Number', cell: 'string', editable: false },
//                      { name: 'BL', label: 'Beamline', cell: 'string', editable: false },
//                      { name: 'LC', label: 'Local Contact', cell: 'string', editable: false },
//                      { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: true },
//                      { name: 'DCCOUNT', label: 'Data Collections', cell: 'string', editable: false },
//                      { name: 'SESSIONTYPE', label: 'Type', cell: 'string', editable: false },
//                      { name: 'LINKS', label: '', cell: this.getOption('linksCell'), template: this.getOption('linksTemplate'), test: 'DCCOUNT', editable: false },
//                      { name: 'ARCHIVED', label: '', cell: ArchivedCell, editable: false }]
        
//       if (app.mobile()) {
//         console.log('mobile!')
//         _.each([1,4,5,6], function(v) {
//             columns[v].renderable = false
//         })
//       }
        
//       var bgopts = { emptyText: 'No visits found' }
//       if (this.getOption('clickable')) bgopts.row = this.getOption('clickableRow')

//       this.listenTo(this.collection, 'change:COMMENTS', this.saveComment, this)

//       this.table = new TableView({ collection: options.collection, columns: columns, filter: 's', search: options.params.s, tableClass: 'proposals', loading: true, backgrid: bgopts })
//     },
      

//     saveComment: function(m, v) {
//       console.log('model changed', arguments)
//       m.save(m.changedAttributes(), { patch: true })
//     },

//     onRender: function() {
//       this.wrap.show(this.table)
//     }
//   })
       
// })