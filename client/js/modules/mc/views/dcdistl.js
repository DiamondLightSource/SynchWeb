define(['marionette', 
    'modules/dc/collections/autointegrations',

    'modules/dc/views/distl',
    'modules/mc/views/intstatusitem',
    'tpl!templates/mc/datacollection.html',
    ], function(Marionette, AutoIntegrations, DISTLView, IntegrationStatusItem, dctemplate) {


    return Marionette.ItemView.extend({
        template: dctemplate,
        intStatus: true,
        className: 'dc',
        modelEvents: {
            change: 'setSelected',
        },

        ui: {
            cells: '.cells',
        },

        events: {
            'click .cells': 'sendCell',
        },

        sendCell: function(e) {
            if (!this.aps.length) return
            this.trigger('set:cell', this.aps.at(0))
        },


        onShow: function() {
            var w = 0.175*$(window).width()*0.95
            var h = $(window).width() > 1280 ? w : ($(window).width() > 800 ? w*1.3 : (w*1.65))
            $('.distl', this.$el).height(h*($(window).width() > 800 ? 0.4 : 1.2))

            this.plotview = new DISTLView({ selection: true, parent: this.model, el: this.$el.find('.distl') })
            if (this.getOption('intStatus')) this.intstatus = new IntegrationStatusItem({ ID: this.model.get('ID'), statuses: this.getOption('intstatuses'), el: this.$el })
            this.aps = new AutoIntegrations(null, { id: this.model.get('ID') })
            this.listenTo(this.aps, 'sync', this.setCell, this)
            this.aps.fetch()

            this.listenTo(this.plotview, 'plot:select', this.setSelection, this)
            this.listenTo(this.plotview, 'plot:deselect', this.setDeselection, this)
        },


        setCell: function() {
            if (this.aps.length) {
                var e = this.aps.at(0)
                var c = e.get('CELL')
                this.ui.cells.text(c['CELL_A']+','+c['CELL_B']+','+c['CELL_C']+','+c['CELL_AL']+','+c['CELL_BE']+','+c['CELL_GA'])
            } else this.ui.cells.text('N/A')
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