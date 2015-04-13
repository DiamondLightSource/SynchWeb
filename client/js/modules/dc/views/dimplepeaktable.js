define(['marionette', 'tpl!templates/dc/dimplepeaktable.html', 'tpl!templates/dc/dimplepeaktablerow.html'], function(Marionette, template, rowtemplate) {

    var PeakItemView = Marionette.ItemView.extend({
        tagName: 'tr',
        template: rowtemplate,
        
        triggers: {
            'click td': 'peak:show',
        },
        
        onRender: function() {
            if (this.model.collection.indexOf(this.model) == 0) this.trigger('peak:show')
        }
        
    })

    
    return Marionette.CompositeView.extend({
        template: template,
        tagName: 'table',
        className: 'peaks',
        
        childView: PeakItemView,
        childViewContainer: 'tbody',
        
        childEvents: {
            'peak:show': 'showPeak',
        },
        
        showPeak: function(e) {
            console.log('clicked vhild row', this, e)
            this.trigger('peak:show', e.model.get('X'), e.model.get('Y'), e.model.get('Z'))
        },
    })
    
    
})