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
        
        onRender: function() {
            if (!app.mobile()) {
                this.$el.find('.left').css('width', '25%')
                this.$el.find('.right').css('width', '73%')
            }
            this.$el.find('.key').show().css('float', 'none')
            
            this.dcs = new DCs(null, { running: false, state: { pageSize: 5 } })
            this.dcl.show(new DCList({ collection: this.dcs, params: { visit: null}, }))
            
            this.$el.find('.filter, .srch, .dcl .content > h1').hide()
        },
        
    })
        


})