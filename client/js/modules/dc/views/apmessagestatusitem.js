define(['marionette', 'jquery'], function(Marionette, $) {

    return Marionette.ItemView.extend({
        template: false,
        modelEvents: { 'change': 'render' },
  
        ui: {
            holder: '.message-holder',
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
            console.log('render apmessage', this.model)
            var err = parseInt(this.model.get('ERRORS')) > 0 ? ('<i class="fa fa-exclamation-circle icon red"></i> '+this.model.get('ERRORS')) : ''
            var war = parseInt(this.model.get('WARNINGS')) > 0 ? ('<i class="fa fa-exclamation-triangle icon orange"></i> '+this.model.get('WARNINGS')): ''
            var inf = parseInt(this.model.get('INFOS')) > 0 ? ('<i class="fa fa-info-circle icon green"></i> '+this.model.get('INFOS')): ''
            this.ui.holder.html('<a href="#" class="button messages">'+err+' '+war+' '+inf+'</a>')
        }
    })
       
})
