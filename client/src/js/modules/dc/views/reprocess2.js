define(['backbone', 'marionette', 'views/dialog',
    'collections/datacollections',
    'models/datacollection',
    'modules/mc/views/dcdistl',
    'models/reprocessing',
    'models/reprocessingparameter',
    'collections/reprocessingparameters',
    'models/reprocessingimagesweep',
    'collections/reprocessingimagesweeps',
    'utils/kvcollection',
    'templates/dc/reprocess.html', 'templates/dc/reprocess_dc.html', 'collections/spacegroups'
], function(Backbone, Marionette, DialogView,
        DataCollections, DataCollection, DCDistlView,
        Reprocessing,
        ReprocessingParameter, ReprocessingParameters,
        ReprocessingImageSweep, ReprocessingImageSweeps,
        KVCollection, 
        template, dctemplate, Spacegroups
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

        ui: {
            cells: '.cells',
            a: 'input[name=CELL_A]',
            b: 'input[name=CELL_B]',
            c: 'input[name=CELL_C]',
            al: 'input[name=CELL_ALPHA]',
            be: 'input[name=CELL_BETA]',
            ga: 'input[name=CELL_GAMMA]',
            cell: 'div.cell',
            st: 'input[name=start]',
            en: 'input[name=end]',
            ind: 'div.ind',
            pipeline: 'select[name=pipeline]',
            res: 'input[name=res]',
            lowres: 'input[name=lowres]',
            sg: 'input[name=SG]'
        },

        events: {
            'click .cells': 'sendCell',
            'click a.add': 'clone',
            'click a.rem': 'rem',
            'click a.sg': 'toggleSG',
            'change @ui.st': 'updateSelection',
            'change @ui.en': 'updateSelection',
            'keyup @ui.st': 'updateSelection',
            'keyup @ui.en': 'updateSelection',
            'click a.all': 'selectAll',
            'click a.apcell': '_setCell',

            'change @ui.a': 'updateCell',
            'change @ui.b': 'updateCell',
            'change @ui.c': 'updateCell',
            'change @ui.al': 'updateCell',
            'change @ui.be': 'updateCell',
            'change @ui.ga': 'updateCell',
            'change @ui.sg': 'updateSG',

            'change @ui.pipeline': 'updatePipeline',
            'change @ui.res': 'updateRes',
            'change @ui.lowres': 'updateLowRes',
        },


        updateRes: function() {
            this.model.set('RES', this.ui.res.val())
        },

        updateLowRes: function() {
            this.model.set('LOWRES', this.ui.lowres.val())
        },

        updatePipeline: function() {
            this.model.set('PIPELINE', this.ui.pipeline.val())
        },

        updateSG: function() {
            this.model.set('SG', this.ui.sg.val())
        },


        updateCell: function(e) {
            var attr = $(e.target).attr('name')
            var val = $(e.target).val()

            this.model.set(attr, val)
        },


        selectAll: function(e) {
            if (e) e.preventDefault()

            var si = parseInt(this.model.get('SI'))
            var ni = parseInt(this.model.get('NUMIMG'))

            this.ui.st.val(si)
            this.ui.en.val(si+ni-1)
            this.updateSelection()
        },

        updateSelection: function() {
            var si = parseInt(this.model.get('SI'))
            var ni = parseInt(this.model.get('NUMIMG'))

            if (this.ui.st.val()) {
                if (this.ui.st.val() > (si+ni-1)) this.ui.st.val(si+ni-1)
                if (this.ui.st.val() < si) this.ui.st.val(si)
            }

            if (this.ui.en.val()) {
                if (this.ui.en.val() > (si+ni-1)) this.ui.en.val(si+ni-1)
                if (this.ui.en.val() < si) this.ui.en.val(si)
            }

            if (this.ui.st.val() && this.ui.en.val()) {
                this.plotview.setSelection(parseInt(this.ui.st.val()), parseInt(this.ui.en.val()))
            }
        },

        initialize: function(options) {
            DCDistlView.prototype.initialize.apply(this, arguments)
            this.updateSelection = _.debounce(this.updateSelection, 500)
        },

        setInd: function(ind) {
            ind ? this.ui.ind.show() : this.ui.ind.hide()
        },

        onRender: function() {
            this.ui.cell.hide()
            this.ui.ind.hide()
            this.$el.find('ul').addClass('half')
            this.$el.find('li input[type="text"]').css('width', '25%')
            this.$el.find('div input[type="text"]').css('width', '50px')
            this.ui.pipeline.html(this.getOption('pipelines').opts())
            this.model.set('PIPELINE', this.ui.pipeline.val())
            // Wait 500ms to ensure distl plot has loaded
            setTimeout(() => { this.selectAll() }, 500)
        },

        toggleSG: function(e) {
            e.preventDefault()
            this.ui.cell.slideToggle()
        },

        rem: function(e) {
            e.preventDefault()
            this.model.collection.remove(this.model)
        },

        clone: function(e) {
            e.preventDefault()
            this.trigger('clone:dc', this.model)
        },

        _setCell: function(e) {
            if (e) e.preventDefault()

            if (this.aps.length) {
                const a = this.aps.at(0)
                const c = a.get('CELL')

                this.ui.a.val(c['CELL_A']).trigger('change')
                this.ui.b.val(c['CELL_B']).trigger('change')
                this.ui.c.val(c['CELL_C']).trigger('change')
                this.ui.al.val(c['CELL_AL']).trigger('change')
                this.ui.be.val(c['CELL_BE']).trigger('change')
                this.ui.ga.val(c['CELL_GA']).trigger('change')

                this.ui.sg.val(a.get('SG')).trigger('change')
            }
        },

        setSelection: function(x1, x2) {
            DCDistlView.prototype.setSelection.apply(this, arguments)
            this.ui.st.val(x1)
            this.ui.en.val(x2)
        },

        setDeselection: function() {
            DCDistlView.prototype.setDeselection.apply(this)
            this.ui.st.val('')
            this.ui.en.val('')
        }
    })


    var DCDistlsView = Marionette.CollectionView.extend({
        childView: DCDistlViewLarge,
        childViewOptions: function() {
            return {
                pipelines: this.getOption('pipelines'),
                spacegroups: this.getOption('spacegroups')
            }
        }
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


    return ReprocessView = DialogView.extend({
        template: template,
        dialog: true,
        title: 'Reprocess Data',
        className: 'rp content',

        regions: {
            dcr: '.dcs',
        },

        ui: {
            cell: 'div.cell',
            opts: 'div.options',
            ind: 'input[name=individual]',
            mul: 'span.multi',
            pipeline: 'select[name=pipeline]',
            com: 'input[type=comments]',
            sg: 'select[name=sg]',
            sm: 'input[name=sm]',
            indexingMethod: 'select[name=method]',
            absorptionLevel: 'select[name=absorption_level]',
            a: 'input[name=a]',
            b: 'input[name=b]',
            c: 'input[name=c]',
            al: 'input[name=alpha]',
            be: 'input[name=beta]',
            ga: 'input[name=gamma]',
        },

        buttons: {
            Integrate: 'integrate',
            Close: 'closeDialog',
        },

        events: {
            'click a.sgm': 'toggleCell',
            'click a.opt': 'toggleOpts',
            'click @ui.ind': 'toggleIndividual',
            'change @ui.pipeline': 'updatePipeline',
            'change @ui.indexingMethod': 'updateIndexingMethod',
            'click a.multicrystal': 'closeDialog',
        },

        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit')
            }
        },

        updatePipeline: function() {
            const isXia2 = this.ui.pipeline.val().startsWith("xia2")
            this.ui.sm.prop('disabled', !isXia2)
            for (param of this.xia2params()) {
                this.$el.find('input[name='+param+'], select[name='+param+']').prop('disabled', !isXia2)
            }
        },

        updateIndexingMethod: function() {
            if (this.ui.indexingMethod.val() == 'real_space_grid_search') {
                const st = this.ui.ind.is(':checked')
                if (st) {
                    let eachHasCell = true
                    this.distlview.children.each(function(v) {
                        if (!v.ui.a.val() || !v.ui.b.val() || !v.ui.c.val() ||
                                !v.ui.al.val() || !v.ui.be.val() || !v.ui.ga.val()) {
                            v.ui.cell.show()
                            eachHasCell = false
                        }
                    })
                    if (!eachHasCell) {
                        app.alert({ message: 'Real Space Grid Search requires unit cell to be populated' })
                        this.ui.indexingMethod.val('')
                    }
                } else {
                    if (!this.ui.a.val() || !this.ui.b.val() || !this.ui.c.val() ||
                            !this.ui.al.val() || !this.ui.be.val() || !this.ui.ga.val()) {
                        app.alert({ message: 'Real Space Grid Search requires unit cell to be populated' })
                        this.ui.indexingMethod.val('')
                        this.ui.cell.show()
                    }
                }
            }
        },

        toggleIndividual: function(e) {
            const st = this.ui.ind.is(':checked')
            st ? this.ui.mul.hide() : this.ui.mul.show()
            if (st) this.ui.cell.hide()
            this.distlview.children.each(function(v) {
                v.setInd(st)
                if (!st) v.ui.cell.hide()
            })
        },

        toggleCell: function(e) {
            e.preventDefault()
            this.ui.cell.slideToggle()
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
                app.alert({ message: 'Please selected some data sets to integrate' })
                return
            }

            var self = this
            var reqs = []
            // Integrate individually
            if (this.ui.ind.is(':checked')) {
                var jobs = 0

                var rps = []
                _.each(s, function(sw) {
                    var p = this.pipelines.findWhere({ VALUE: sw.get('PIPELINE') })

                    var reprocessing = new Reprocessing({
                        DATACOLLECTIONID: sw.get('ID'),
                        DISPLAYNAME: p.get('NAME'),
                        RECIPE: sw.get('PIPELINE'),
                    })

                    rps.push(reprocessing)

                    reqs.push(reprocessing.save({}, {
                        success: function() {
                            var reprocessingparams = new ReprocessingParameters()
                            
                            if (sw.get('RES')) reprocessingparams.add(new ReprocessingParameter({ 
                                PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                                PARAMETERKEY: 'd_min', 
                                PARAMETERVALUE: sw.get('RES')
                            }))

                            if (sw.get('LOWRES')) reprocessingparams.add(new ReprocessingParameter({
                                PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                                PARAMETERKEY: 'd_max',
                                PARAMETERVALUE: sw.get('LOWRES')
                            }))

                            var hascell = true
                            var cell = []
                            _.each(['CELL_A', 'CELL_B', 'CELL_C', 'CELL_ALPHA', 'CELL_BETA', 'CELL_GAMMA'], function(f, i) {
                                var val = self.$el.find('input[name='+f+']').val().replace(/\s/g, '')
                                if (!val) hascell = false
                                else cell.push(val)
                            })

                            if (hascell) reprocessingparams.add(new ReprocessingParameter({ 
                                PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                                PARAMETERKEY: 'unit_cell', 
                                PARAMETERVALUE: cell.join(',')
                            }))

                            if (sw.get('SG')) reprocessingparams.add(new ReprocessingParameter({ 
                                PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                                PARAMETERKEY: 'spacegroup', 
                                PARAMETERVALUE: sw.get('SG')
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

                            if (reprocessingparams.length) reqs.push(reprocessingparams.save())

                            var reprocessingsweep = new ReprocessingImageSweep({
                                PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                                DATACOLLECTIONID: sw.get('ID'),
                                STARTIMAGE: sw.get('selection')[0], 
                                ENDIMAGE: sw.get('selection')[1],
                            })
                            reqs.push(reprocessingsweep.save())
                            jobs++
                        },

                        error: function() {
                            app.alert({ message: 'Something went wrong starting that reprocessing run' })
                        }
                    }))

                }, this)

                $.when.apply($, reqs).done(function() {
                    app.message({ message: jobs+' reprocessing job(s) successfully submitted'})
                    _.each(rps, function(rp) {
                        self._enqueue({ PROCESSINGJOBID: rp.get('PROCESSINGJOBID') })
                    })
                })


            // Integrate sets togther
            } else {
                var p = this.pipelines.findWhere({ VALUE: self.ui.pipeline.val() })
                var reprocessing = new Reprocessing({
                    DATACOLLECTIONID: s[0].get('ID'),
                    COMMENTS: this.ui.com.val(),
                    DISPLAYNAME: p.get('NAME'),
                    RECIPE: self.ui.pipeline.val(),
                })

                if (s.length > 1 && self.ui.pipeline.val() == 'fast_dp') {
                    app.alert({ message: 'Fast DP can only integrate a single sweep' })
                    return
                }

                reqs.push(reprocessing.save({}, {
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

                        if (reprocessingparams.length) reqs.push(reprocessingparams.save())

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
                        reqs.push(reprocessingsweeps.save())

                        $.when.apply($, reqs).done(function() {
                            app.message({ message: '1 reprocessing job successfully submitted'})
                            self._enqueue({ PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID') })
                        })
                    },

                    error: function() {
                        app.alert({ message: 'Something went wrong starting that reprocessing run' })
                    }
                }))

            }
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
            this.collection = new IDDataCollections()
            if (options.model) {
                var nm = new IDDataCollection(options.model.toJSON())
                nm.set('CID', this.collection.length+1)
                this.collection.add(nm)
            }
        },

        onRender: function() {
            if (app.type != 'sm') this.ui.opts.hide()
            this.ui.cell.hide()
            this.$el.find('span input[type="text"]').css('width', '55px')

            const uspls = app.options.get('upstream_reprocessing_pipelines')
            if (uspls) {
                const pls = uspls[app.type] ?? uspls['default'];
                this.pipelines = new Pipelines(pls)
                this.ui.pipeline.html(this.pipelines.opts())
            }

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

            // asynchronously load space groups into the select menu
            this.showSpaceGroups()

            this.distlview = new DCDistlsView({ collection: this.collection, pipelines: this.pipelines, spacegroups: this.spacegroups })
            this.dcr.show(this.distlview)
            // this.listenTo(this.distlview, 'childview:set:cell', this.setCell, this)
            this.listenTo(this.distlview, 'childview:clone:dc', this.cloneDC, this)

            if (app.type == 'sm') this.$el.find('input[name=sm]').prop('checked', true)


        },

        cloneDC: function(e, model) {
            var nm = model.clone()
            nm.set('CID', this.collection.length+1)
            this.collection.add(nm)
            this.toggleIndividual()
        },
          
        setCell: function(view, ap) {
            console.log('set cell main view', view, ap)
            _.each({'a': 'a', 'b': 'b', 'c': 'c', 'alpha': 'al', 'beta': 'be', 'gamma': 'ga'}, function(k,f) {
                this.$el.find('input[name='+f+']').val(ap.get('CELL')['CELL_'+k.toUpperCase()])
            }, this)

            this.$el.find('select[name=sg]').val(ap.get('SG'))
        },

    })

})
