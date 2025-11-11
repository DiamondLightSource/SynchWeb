define(['marionette', 
    'modules/dc/collections/autointegrations',

    'modules/dc/views/distl',
    'templates/mc/datacollection.html',
    ], function(Marionette, AutoIntegrations, DISTLView, dctemplate) {


    return Marionette.ItemView.extend({
        template: dctemplate,
        className: 'dc',
        modelEvents: {
            change: 'setSelected',
        },

        ui: {
            cells: '.cells',
        },

        events: {
            'click .cells': 'sendCell',
            'click .all': 'selectAll',
        },

        sendCell: function(e) {
            if (!this.aps.length) return
            this.trigger('set:cell', this.aps.at(0))
        },

        selectAll: function(e) {
            e.preventDefault()

            var si = parseInt(this.model.get('SI'))
            var ni = parseInt(this.model.get('NUMIMG'))

            this.setSelection(si, si+ni-1)
            this.plotview.setSelection(si, si+ni-1)
        },


        onShow: function() {
            var w = 0.175*$(window).width()*0.95
            var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
            $('.distl', this.$el).height(h*($(window).width() > 800 ? 0.4 : 1.2))

            this.plotview = new DISTLView({ selection: true, parent: this.model, el: this.$el.find('.distl') })
            this.aps = new AutoIntegrations(null, { id: this.model.get('ID') })
            this.listenTo(this.aps, 'sync', this.setCell, this)
            this.aps.fetch()

            this.listenTo(this.plotview, 'plot:select', this.setSelection, this)
            this.listenTo(this.plotview, 'plot:deselect', this.setDeselection, this)
        },


        setCell: function() {
            let cells = 'N/A'
            if (this.aps.length) {
                var e = this.aps.at(0)
                var c = e.get('CELL')
                if (c && Object.keys(c).length) cells = c['CELL_A']+','+c['CELL_B']+','+c['CELL_C']+','+c['CELL_AL']+','+c['CELL_BE']+','+c['CELL_GA']
            }
            this.ui.cells.text(cells)
        },


        setSelected: function() {
            if (this.model.get('selected')) this.$el.addClass('selected')
            else this.$el.removeClass('selected')
        },

        setSelection: function(x1, x2) {
            this.model.set('selected', true)
            this.model.set('selection', [x1,x2])
            console.log('sel from distl', x1, x2)
        },

        setDeselection: function(e) {
            this.model.set('selected', false)
            this.model.set('selection', [])  
            console.log('desel from distl')
        },

        onDestroy: function() {
            this.plotview.destroy()
        },
    })



})
