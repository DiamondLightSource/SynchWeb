define(['views/form',
    'modules/imaging/models/inspection',
    'modules/imaging/collections/inspectiontypes',
    'templates/imaging/inspectionadd.html',
    'jquery',
    'backbone',

    'backbone-validation',
    
    ], function(FormView,
        ContainerInspection, InspectionTypes,
        template, $_, Backbone) {


    return FormView.extend({
        template: template,

        ui: {
            dt: 'input[name=BLTIMESTAMP]',
            type: 'select[name=INSPECTIONTYPEID]'
        },


        initialize: function(options) {
            this.inspectiontypes = new InspectionTypes()
            this.inspectiontypes.fetch().done(this.populateTypes.bind(this))
            this.containerid = options.CONTAINERID
        },

        populateTypes: function() {
            this.ui.type.html(this.inspectiontypes.opts())
        },

        
        createModel: function() {
            this.model = new ContainerInspection({ 
                CONTAINERID: this.containerid,
                MANUAL: 1,
            })
        },
        
        success: function(model, response, options) {
            console.log('success from inspection add')
            if (this.getOption('dialog')) {
                app.alert({ message: 'New Container Inspection Created' })
                if (app.dialog.currentView) app.dialog.currentView.closeDialog()
                this.trigger('inspection:created')
            } else app.trigger('inspection:show', model.get('CONTAINERINSPECTIONID'))
        },

        getModel: function() {
            return this.model
        },

        failure: function(model, response, options) {
            console.log('failure from inspection add')
            app.alert({ message: 'Something went wrong registering container inspection, please try again'})
        },

        onRender: function() {
            this.ui.dt.datetimepicker({ dateFormat: "dd-mm-yy" })
        },
    })

})