define(['modules/dc/views/apstatusitem'], function(APStatusItem) {

    return APStatusItem.extend({
        onRender: function() {
            var res = this.model.get('STATES')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']

            _.each(['autoproc','downstream'], function(ty, id) {
                this.ui.holder.eq(id).empty()
                _.each(res[ty], function(ap, n) {
                    if(ap != 0)
                        this.ui.holder.eq(id).append(n+' '+val[ap]+' ')
                }, this)
            }, this)
        },
    })
       
})