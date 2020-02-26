define(['modules/dc/views/imagestatusitem',
        'jquery.mp'
    ], function(ImageStatusitem) {
       
    
    return ImageStatusitem.extend({
    
        onRender: function() {
            var id = this.model.get('ID')
        
            if (this.model.get('SNS')[3]) {
                this.ui.di.attr('data-src', app.apiurl+'/image/id/'+id+'/n/4').addClass('lazy')
                this.$el.find('.diffraction').magnificPopup({ delegate: 'a', type: 'image' })
            }
            
            if (this.model.get('SNS')[0]) {
                this.ui.sn.attr('data-src', app.apiurl+'/image/id/'+id).addClass('lazy')
        
                var sns = ''
                for (var i = 1; i < this.model.get('SNS').length-1; i++) {
                    if (this.model.get('SNS')[i]) sns += ('<a href="'+app.apiurl+'/image/id/'+id+'/f/1/n/'+(i+1)+'" title="Crystal Snapshot '+(i+1)+'"></a>')
                }
           
                if (this.ui.sns.find('a').length == 1) this.ui.sns.append(sns)
                this.ui.sns.magnificPopup({
                    delegate: 'a', type: 'image',
                    gallery: {
                        enabled: true,
                        navigateByImgClick: true,
                    }
                })
            }
            
            this.lazyLoad($(window))
        },
        
    })
       
})