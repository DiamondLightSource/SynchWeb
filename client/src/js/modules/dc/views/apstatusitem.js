define(['marionette', 'jquery'], function(Marionette, $) {

    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
  
        ui: {
            holder: '.holder h1 span',
            xrc: '.holder h1.xrc span',
            strat: '.holder h1.strat span',
            ap: '.holder h1.ap span',
            dp: '.holder h1.dp span',
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
                this.ui.xrc.html('Xray Centring: ' + val[res['XrayCentring']])

            } else if (this.getOption('SCREEN') != 0) {
                this.ui.strat.empty()
                _.each(res['screening'], function(sc, n) {
                    this.ui.strat.append(n+': '+val[sc]+' ')
                }, this)
               
            } else {
                _.each({ap: 'autoproc',dp: 'downstream'}, function(ty, id) {
                    this.ui[id].empty()
                    var allResults = []
                    if (res[ty]) {
                        _.each(res[ty], function(ap, n) {
                            var ress = {}
                            _.each(ap, function(a) {
                                if (!(a in ress)) ress[a] = 0
                                ress[a]++
                            })
                            allResults.push(n+': '+_.map(ress, function(c, st) { return c > 1 ? '<span class="count">'+c+'x</span> '+val[st] : val[st]}).join(' '))
                        }, this)

                        this.ui[id].append(allResults.join('<span class="separator">|</span>'))
                    } else {
                        this.ui[id].append('No processing results')
                    }
                }, this)
            }
        }
    })
       
})
