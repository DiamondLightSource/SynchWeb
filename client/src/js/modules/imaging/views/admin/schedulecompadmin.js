define(['marionette', 'backbone',
        'views/validatedrow',
        'utils/editable',

        'modules/imaging/models/schedulecomponent',
        'modules/imaging/collections/schedulecomponents',
        'modules/imaging/collections/inspectiontypes',

        'templates/imaging/schedulecomps.html',
        'templates/imaging/schedulecomprow.html',
        'templates/imaging/schedulecomprownew.html',
    
        'backbone-validation',
    ], function(Marionette, Backbone, ValidatedRow, Editable,
        Component, Components, InspectionTypes,
        template, rowtemplate, rowtemplatenew) {
      

    var GridRow = ValidatedRow.extend({
        getTemplate: function() {
            return this.model.get('new') | this.model.get('edit') ? rowtemplatenew : rowtemplate
        },
        tagName: 'tr',
        
        className: function() {
            return this.model.get('new') ? 'new' : ''
        },
        
        events: {
            'click a.cancel': 'cancelSchedule',
            'click a.save': 'onSubmit',
            'click a.edit': 'editSchedule',
        },
        
        ui: {
            //name: 'input[name=NAME]',
            type: 'select[name=INSPECTIONTYPEID]',
        },

        editSchedule: function(e) {
            e.preventDefault()
            this.model.set({ edit: true })
            this.render()
            this.ui.type.val(this.model.get('INSPECTIONTYPEID'))
        },
        
        cancelSchedule: function(e) {
            e.preventDefault()
            if (this.model.get('edit')) {
                this.model.set({ edit: false })
                this.render()

            } else this.model.collection.remove(this.model)
        },
        
        setData: function() {
            var ty = this.getOption('types').findWhere({ INSPECTIONTYPEID: this.ui.type.val() })
            this.model.set({
                INSPECTIONTYPEID: this.ui.type.val(),
                INSPECTIONTYPE: ty.get('NAME')
            })
        },
        
        success: function(model, response, options) {
            this.model.set('new', false)
            this.model.set('edit', false)
            this.$el.removeClass('new')
            this.render()
        },
        
        failure: function(model, response, options) {
            app.alert({ message: 'Something went wrong creating this schedule component, please try again' })
        },

        onRender: function() {
            this.ui.type.html(this.getOption('types').opts()).val(this.model.get('INSPECTIONTYPEID'))
        },
        
    })

    var EmptyView = Marionette.ItemView.extend({
        tagName: 'tr',
        template: _.template('<td colspan="3">No components defined</td>')
    })
    
    
    return GridView = Backbone.Marionette.CompositeView.extend({
        className: 'content',
        template: template,
        childView: GridRow,
        emptyView: EmptyView,
        childViewContainer: 'tbody',
        childViewOptions: function() {
            return {
                types: this.types
            }
        },
        
        events: {
            'click .add': 'addSchedule',
        },

        initialize: function(options) {
            Backbone.Validation.bind(this);
            
            this.collection = new Components()
            this.collection.queryParams.shid = this.model.get('SCHEDULEID')
            this.collection.fetch()

            this.types = new InspectionTypes()
            this.types.fetch()
        },
        
        addSchedule: function(e) {
            e.preventDefault()
            if (this.$el.find('.new').length) return
            this.collection.add(new Component({ new: true, SCHEDULEID: this.model.get('SCHEDULEID') }))
        },

        onRender: function() {
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')
        },
    })
    

})