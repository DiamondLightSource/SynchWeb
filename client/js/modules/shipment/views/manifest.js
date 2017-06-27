define(['marionette', 
  'utils'], 
    function(Marionette, utils) {
    
    return Marionette.LayoutView.extend({
        className: 'content',
        template: _.template('<h1>Shipping Manifest</h1><select name="month"></select><a href="'+app.apiurl+'/pdf/manifest" class="button manifest"><i class="fa fa-print"></i> Print Shipping Manifest</a>'),
        regions: { wrap: '.wrapper', type: '.bl', img: '.img' },
        
        events: {
            'click a.manifest': 'loadManifest',
        },

        ui: {
            month: 'select[name=month]',
        },

        loadManifest: function(e) {
            e.preventDefault()

            var month = '?month='+this.ui.month.val()
            var url = app.apiurl+'/pdf/manifest'+month

            utils.sign({
                url: url,
                callback: function(resp) {
                    window.location = url+'&token='+resp.token
                }
            })
        },

        onRender: function() {
            this.ui.month.empty()
            var d = new Date()
            _.each(_.range(1,13), function(m) {
                var m = (m < 10 ? ('0'+m) : m)+'-'+d.getFullYear()
                this.ui.month.append('<option value="'+m+'">'+m+'</option>')
            }, this)

        }
        
    })

})