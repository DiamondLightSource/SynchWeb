define(['marionette', 'jquery'], function(Marionette, $) {

    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
  
        ui: {
            state: '.state',
        },
    
        initialize: function(options) {
            this.listenTo(options.statuses, 'sync', this.getModel, this)
        },
        
        getModel: function() {
            var m = this.getOption('statuses').findWhere({ ID: this.getOption('ID') })
            if (m != this.model) {
                this.undelegateEvents()
                this.model = m
                this.delegateEvents()
                if (this.model) this.render()
            }
        },
        
        onRender: function() {
            if (this.model.get('INT') == 0) return

            var val = ['<i class="r fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="r fa icon green fa-check alt="Completed"></i>',
                    '<i class="r fa icon red fa-times alt="Failed"></i>']
        
            var stats = ''

            if (this.model.get('INT') == 2) {
              var st = this.model.get('STATS')
              stats = '<ul>'+
                        '<li>R:'+st['R']+'</li>'+
                        '<li>C:'+st['C']+'</li>'+
                        '<li>Res:'+st['RESH']+'</li>'+
                      '</ul>'
            }

           this.ui.state.html(val[(this.model.get('INT') - 1)]+stats)
        }
    })
       
})