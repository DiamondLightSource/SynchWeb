define([
    'modules/types/gen/dc/dc',
    'modules/types/gen/dc/datplot',
    'modules/dc/views/apstatusitem',
    'modules/dc/views/downstream',
    'utils',
    'templates/types/xpdf/dc/dc.html'], function(DCItemView, DatPlot, APStatusItem, DCDownstreamView, utils, template) {


    return DCItemView.extend({
        template: template,
        plotView: DatPlot,
        apStatusItem: APStatusItem,
        
        events: {
            'click .holder h1.dp': 'loadAP',
            'click .distl': 'showPlot',
            'click .diffraction': 'showDiff',
            'click .atp': 'addToProject',
            'click .flag': 'flag',
            'click .comments': 'showComments',
            'click a.dl': 'showPlot',
            'click a.sn': 'showSnapshots',
            'click a.dd': utils.signHandler,
            'click li.parent': 'toggleNodeShow'
        },

        ui: {
            params: '.params'
        },

        onDomRefresh: function() {
            var params = JSON.parse(this.model.get('SCANPARAMS'))
            if(params != null){
                var output = this.buildScanParams(params, '<ul style="padding-left: 10px">', 0)
                this.ui.params[0].innerHTML = "Scan Params: " + output
            }
        },
        
        showDiff: function(e) {
            e.preventDefault()
            this.$el.find('.diffraction a').eq(0).trigger('click')
        },

        loadAP: function() {
            if (!this.ap) {
              this.ap = new DCDownstreamView({ id: this.model.get('ID'), el: this.$el.find('div.downstream') })
            } else this.ap.$el.slideToggle()
        },

        buildScanParams: function(params, output, level){
            for(var key in params){

                if(typeof params[key] == 'object'){
                    output = output + '<li class=\"parent\" id=\"' + key + '_' + level +  '\" style=\"font-weight:bold\">' + key + '</li>'
                    level++
                    output = output + '<li id=\"' + key + '_' + level + '\" style=\"display:none\"><ul style=\"padding-left: ' + 10*level + 'px\">'
                    output = this.buildScanParams(params[key], output, level)
                    output = output + '</ul></li>'
                    level--
                } else {
                    // position absolute for better formatted wrapped text, though it does break some margin/padding inheritance
                    output = output + '<li><span style=\"font-weight: bold\">' + key + ':</span> <span style=\"position:absolute\">' + params[key] + '</span></li>'
                }
            }
            return output
        },

        toggleNodeShow: function(e){
            var parent = e.target.id
            var level = parent.substring(parent.length-1, parent.length)
            level++

            // Not the Marionette way, but scaling the DOM for dynamically generated content with this.ui.params is more code for little gain
            // TRY this.$el.find('id').css() - Setting properties with this didn't work
            var child = document.getElementById(parent.substring(0, parent.length-1)+level)
            if(child.style.display == 'none'){
                child.style.display = 'inline'
            } else {
                child.style.display = 'none'
            }
        }
    })

})
