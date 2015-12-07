define(['marionette',
    'modules/dc/views/samplechanger',
    'collections/datacollections',
    'modules/dc/datacollections',
    'tpl!templates/dc/samplechangerfull.html'
    ], function(Marionette, SampleChanger, DCs, DCList, template) {

    return SampleChanger.extend({
        template: template,
        className: 'content',
        fullScreen: true,
        
        regions: {
            dcl: '.dcl',
        },

        templateHelpers: function() {
            return {
                BL: this.getOption('bl')
            }
        },
        
        onRender: function() {
            var bl = this.getOption('bl')
            var large = bl in app.config.pucks && app.config.pucks[bl] > 10
            console.log('sc large', large)
            if (!app.mobile() && !large) {
                this.$el.find('.left').css('width', '25%')
                this.$el.find('.right').css('width', '73%')
            }

            if (large) {
                this.$el.find('.left').removeClass('left')
                this.$el.find('.right').removeClass('right')
            }

            this.$el.find('.key').show().css('float', 'none')
            
            this.dcs = new DCs(null, { running: false, state: { pageSize: 5 } })
            this.dcl.show(new DCList({ collection: this.dcs, params: { visit: null}, }))
            
            this.$el.find('.filter, .srch, .dcl .content > h1').hide()
        },
        
    })
        


})