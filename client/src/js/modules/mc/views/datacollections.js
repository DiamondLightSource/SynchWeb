define(['backbone', 'marionette', 
    'modules/mc/views/dcdistl',

    'views/pages',
    'views/search',

    'modules/dc/views/reprocessoverview',
    'models/reprocessing',
    'collections/reprocessings',
    'models/reprocessingparameter',
    'collections/reprocessingparameters',
    'models/reprocessingimagesweep',
    'collections/reprocessingimagesweeps',

    'utils/kvcollection',
    'utils',

    'templates/mc/datacollections.html',
    'collections/spacegroups',
    ], function(Backbone, Marionette, DCDISTLView, Pages, Search, 
        ReprocessOverview, Reprocessing, Reprocessings, 
        ReprocessingParameter, ReprocessingParameters,
        ReprocessingImageSweep, ReprocessingImageSweeps,
        KVCollection, utils,
        template, Spacegroups) {


    var DCsDISTLView = Marionette.CollectionView.extend({
        childView: DCDISTLView,
    })


    var Pipelines = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))


    var IndexingMethods = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))


    var AbsorptionLevels = Backbone.Collection.extend(_.extend({
        keyAttribute: 'NAME',
        valueAttribute: 'VALUE',
    }, KVCollection))


    return Marionette.View.extend({
        className: 'content',
        template: template,
        regions: { 
            dcs: '.dcs', 
            srch: '.srch', 
            pages: '.page_wrap',
            rps: '.rps',
        },
    
        events: {
            'click .integrate': 'integrate',
            'click a.opt': 'toggleOpts',
            'change @ui.pipeline': 'updatePipeline',
        },

        ui: {
            jobs: '.jobs',
            wait: '.wait',
            pipeline: 'select[name=pipeline]',
            indexingMethod: 'select[name=method]',
            absorptionLevel: 'select[name=absorption_level]',
            opts: 'div.options',
            sm: 'input[name=sm]',
            sg: 'select[name=sg]',
        },

        templateHelpers: function() {
            return {
                VISIT: this.getOption('params').visit
            }
        },

        updatePipeline: function() {
            const isXia2 = this.ui.pipeline.val().startsWith("xia2")
            this.ui.sm.prop('disabled', !isXia2)
            for (param of this.xia2params()) {
                this.$el.find('input[name='+param+'], select[name='+param+']').prop('disabled', !isXia2)
            }
        },

        showSpaceGroups: async function() {
            this.spacegroups = new Spacegroups(null, { state: { pageSize: 9999 } })
            await this.spacegroups.fetch();
            this.ui.sg.html('<option value=""> - </option>'+this.spacegroups.opts())
        },

        toggleOpts: function(e) {
            e.preventDefault()
            this.ui.opts.slideToggle()
        },

        xia2params: function() {
            return ['cc_half', 'isigma', 'misigma', 'sigma_strong', 'method', 'absorption_level']
        },

        integrate: function(e) {
            e.preventDefault()

            var s = this.collection.where({ selected: true })

            if (!s.length) {
                utils.confirm({ title: 'No data collections selected', content: 'Please selected some data sets to integrate' })
                return
            }

            var self = this
            var p = this.pipelines.findWhere({ VALUE: self.ui.pipeline.val() })
            var reprocessing = new Reprocessing({
                DATACOLLECTIONID: s[0].get('ID'),
                COMMENTS: 'Multicrystal integrator',
                DISPLAYNAME: p.get('NAME'),
                RECIPE: self.ui.pipeline.val(),
            })

            reprocessing.save({}, {
                success: function() {
                    var reprocessingparams = new ReprocessingParameters()

                    var res = self.$el.find('input[name=res]').val()
                    if (res) reprocessingparams.add(new ReprocessingParameter({ 
                        PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                        PARAMETERKEY: 'd_min', 
                        PARAMETERVALUE: res
                    }))

                    var lowres = self.$el.find('input[name=lowres]').val()
                    if (lowres) reprocessingparams.add(new ReprocessingParameter({
                        PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                        PARAMETERKEY: 'd_max',
                        PARAMETERVALUE: lowres
                    }))

                    var hascell = true
                    var cell = []
                    _.each(['a', 'b', 'c', 'alpha', 'beta', 'gamma'], function(f, i) {
                        var val = self.$el.find('input[name='+f+']').val().replace(/\s/g, '')
                        if (!val) hascell = false
                        else cell.push(val)
                    })

                    if (hascell) reprocessingparams.add(new ReprocessingParameter({ 
                        PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                        PARAMETERKEY: 'unit_cell', 
                        PARAMETERVALUE: cell.join(',')
                    }))

                    var sg = self.$el.find('select[name=sg]').val().replace(/\s/g, '')
                    if (sg) reprocessingparams.add(new ReprocessingParameter({ 
                        PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                        PARAMETERKEY: 'spacegroup', 
                        PARAMETERVALUE: sg
                    }))

                    var sm = self.$el.find('input[name=sm]').is(':checked')
                    if (sm) reprocessingparams.add(new ReprocessingParameter({ 
                        PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                        PARAMETERKEY: 'small_molecule', 
                        PARAMETERVALUE: 'true'
                    }))

                    for (param of self.xia2params()) {
                        var val = self.$el.find('input[name='+param+'], select[name='+param+']').val().replace(/\s/g, '')
                        if (val) reprocessingparams.add(new ReprocessingParameter({
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            PARAMETERKEY: param,
                            PARAMETERVALUE: val
                        }))
                    }

                    if (reprocessingparams.length) reprocessingparams.save()


                    var sweeps = []
                    _.each(s, function(sw) {
                        sweeps.push({
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            DATACOLLECTIONID: sw.get('ID'),
                            STARTIMAGE: sw.get('selection')[0], 
                            ENDIMAGE: sw.get('selection')[1],
                        })
                    })
                    var reprocessingsweeps = new ReprocessingImageSweeps(sweeps)
                    reprocessingsweeps.save()

                    app.message({ message: '1 reprocessing job successfully submitted'})
                    self._enqueue({ PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID') })
                },

                error: function() {
                    app.alert({ message: 'Something went wrong starting that reprocessing run' })
                }
            })

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
            this.paginator = new Pages({ collection: options.collection, noUrl: options.noPageUrl })
            this.search = new Search({ value: options.params.search, collection: options.collection, url: !options.noSearchUrl })

            this.reprocessings = new Reprocessings()
            this.reprocessings.queryParams.visit = options.visit
            this.reprocessings.state.pageSize = 5 
            this.listenTo(this.reprocessings, 'sync', this.setJobs)
            this.reprocessings.fetch()
        },

        setJobs: function() {
            var n = this.reprocessings.running
            var w = this.reprocessings.waiting
            this.ui.jobs.text(n)
            this.ui.wait.text(w)
            n > 0 ? this.ui.jobs.parent('li').addClass('running') : this.ui.jobs.parent('li').removeClass('running')
        },
                                          
        onRender: function() {
            this.getRegion('pages').show(this.paginator)
            this.srch.show(this.search)
            this.ui.opts.hide()

            var distlview = new DCsDISTLView({ collection: this.collection })
            this.dcs.show(distlview)
            this.listenTo(distlview, 'childview:set:cell', this.setCell, this)

            this.rps.show(new ReprocessOverview({ collection: this.reprocessings, embed: true, results: true }))

            // asynchronously load space groups into the select menu
            this.showSpaceGroups()

            this.pipelines = new Pipelines([
                { NAME: 'Xia2 DIALS', VALUE: 'xia2-dials' },
                { NAME: 'Xia2 3dii', VALUE: 'xia2-3dii' },
                { NAME: 'Fast DP', VALUE: 'fast_dp' },
                { NAME: 'autoPROC', VALUE: 'autoPROC' },
            ])

            this.ui.pipeline.html(this.pipelines.opts())

            this.indexingMethods = new IndexingMethods([
                { NAME: '-', VALUE: '' },
                { NAME: 'fft3d', VALUE: 'fft3d' },
                { NAME: 'fft1d', VALUE: 'fft1d' },
                { NAME: 'Real space grid search', VALUE: 'real_space_grid_search' },
            ])

            this.ui.indexingMethod.html(this.indexingMethods.opts())

            this.absorptionLevels = new AbsorptionLevels([
                { NAME: '-', VALUE: '' },
                { NAME: 'Low', VALUE: 'low' },
                { NAME: 'Medium', VALUE: 'medium' },
                { NAME: 'High', VALUE: 'high' },
            ])

            this.ui.absorptionLevel.html(this.absorptionLevels.opts())
        },
          
        setCell: function(view, ap) {
            console.log('set cell main view', view, ap)
            _.each({'a': 'a', 'b': 'b', 'c': 'c', 'alpha': 'al', 'beta': 'be', 'gamma': 'ga'}, function(k,f) {
                this.$el.find('input[name='+f+']').val(ap.get('CELL')['CELL_'+k.toUpperCase()])
            }, this)

            this.$el.find('select[name=sg]').val(ap.get('SG'))
        },

        onDestroy: function() {
            this.reprocessings.stop()
            this.collection.stop()
        },

    })

})
