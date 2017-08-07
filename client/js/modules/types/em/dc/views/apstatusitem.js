define(['modules/dc/views/apstatusitem'], function(APStatusItem, $) {

    return APStatusItem.extend({
        
        onRender: function() {
            var pcount;
            if ('PARTICLES' in this.model.get('STATES')) {
                var pcount = '('+this.model.get('STATES')['PARTICLES']+') '
            }
          
            this.ui.holder.eq(0).text('Auto Picker '+pcount+this.getIcon('pfinder'))
            this.ui.holder.eq(1).text('2d Class '+this.getIcon('2dclass')+' 3d Class '+this.getIcon('3dclass'))
        },


        getIcon: function(key) {
            var res = this.model.get('STATES')
            var icon;
            if (key in res) {
                if (res[key] == null) icon = '<i class="fa icon grey fa-cog fa-spin alt="Running"></i>'
                if (res[key] == 1) icon = '<i class="fa icon green fa-check alt="Completed"></i>'
                if (res[key] == 0) icon = '<i class="fa icon red fa-times alt="Failed"></i>'

            } else icon = '<i class="fa icon blue fa-question-circle alt="N/A"></i>'

            return icon
        }
    })
       
})