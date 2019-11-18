define(['views/form',
    'models/visit',
    'collections/beamlinesetups',
    'templates/admin/visitadd.html',
    'jquery-ui',
    'jquery-ui.timepicker',
    ], function(FormView, Visit, BeamlineSetups, template) {

    return FormView.extend({
        template: template,

        events: {
            'keyup input[name=BEAMLINENAME]': 'refreshSetups'
        },

        ui: {
            bl: 'input[name=BEAMLINENAME]',
            setup: 'select[name=BEAMLINESETUPID]',
        },

        refreshSetups: function() {
            this.blsetups.fetch()
        },

        getBeamlineName: function() {
            return this.ui.bl.val()
        },

        populateSetups: function() {
            console.log('populateSetups', this.blsetups.opts())
            this.ui.setup.html(this.blsetups.opts())
        },


        initialize: function(options) {
            this.refreshSetups = _.debounce(this.refreshSetups, 500)

            console.log('add vis', options)
            this.blsetups = new BeamlineSetups()
            this.blsetups.queryParams.BEAMLINENAME = this.getBeamlineName.bind(this)
            this.blsetups.queryParams.ACTIVE = 1
            this.listenTo(this.blsetups, 'sync', this.populateSetups)
        },

        onRender: function() {
            this.$el.find('input[name=STARTDATE]').datetimepicker({ dateFormat: 'dd-mm-yy' })
            this.$el.find('input[name=ENDDATE]').datetimepicker({ dateFormat: 'dd-mm-yy' })
        },

        createModel: function() {
            this.model = new Visit({ 
                PROPOSAL: this.getOption('proposal').get('PROPOSAL'),
                PROPOSALID: this.getOption('proposal').get('PROPOSALID') 
            })
        },

        success: function(model, response, options) {
            app.trigger('visit:show', model.get('VISIT'))
        },

        failure: function(model, response, options) {
            app.alert({ message: 'Something went wrong creating this visit, please try again'})
        },
    })

})