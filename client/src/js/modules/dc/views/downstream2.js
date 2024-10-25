define(['backbone', 'marionette', 'views/dialog',
    'collections/datacollections',
    'collections/proteins',
    'collections/autoprocattachments',
    'models/datacollection',
    'modules/mc/views/dcdistl_downstream',
    'models/reprocessing',
    'models/reprocessingparameter',
    'collections/reprocessingparameters',
    'modules/samples/collections/pdbs',
    'utils/kvcollection',
    'templates/dc/downstream.html', 'templates/dc/downstream_dc.html'
], function(Backbone, Marionette, DialogView,
        DataCollections, Proteins, AutoProcAttachments,
        DataCollection, DCDistlView,
        Reprocessing,
        ReprocessingParameter, ReprocessingParameters,
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
            console.log('this.model')
            console.log(this.model)
            this.model.set('PIPELINE', this.ui.pipeline.val())
            this.model.set('PIPELINENAME', this.ui.pipeline.find('option:selected').text())
            var btns = this.buttons
            var warning = ''
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
            if (this.model.get('PIPELINENAME').startsWith('Big EP') && this.model.get('HASSEQ') === 'No') {
                warning = ' Cannot run Big EP as no sequence defined'
                btns = this.disabledButtons
            }
            if (this.model.get('PIPELINENAME').startsWith('Big EP') && (!this.model.get('ANOMALOUSSCATTERER'))) {
                warning = ' Cannot run Big EP as no anomalous scatterer defined'
                btns = this.disabledButtons
            }
            this.setButtons(btns)
            this.ui.warning.html(warning)
        },

        submit: function(e) {
            e.preventDefault()
            
            const pn = this.model.get('PIPELINENAME')

            var reprocessing = new Reprocessing({
                DATACOLLECTIONID: this.model.get('ID'),
                DISPLAYNAME: pn,
                RECIPE: this.model.get('PIPELINE'),
            })
            
            var self = this
            var reqs = []
            reqs.push(reprocessing.save({}, {
                success: function() {
                    var reprocessingparams = new ReprocessingParameters()

                    if (self.scalingid) reprocessingparams.add(new ReprocessingParameter({ 
                        PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                        PARAMETERKEY: 'scaling_id', 
                        PARAMETERVALUE: self.scalingid,
                    }))

                    if (['Dimple', 'Fast EP', 'MrBUMP'].includes(pn)) {
                        var att = self.attachments.at(0)
                        var mtz = att.get('FILEPATH') + '/' + att.get('FILENAME')
                        if (mtz) reprocessingparams.add(new ReprocessingParameter({ 
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            PARAMETERKEY: pn === 'MrBUMP' ? 'hklin' : 'data', 
                            PARAMETERVALUE: mtz,
                        }))
                    }

                    if (['MrBUMP'].includes(pn)) {
                        reprocessingparams.add(new ReprocessingParameter({ 
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            PARAMETERKEY: 'dophmmer', 
                            PARAMETERVALUE: 'False',
                        }))
                        reprocessingparams.add(new ReprocessingParameter({ 
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            PARAMETERKEY: 'mdlunmod', 
                            PARAMETERVALUE: 'True',
                        }))
                    }

/*
                    // hopefully dont need this
                    var pdbs = ['6O17', '/dls/i03/data/2024/cm37235-4/tmp/pdb/8152683618cbd806720c22fd099229b5fe296f79/ranked_0.pdb']
                    _.each(pdbs, function(pdb) {
                        reprocessingparams.add(new ReprocessingParameter({ 
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            PARAMETERKEY: 'pdb', 
                            PARAMETERVALUE: pdb
                        }))
                    })
*/

                    if (reprocessingparams.length) reqs.push(reprocessingparams.save())

                    $.when.apply($, reqs).done(function() {
                        app.message({ message: 'Downstream processing job successfully submitted'})
                        self._enqueue({ PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID') })
                    })
                },

                error: function() {
                    app.alert({ message: 'Something went wrong starting that downstream processing run' })
                }
            }))
        },


        _enqueue: function(options) {
            Backbone.ajax({
                url: app.apiurl+'/process/enqueue',
                method: 'POST',
                data: {
                    PROCESSINGJOBID: options.PROCESSINGJOBID
                },
            })
        },


        initialize: function(options) {
            this.proteins = new Proteins(null, { queryParams: { sid: options.model.get('BLSAMPLEID') } })
            this._ready = this.proteins.fetch()
            this._ready.done(this.doOnReady.bind(this))
            this.scalingid = options.scalingid
            console.log('scalingid: '+this.scalingid)
            this.attachments = new AutoProcAttachments()
            this.attachments.queryParams = {
                AUTOPROCPROGRAMID: options.autoprocprogramid,
                filetype: 'Result',
            }
            this.attachments.fetch()
        },

        onRender: function() {

            this.pipelines = new Pipelines([
                { NAME: 'Dimple', VALUE: 'postprocessing-dimple' },
                { NAME: 'MrBUMP', VALUE: 'postprocessing-mrbump-cloud' },
                { NAME: 'Fast EP', VALUE: 'postprocessing-fast-ep-cloud' },
                { NAME: 'Big EP autoBuild', VALUE: 'postprocessing-big-ep-launcher-cloud' },
                { NAME: 'Big EP autoSHARP', VALUE: 'postprocessing-big-ep-launcher-cloud-blah' },
                { NAME: 'Big EP Crank2', VALUE: 'postprocessing-big-ep-launcher-cloud-blah-blah' },
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
