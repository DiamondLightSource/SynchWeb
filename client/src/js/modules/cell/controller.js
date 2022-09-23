define(['marionette',
        'modules/cell/views/search',

], function(Marionette, CellSearchView) {
    var controller = {
        search_cell: function(a,b,c,al,be,ga, pdb, page) {
            page = page ? parseInt(page) : 1
            app.content.show(new CellSearchView({ pdb: pdb, cell: { a: a, b :b, c: c, al: al,be: be, ga: ga }, page: page }))
            app.bc.reset([{ title: 'Unit Cell Search' }])
        },

        search: function(page) {
            controller.search_cell(null,null,null,null,null,null,null,page)
        }
    }
    
    return controller
})