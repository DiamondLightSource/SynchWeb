define(['marionette', 'jquery'], function(Marionette, $) {

    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
  
        ui: {
            holder: '.holder h1 span',
        },
    
        initialize: function(options) {
            this.listenTo(options.statuses, 'sync', this.getModel, this)
        },
        
        getModel: function() {
            var m = this.getOption('statuses').findWhere({ ID: this.getOption('ID') })
            if (m != this.model) {
                //console.log('old', this.model, 'new', m)
                this.undelegateEvents()
                this.model = m
                this.delegateEvents()
                if (this.model) this.render()
            }
            this.trigger('model:change')
        },

        getStatus: function(options) {
            var res = this.model.get('STATES')
            if (options.type in res) {
                return res[options.type]
            }
        },
        
        onRender: function() {
            this.trigger('status')

            var id = this.model.get('ID')
            var res = this.model.get('STATES')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']

            if (this.getOption('XRC')) {
                this.ui.holder.html('Xray Centring: ' + val[res['XrayCentring']])

            } else if (this.getOption('SCREEN')) {
                this.ui.holder.empty()
                _.each(res['screening'], function(sc, n) {
                    this.ui.holder.append(n+': '+val[sc]+' ')
                }, this)
               
            } else {
                _.each(['autoproc','downstream'], function(ty, id) {
                    this.ui.holder.eq(id).empty()
                    _.each(res[ty], function(ap, n) {
                        this.ui.holder.eq(id).append(n+': '+val[ap]+' ')
                    }, this)
                }, this)
            }
        }
    })
       
})
