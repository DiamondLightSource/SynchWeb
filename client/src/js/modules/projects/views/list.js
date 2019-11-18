define(['marionette', 'backbone',
        'views/validatedrow',
    
        'models/project',
        'templates/projects/projects.html',
        'templates/projects/projectsrow.html',
        'templates/projects/projectsrownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, ValidatedRow, Project, template, rowtemplate, rowtemplatenew) {
    
        
    var GridRow = ValidatedRow.extend({
        getTemplate: function() {
            return this.model.get('new') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        className: function() {
            return this.model.get('new') ? 'new' : ''
        },
        
        events: {
            'click td': 'showProject',
            'click a.cancel': 'cancelProject',
            'click a.save': 'onSubmit'
        },
        
        ui: {
            title: 'input[name=TITLE]',
            acronym: 'input[name=ACRONYM]',
        },
        
        cancelProject: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },
        
        setData: function() {
            this.model.set({
                TITLE: this.ui.title.val(),
                ACRONYM: this.ui.acronym.val(),
            })
        },
        
        success: function(model, response, options) {
            this.model.set('new', false)
            this.$el.removeClass('new')
            this.render()
        },
        
        error: function(model, response, options) {
            app.message('Something went wrong creating this project, please try again')
        },
        
        showProject: function(e) {
            if ($(e.target).closest('.new').length) return
            app.trigger('projects:view', this.model.get('PROJECTID'))
        },
    })
    
    var EmptyRow = Marionette.ItemView.extend({
        tagName: 'tr',
        template: _.template('<td colspan="3">No projects defined</td>')
    })

    
    return GridView = Backbone.Marionette.CompositeView.extend({
        className: 'content',
        template: template,
        childView: GridRow,
        childViewContainer: 'tbody',
        emptyView: EmptyRow,
        
        events: {
            'click .add': 'addProject',
        },
        
        addProject: function(e) {
            e.preventDefault()
            if (this.$el.find('.new').length) return
            this.collection.add(new Project({ new: true }))
        },
    })
    
})