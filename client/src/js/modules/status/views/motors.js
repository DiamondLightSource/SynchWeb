define(['marionette',
    'modules/status/collections/motors',
    
    'templates/status/pvmotor.html',
    'templates/status/pvtoggle.html',
    ], function(Marionette, Motors, mtemplate, ttemplate) {
    

    var ToggleView = Marionette.ItemView.extend({
        template: ttemplate,
        
        ui: {
            b: '.button',
        },
        
        modelEvents: {
            'change': 'render',
        },
        
        onRender: function() {
            this.model.get('val') ? this.ui.b.addClass('active') : this.ui.b.removeClass('active')
        },
    })
    
    
    var MotorView = Marionette.ItemView.extend({
        template: mtemplate,
        
        ui: {
            val: '.value',
            rbv: '.readback',
        },
        
        modelEvents: {
            'change': 'render',
        },
        
        onRender: function() {
            this.ui.val.text(this.model.get('val').VAL)
            this.ui.rbv.text(this.model.get('val').RBV)
            
            var statuses = {
                'SEVR': { MAJOR: 'inactive', MINOR: 'minor' },
                'DMOV': { 0: 'active' },
                'HLS': { 1: 'minor' },
                'LLS': { 1: 'minor' },
                'LVIO': { 1: 'minor' },
            }
            
            _.each(statuses, function(b, k) {
                var bd = this.$el.find('.button.'+k.toLowerCase())
                _.each(b, function(s, v) {
                    this.model.get('val')[k] === v ? bd.addClass(s) : bd.removeClass(s)
                }, this)
            }, this)
            
            var b = this.$el.find('.button.ffe')
            var ffe = (this.model.get('MSTA') & 1<<6) === 1<<6
            ffe ? b.addClass('inactive') : b.removeClass('inactive')
        },
    })
        
        
    return Marionette.CollectionView.extend({
        getChildView: function(m) {
            return m.get('t') === 1 ? MotorView : ToggleView
        },
        
        initialize: function() {
            this.collection = new Motors(null, { bl: this.getOption('bl'), epid: this.getOption('epid') })

            this.collection.fetch()//.done(function() { console.log(self.collection) })
        },
        
        onDestroy: function() {
            this.collection.stop()
        },
    })
        
})