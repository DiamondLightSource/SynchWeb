define(['modules/dc/views/apstatusitem'], function(APStatusItem) {

    return APStatusItem.extend({
        
        onRender: function() {
            var ps = []
            _.each({'Motion Correction': 'MC', 'CTF': 'CTF'}, function(p,n) {
                var tys = []

                var cts = _.countBy(Object.values(this.model.get(p)), function(v) { return v })
                _.each({
                    null: '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    1: '<i class="fa icon green fa-check alt="Completed"></i>',
                    0: '<i class="fa icon red fa-times alt="Failed"></i>'
                }, function(icon, state) {
                    if (cts[state]) tys.push(cts[state]+' '+icon)
                }, this)
                

                ps.push('<span>'+n+': '+(tys.length ? tys.join(' ') : '<i class="fa icon blue fa-question-circle alt="N/A"></i>')+'</span>')
            }, this)
          
            this.ui.holder.eq(0).html(ps.join(' '))
            
        },

    })
       
})