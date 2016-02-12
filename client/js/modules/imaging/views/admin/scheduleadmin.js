define(['marionette', 'backbone',
        'views/validatedrow',
    
        'modules/imaging/models/schedule',
        'tpl!templates/imaging/schedules.html',
        'tpl!templates/imaging/schedulerow.html',
        'tpl!templates/imaging/schedulerownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, ValidatedRow, Schedule, template, rowtemplate, rowtemplatenew) {
    
        
    var GridRow = ValidatedRow.extend({
        getTemplate: function() {
            return this.model.get('new') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        className: function() {
            return this.model.get('new') ? 'new' : ''
        },
        
        events: {
            'click td': 'showSchedule',
            'click a.cancel': 'cancelSchedule',
            'click a.save': 'onSubmit'
        },
        
        ui: {
            name: 'input[name=NAME]',
        },
        
        cancelSchedule: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },
        
        setData: function() {
            this.model.set({
                NAME: this.ui.name.val(),
            })
        },
        
        success: function(model, response, options) {
            this.model.set('new', false)
            this.$el.removeClass('new')
            this.render()
        },
        
        error: function(model, response, options) {
            app.message('Something went wrong creating this schedule, please try again')
        },
        
        showSchedule: function(e) {
            if ($(e.target).closest('.new').length) return
            app.trigger('schedule:view', this.model.get('SCHEDULEID'))
        },
    })
    
    var EmptyView = Marionette.ItemView.extend({
        tagName: 'tr',
        template: _.template('<td colspan="4">No schedules found</td>')
    })
    
    return GridView = Backbone.Marionette.CompositeView.extend({
        className: 'content',
        template: template,
        childView: GridRow,
        emptyView: EmptyView,
        childViewContainer: 'tbody',
        
        events: {
            'click .add': 'addSchedule',
        },
        
        addSchedule: function(e) {
            e.preventDefault()
            if (this.$el.find('.new').length) return
            this.collection.add(new Schedule({ new: true }))
        },
    })
    
})