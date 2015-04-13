define(['marionette', 'jquery'], function(Marionette, $) {

    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
  
        ui: {
            holder: '.holder h1 span',
            flux: '.flux',
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
        },
        
        onRender: function() {
            var id = this.model.get('ID')
            var res = this.model.get('STATES')
            var dcv = this.model.get('DCV')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']
        
           if (this.getOption('SCREEN')) {
               this.ui.holder.html('Mosflm: ' + val[res[0]] + ' EDNA: ' + val[res[1]])
               
           } else {
               this.ui.holder.eq(0).html('Fast DP: ' + val[res[2]] +
                         ' Xia2: ' + val[res[3]] + ' ' +val[res[4]] + ' ' +val[res[5]])
               this.ui.holder.eq(1).html('Fast EP: ' + val[res[6]] + ' Dimple: ' + val[res[7]])
           }
                
           // Add flux if available
           if (!this.ui.flux.length && dcv['FLUX'] != '0.00e+0' && dcv['FLUX'] != 'N/A') {
              this.$el.find('ul').prepend('<li class="flux">Flux: '+dcv['FLUX']+'</li>')
           }
        }
    })
       
})