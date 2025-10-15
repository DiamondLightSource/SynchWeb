define(['backbone', 'marionette', 'views/dialog',
    'collections/datacollections',
    'collections/proteins',
    'collections/autoprocattachments',
    'models/datacollection',
    'modules/mc/views/dcdistl_downstream',
    'modules/samples/collections/pdbs',
    'utils/kvcollection',
    'templates/dc/downstream.html', 'templates/dc/downstream_dc.html'
], function(Backbone, Marionette, DialogView,
        DataCollections, Proteins, AutoProcAttachments,
        DataCollection, DCDistlView,
        PDBs,
        KVCollection, 
        template, dctemplate
        ) {
    

    var IDDataCollection = DataCollection.extend({
        idAttribute: 'CID',
    })

    var IDDataCollections = DataCollections.extend({
        model: IDDataCollection,
    })

    var DCDistlViewLarge = DCDistlView.extend({
        template: dctemplate,
        intStatus: false,
        className: 'data_collection',

        initialize: function(options) {
            DCDistlView.prototype.initialize.apply(this, arguments)
        },

        onRender: function() {
            this.$el.find('ul').addClass('half')
            this.$el.find('li input[type="text"]').css('width', '25%')
        },

    })


    var DCDistlsView = Marionette.CollectionView.extend({
        childView: DCDistlViewLarge,
        childViewOptions: function() {
            return {
                pipelines: this.getOption('pipelines'),
                parent: this.model,
            }
        }
    })


    var Pipelines = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))


    return ReprocessView = DialogView.extend({
        template: template,
        dialog: true,
        title: 'Rerun downstream processing',
        className: 'rp content',
        dOptions: {
            width: '1000px',
        },

        regions: {
            dcr: '.dcs',
        },

        ui: {
            pipeline: 'select[name=pipeline]',
            warning: '#warning',
        },

        buttons: {
            Submit: 'submit',
            Close: 'closeDialog',
        },
        
        disabledButtons: {
            Close: 'closeDialog',
        },

        events: {
            'change @ui.pipeline': 'updatePipeline',
        },

        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit')
            }
        },

        updatePipeline: function() {
            this.model.set('PIPELINE', this.ui.pipeline.val())
            this.model.set('PIPELINENAME', this.ui.pipeline.find('option:selected').text())
            var btns = this.buttons
            var warning = ''
            if (['MrBUMP', 'Dimple'].includes(this.model.get('PIPELINENAME')) && this.type.includes('autoPROC')) {
                warning = ' Cannot rerun ' + this.model.get('PIPELINENAME') + ' on ' + this.type + ' results'
                btns = this.disabledButtons
            }
            if (['MrBUMP', 'Big EP'].includes(this.model.get('PIPELINENAME')) && this.type.includes('fast_dp')) {
                warning = ' Cannot rerun ' + this.model.get('PIPELINENAME') + ' on ' + this.type + ' results'
                btns = this.disabledButtons
            }
            if (this.model.get('PIPELINENAME') === 'Dimple' && this.pdbs.length === 0) {
                warning = ' Cannot run Dimple as no PDBs defined'
                btns = this.disabledButtons
            }
            if (this.model.get('PIPELINENAME') === 'MrBUMP' && this.model.get('HASSEQ') === 'No') {
                warning = ' Cannot run MrBUMP as no sequence defined'
                btns = this.disabledButtons
            }
            if (this.model.get('PIPELINENAME') === 'Fast EP' && (!this.model.get('ANOMALOUSSCATTERER'))) {
                warning = ' Cannot run Fast EP as no anomalous scatterer defined'
                btns = this.disabledButtons
            }
            if (this.model.get('PIPELINENAME') === 'Big EP' && this.model.get('HASSEQ') === 'No') {
                warning = ' Cannot run Big EP as no sequence defined'
                btns = this.disabledButtons
            }
            if (this.model.get('PIPELINENAME') === 'Big EP' && (!this.model.get('ANOMALOUSSCATTERER'))) {
                warning = ' Cannot run Big EP as no anomalous scatterer defined'
                btns = this.disabledButtons
            }
            this.setButtons(btns)
            this.ui.warning.html(warning)
        },

        submit: function(e) {
            e.preventDefault()
            
            this._enqueue({ RECIPE: this.model.get('PIPELINE'), DATACOLLECTIONID: this.model.get('ID'), SCALINGID: this.scalingid })
            app.message({ message: 'Downstream processing job successfully submitted'})
            this._disableIntegrateButton()
            
        },


        _disableIntegrateButton: function() {
            var btn = $('.ui-dialog-buttonpane button:contains("Submit")')
            btn.button('disable').button('option', 'label', 'Submitted!')
            setTimeout(function() {
                btn.button('enable').button('option', 'label', 'Submit')
            }, 5000)
        },


        _enqueue: function(options) {
            Backbone.ajax({
                url: app.apiurl+'/process/enqueue/downstream',
                method: 'POST',
                data: {
                    DATACOLLECTIONID: options.DATACOLLECTIONID,
                    SCALINGID: options.SCALINGID,
                    RECIPE: options.RECIPE
                },
            })
        },


        initialize: function(options) {
            this.proteins = new Proteins(null, { queryParams: { sid: options.model.get('BLSAMPLEID') } })
            this._ready = this.proteins.fetch()
            this._ready.done(this.doOnReady.bind(this))
            this.scalingid = options.scalingid
            this.type = options.type
            this.attachments = new AutoProcAttachments()
            this.attachments.queryParams = {
                AUTOPROCPROGRAMID: options.autoprocprogramid,
                filetype: 'Result',
            }
            this.attachments.fetch()
        },

        onRender: function() {

            this.pipelines = new Pipelines([
                { NAME: 'Dimple', VALUE: 'trigger-dimple' },
                { NAME: 'Fast EP', VALUE: 'trigger-fastep' },
                { NAME: 'Big EP', VALUE: 'trigger-bigep' },
                { NAME: 'MrBUMP', VALUE: 'trigger-mrbump' },
            ])

            this.ui.pipeline.html(this.pipelines.opts())           
        },
        
        doOnReady: function() {
            var protein = this.proteins.at(0)
            var self = this
            _.each(['ACRONYM','PROTEINID','HASSEQ','PDBS','ANOMALOUSSCATTERER'], function(k) {
                self.model.set(k, protein.get(k))
            })
            this.pdbs = new PDBs(null, { pid: this.model.get('PROTEINID') })
            this.pdbs.fetch().done(this.updatePipeline.bind(this))
            this.collection = new IDDataCollections()
            if (this.model) {
                var nm = new IDDataCollection(this.model.toJSON())
                nm.set('CID', this.collection.length+1)
                this.collection.add(nm)
            }
            this.distlview = new DCDistlsView({ collection: this.collection, pipelines: this.pipelines })
            this.dcr.show(this.distlview)
        }

          
    })

})
