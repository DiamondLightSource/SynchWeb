define(['marionette', 'backbone',
        'views/validatedrow',

        'views/pages',
    
        'modules/imaging/models/screen',
        'templates/imaging/screen.html',
        'templates/imaging/screenrow.html',
        'templates/imaging/screenrownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, ValidatedRow, PagesView, Screen, template, rowtemplate, rowtemplatenew) {
    
        
    var GridRow = ValidatedRow.extend({
        getTemplate: function() {
            return this.model.get('new') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        className: function() {
            return this.model.get('new') ? 'new' : ''
        },
        
        events: {
            'click td': 'showScreen',
            'click a.cancel': 'cancelScreen',
            'click a.save': 'onSubmit'
        },
        
        ui: {
            name: 'input[name=NAME]',
            global: 'select[name=GLOBAL]',
        },
        
        cancelScreen: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },
        
        setData: function() {
            this.model.set({
                NAME: this.ui.name.val(),
                GLOBAL: this.ui.global.val(),
            })
        },
        
        success: function(model, response, options) {
            this.model.set('new', false)
            this.$el.removeClass('new')
            this.render()
        },
        
        error: function(model, response, options) {
            app.message('Something went wrong creating this screen, please try again')
        },
        
        showScreen: function(e) {
            if ($(e.target).closest('.new').length) return
            app.trigger('screen:view', this.model.get('SCREENID'))
        },
    })

    var EmptyView = Marionette.View.extend({
        tagName: 'tr',
        template: _.template('<td colspan="5">No crystallisation screens found</td>')
    })
    
    
    return GridView = Marionette.View.extend({
        className: 'content',
        template: template,
        childView: GridRow,
        emptyView: EmptyView,
        childViewContainer: 'tbody',
        
        events: {
            'click .add': 'addScreen',
        },
        
        addScreen: function(e) {
            e.preventDefault()
            if (this.$el.find('.new').length) return
            this.collection.unshift(new Screen({ new: true }))
        },


        onRender: function() {
            console.log('render screenadmin')
            this.pages = new PagesView({ collection: this.collection, noUrl: true })
            this.$el.find('.page_wrap').append(this.pages.render().$el)
        },
    })
    
})
