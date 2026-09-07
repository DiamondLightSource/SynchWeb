define(['backbone', 'marionette', 'views/dialog',
    'collections/spacegroups',
    'models/reprocessing',
    'models/reprocessingparameter',
    'collections/reprocessingparameters',
    'utils/kvcollection',
    'templates/dc/multiplex.html'
], function(Backbone, Marionette, DialogView,
        Spacegroups,
        Reprocessing,
        ReprocessingParameter,
        ReprocessingParameters,
        KVCollection, 
        template
        ) {
    
    const FilteringMethods = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))

    return ReprocessView = DialogView.extend({
        template: template,
        dialog: true,
        className: 'rp content',
        dOptions: {
            width: '1000px',
        },

        ui: {
            fields: 'input, select',
            sg: 'select[name=sg]',
            res: 'input[name=res]',
            opts: 'div.options',
            filteringMethod: 'select[name=method]',
            sdcutoff: 'input[name=sdcutoff]',
            cchalf: 'input[name=cchalf]',
            groupsize: 'input[name=groupsize]',
        },

        buttons: {
            Submit: 'submit',
            Close: 'closeDialog',
        },

        events: {
            'input @ui.fields': 'onFieldChanged',
            'change @ui.fields': 'onFieldChanged',
            'click a.opt': 'toggleOpts',
            'change @ui.cchalf': 'updateCCHalf',
            'change @ui.filteringMethod': 'updateFilteringMethod',
        },

        templateHelpers: function() {
            return {
                TYPE: this.getOption('type')
            }
        },

        toggleOpts: function(e) {
            e.preventDefault()
            this.ui.opts.slideToggle()
        },

        updateCCHalf: function() {
            const enabled = this.ui.cchalf.is(':checked')
            if (enabled) {
                this.ui.filteringMethod.prop('disabled', false).val('image_group')
                this.ui.sdcutoff.prop('disabled', false)
                this.ui.groupsize.prop('disabled', false)
            } else {
                this.ui.sdcutoff.prop('disabled', true).val('')
                this.ui.filteringMethod.prop('disabled', true).val('')
                this.ui.groupsize.prop('disabled', true).val('')
            }
        },

        updateFilteringMethod: function() {
            const val = this.ui.filteringMethod.val()
            if (val === 'dataset') {
                this.ui.groupsize.prop('disabled', true).val('')
            } else {
                this.ui.groupsize.prop('disabled', false)
            }
        },

        submit: async function(e) {
            e.preventDefault()
            this._disableSubmitButton()
            const reprocessing = new Reprocessing({
                DATACOLLECTIONID: this.model.get('ID'),
                RECIPE: 'trigger-multiplex',
                DISPLAYNAME: this.type,
            })

            try {
                await reprocessing.save()
                const jobId = reprocessing.get('PROCESSINGJOBID')
                const reprocessingparams = new ReprocessingParameters()
                
                reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'scaling_id',
                    PARAMETERVALUE: this.scalingid
                }));

                const res = this.ui.res.val()
                if (res) reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'd_min',
                    PARAMETERVALUE: res
                }))

                const sg = this.ui.sg.val().replace(/\s/g, '')
                if (sg) reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'spacegroup',
                    PARAMETERVALUE: sg
                }))

                const cchalf = this.ui.cchalf.prop('checked')
                if (cchalf) reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'apply_cchalf_filtering',
                    PARAMETERVALUE: 1
                }))

                const method = this.ui.filteringMethod.val()
                if (method) reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'cchalf_filtering_method',
                    PARAMETERVALUE: method
                }))
                
                const sdcutoff = this.ui.sdcutoff.val()
                if (sdcutoff) reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'sd_cutoff',
                    PARAMETERVALUE: sdcutoff
                }))
                
                const groupsize = this.ui.groupsize.val()
                if (groupsize) reprocessingparams.add(new ReprocessingParameter({
                    PROCESSINGJOBID: jobId,
                    PARAMETERKEY: 'image_group_size',
                    PARAMETERVALUE: groupsize
                }))
                
                await reprocessingparams.save()
                this._enqueue({ PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID') })
                app.message({ message: 'Multiplex reprocessing job successfully submitted'})

            } catch {
                app.alert({ message: 'Something went wrong starting that reprocessing run' })
            }

        },

        onFieldChanged: function() {
            this._enableSubmitButton();
        },

        _disableSubmitButton: function() {
            var btn = $('.ui-dialog-buttonpane button:contains("Submit")')
            btn.addClass('submitted').button('disable').button('option', 'label', 'Submitted!')
            this.resetTimeout = setTimeout(() => {
                this._enableSubmitButton()
            }, 5000)
        },

        _enableSubmitButton: function() {
            var btn = $('.ui-dialog-buttonpane button.submitted')
            btn.removeClass('submitted').button('enable').button('option', 'label', 'Submit')
            clearTimeout(this.resetTimeout);
        },

        _enqueue: function(options) {
            Backbone.ajax({
                url: app.apiurl+'/process/enqueue',
                method: 'POST',
                data: {
                    PROCESSINGJOBID: options.PROCESSINGJOBID,
                },
            })
        },

        initialize: function(options) {
            this.scalingid = options.scalingid
            this.type = options.type
            this.title = 'Rerun multiplex processing - ' + this.type
            this.filteringMethods = new FilteringMethods([
                { NAME: 'image_group', VALUE: 'image_group' },
                { NAME: 'dataset', VALUE: 'dataset' },
            ])
            this.spacegroups = new Spacegroups(null, { state: { pageSize: 9999 } })
            this.listenTo(this.spacegroups, 'sync', this.populateSpacegroups)
            this.spacegroups.fetch()
        },

        onRender: function() {
            this.ui.opts.hide()
            this.ui.filteringMethod.html(this.filteringMethods.opts())
            this.ui.filteringMethod.prop('disabled', true).val('')
            this.ui.sdcutoff.prop('disabled', true)
            this.ui.groupsize.prop('disabled', true)
        },

        populateSpacegroups: function() {
            this.ui.sg.html('<option value=""> - </option>'+this.spacegroups.opts())
        }

    })
})
