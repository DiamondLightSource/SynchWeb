define([
    'modules/types/gen/dc/dc',
    'modules/dc/views/downstream',
    'utils',
    'templates/types/spec/dc/dc.html'], function(DCItemView, DCDownstreamView, utils, template) {

    return DCItemView.extend({
        template: template,

        events: {
        	'click .distl': 'showPlot',
            'click a.dl': 'showPlot',
            'click a.dd': utils.signHandler,
            'click .holder h1.dp': 'loadAP',
            'click a.messages': 'showMessages',
        },

        loadAP: function(e) {
            if (!this.ap) {
              this.ap = new DCDownstreamView({ id: this.model.get('ID'), el: this.$el.find('div.downstream') })
            } else this.ap.$el.slideToggle()
        },
    })
})
