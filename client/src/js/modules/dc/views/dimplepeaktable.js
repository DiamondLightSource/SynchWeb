define(['marionette', 'templates/dc/dimplepeaktable.html', 'templates/dc/dimplepeaktablerow.html'], function(Marionette, template, rowtemplate) {

    var PeakItemView = Marionette.View.extend({
        tagName: 'tr',
        template: rowtemplate,
        
        triggers: {
            'click td': 'peak:show',
        },
        
        onRender: function() {
            if (this.model.collection.indexOf(this.model) == 0) this.trigger('peak:show')
        }
        
    })

    
    return Marionette.View.extend({
        template: template,
        tagName: 'table',
        className: 'peaks',
        
        childView: PeakItemView,
        childViewContainer: 'tbody',
        
        childViewEvents: {
            'peak:show': 'showPeak',
        },
        
        showPeak: function(e) {
            console.log('clicked vhild row', this, e)
            this.trigger('peak:show', e.model.get('X'), e.model.get('Y'), e.model.get('Z'))
        },
    })
    
    
})