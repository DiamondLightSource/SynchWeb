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
            this.trigger('status')

            var id = this.model.get('ID')
            var res = this.model.get('STATES')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']
        
           if (this.getOption('SCREEN')) {
               this.ui.holder.html('Mosflm: ' + val[res['Mosflm']] + ' EDNA: ' + val[res['EDNA']])
               
           } else {
               this.ui.holder.eq(0).html('Fast DP: ' + val[res['Fast DP']] +
                         ' Xia2: ' + val[res['Xia2/3d']] + ' ' +val[res['Xia2/3dii']] + ' ' +val[res['DIALS']] +
                         ' MultiXia2: ' + val[res['MultiXia2/XDS']] + ' ' +val[res['MultiXia2/DIALS']] +
                         ' autoPROC: ' + val[res['autoPROC']])
               this.ui.holder.eq(1).html( 'Fast EP: ' + val[res['Fast EP']] +
                                         ' Big EP: ' + val[res['Big EP/XDS']] + ' '+ val[res['Big EP/DIALS']] +
                                         ' Dimple: ' + val[res['Dimple']] +
                                         ' MrBUMP: ' + val[res['MrBUMP']])
           }
        }
    })
       
})
