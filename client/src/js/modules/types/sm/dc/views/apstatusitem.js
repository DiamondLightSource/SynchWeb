define(['modules/dc/views/apstatusitem'], function(APStatusItem) {

    return APStatusItem.extend({
        onRender: function() {
            var res = this.model.get('STATES')
            
            var val = ['<i class="fa icon blue fa-question-circle alt="N/A"></i>',
                    '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>',
                    '<i class="fa icon green fa-check alt="Completed"></i>',
                    '<i class="fa icon red fa-times alt="Failed"></i>']

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
        },
    })
       
})
