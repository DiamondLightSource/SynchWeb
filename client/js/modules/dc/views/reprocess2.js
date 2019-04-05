define(['marionette', 'views/dialog',
    'collections/datacollections',
    'models/datacollection',
    'modules/mc/views/dcdistl',
    'models/reprocessing',
    'collections/reprocessings',
    'models/reprocessingparameter',
    'collections/reprocessingparameters',
    'models/reprocessingimagesweep',
    'collections/reprocessingimagesweeps',
    'utils/kvcollection',
    'tpl!templates/dc/reprocess.html', 'tpl!templates/dc/reprocess_dc.html'], function(Marionette, DialogView,
        DataCollections, DataCollection, DCDistlView,
        Reprocessing, Reprocessings,
        ReprocessingParameter, ReprocessingParameters,
        ReprocessingImageSweep, ReprocessingImageSweeps,
        KVCollection, 
        template, dctemplate) {
    

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
            method: 'select[name=method]',
            res: 'input[name=res]',
            sg: 'input[name=SG]',
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
            'change @ui.sg': 'updateCell',

            'change @ui.method': 'updateMethod',
            'change @ui.res': 'updateRes',
        },


        updateRes: function() {
            this.model.set('RES', this.ui.res.val())
        },

        updateMethod: function() {
            this.model.set('METHOD', this.ui.method.val())
        },

        updateCell: function(e) {
            var attr = $(e.target).attr('name')
            var val = $(e.target).val()

            this.model.set(attr, val)
        },


        selectAll: function(e) {
            e.preventDefault()

            var si = parseInt(this.model.get('SI'))
            var ni = parseInt(this.model.get('NUMIMG'))

            this.ui.st.val(si)
            this.ui.en.val(si+ni-1)
            this.updateSelection()
        },

        updateSelection: function() {
            var si = parseInt(this.model.get('SI'))
            var ni = parseInt(this.model.get('NUMIMG'))

            if (this.ui.st.val() > (si+ni-1)) this.ui.st.val(si+ni-1)
            if (this.ui.st.val() < si) this.ui.st.val(si)

            if (this.ui.en.val() > (si+ni-1)) this.ui.en.val(si+ni-1)
            if (this.ui.en.val() < si) this.ui.en.val(si)

            this.plotview.setSelection(parseInt(this.ui.st.val()), parseInt(this.ui.en.val()))
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
            this.ui.method.html(this.getOption('pipelines').opts())
            this.model.set('METHOD', this.ui.method.val())
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
                var e = this.aps.at(0)
                var c = e.get('CELL')

                this.ui.a.val(c['CELL_A']).trigger('change')
                this.ui.b.val(c['CELL_B']).trigger('change')
                this.ui.c.val(c['CELL_C']).trigger('change')
                this.ui.al.val(c['CELL_AL']).trigger('change')
                this.ui.be.val(c['CELL_BE']).trigger('change')
                this.ui.ga.val(c['CELL_GA']).trigger('change')

                this.ui.sg.val(e['SG']).trigger('change')
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
                pipelines: this.getOption('pipelines')
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
            met: 'select[name=method]',
            com: 'input[type=comments]',
        },

        buttons: {
            Integrate: 'integrate',
            Close: 'closeDialog',
        },

        events: {
            'click a.sgm': 'toggleCell',
            'click a.opt': 'toggleOpts',
            'click @ui.ind': 'toggleIndividual',
        },

        templateHelpers: function() {
            return {
                VISIT: this.getOption('visit')
            }
        },

        toggleIndividual: function(e) {
            var st = this.ui.ind.is(':checked')
            st ? this.ui.mul.hide() : this.ui.mul.show()
            this.distlview.children.each(function(v) {
                v.setInd(st)
            })
        },

        toggleCell: function(e) {
            e.preventDefault()
            this.ui.cell.slideToggle()
        },

        toggleOpts: function(e) {
            e.preventDefault()
            this.ui.opts.slideToggle()
        },

        integrate: function(e) {
            e.preventDefault()
            var s = this.collection.where({ selected: true })

            if (!s.length) {
                app.alert({ message: 'Please selected some data sets to integrate' })
                return
            }

            var self = this
            // Integrate individually
            if (this.ui.ind.is(':checked')) {
                var jobs = 0

                var reqs = []
                var rps = []
                _.each(s, function(sw) {
                    var p = this.pipelines.findWhere({ VALUE: sw.get('METHOD') })

                    var reprocessing = new Reprocessing({
                        DATACOLLECTIONID: sw.get('ID'),
                        DISPLAYNAME: p.get('NAME'),
                        RECIPE: sw.get('METHOD'),
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

                })

                $.when.apply($, reqs).done(function() {
                    app.alert({ message: jobs+' reprocessing job(s) successfully submitted'})
                    _.each(rps, function(rp) {
                        self.enqueue({ PROCESSINGJOBID: rp.get('PROCESSINGJOBID') })
                    })
                })


            // Integrate sets togther
            } else {
                var p = this.pipelines.findWhere({ VALUE: self.ui.met.val() })
                var reprocessing = new Reprocessing({
                    DATACOLLECTIONID: s[0].get('ID'),
                    COMMENTS: this.ui.com.val(),
                    DISPLAYNAME: p.get('NAME'),
                    RECIPE: self.ui.met.val(),
                })

                if (s.length > 1 && self.ui.met.val() == 'fast_dp') {
                    app.alert({ message: 'Fast DP can only integrate a single sweep' })
                    return
                }

                var reqs = []
                reqs.push(reprocessing.save({}, {
                    success: function() {
                        var reprocessingparams = new ReprocessingParameters()

                        var res = self.$el.find('input[name=res]').val()
                        if (res) reprocessingparams.add(new ReprocessingParameter({ 
                            PROCESSINGJOBID: reprocessing.get('PROCESSINGJOBID'),
                            PARAMETERKEY: 'd_min', 
                            PARAMETERVALUE: res
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

                        var sg = self.$el.find('input[name=sg]').val().replace(/\s/g, '')
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
                            app.alert({ message: '1 reprocessing job successfully submitted'})
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
            this.ui.opts.hide()
            this.ui.cell.hide()

            this.pipelines = new Pipelines([
                { NAME: 'Xia2 3dii', VALUE: 'xia2-3dii' },
                { NAME: 'Xia2 DIALS', VALUE: 'xia2-dials' },
                { NAME: 'Fast DP', VALUE: 'fast_dp' },
            ])

            this.ui.met.html(this.pipelines.opts())

            this.distlview = new DCDistlsView({ collection: this.collection, pipelines: this.pipelines })
            this.dcr.show(this.distlview)
            // this.listenTo(this.distlview, 'childview:set:cell', this.setCell, this)
            this.listenTo(this.distlview, 'childview:clone:dc', this.cloneDC, this)

            if (app.type == 'sm') this.$el.find('input[name=sm]').prop('checked', true)
        },

        cloneDC: function(e, model) {
            var nm = model.clone()
            nm.set('CID', this.collection.length+1)
            this.collection.add(nm)
        },
          
        setCell: function(view, ap) {
            console.log('set cell main view', view, ap)
            _.each({'a': 'a', 'b': 'b', 'c': 'c', 'alpha': 'al', 'beta': 'be', 'gamma': 'ga'}, function(k,f) {
                this.$el.find('input[name='+f+']').val(ap.get('CELL')['CELL_'+k.toUpperCase()])
            }, this)

            this.$el.find('input[name=sg]').val(ap.get('SG'))
        },

    })

})