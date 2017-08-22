define(['marionette', 'views/dialog',
    'collections/datacollections',
    'models/datacollection',
    'modules/mc/views/dcdistl',
    'tpl!templates/dc/reprocess.html', 'tpl!templates/dc/reprocess_dc.html'], function(Marionette, DialogView,
        DataCollections, DataCollection, DCDistlView,
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
            a: '.a',
            b: '.bb',
            c: '.c',
            al: '.al',
            be: '.be',
            ga: '.ga',
            cell: 'div.cell',
            st: 'input[name=start]',
            en: 'input[name=end]',
            ind: 'div.ind',
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

            if (this.ui.st.val() > (si+ni)) this.ui.st.val(si+ni)
            if (this.ui.st.val() < si) this.ui.st.val(si)

            if (this.ui.en.val() > (si+ni)) this.ui.en.val(si+ni)
            if (this.ui.en.val() < si) this.ui.en.val(si)

            this.plotview.setSelection(parseInt(this.ui.st.val()), parseInt(this.ui.en.val()))
        },

        initialize: function(options) {
            DCDistlView.prototype.initialize.apply(this, arguments)
            this.updateSelection = _.debounce(this.updateSelection, 500)
        },

        setInd: function(ind) {
            ind ? this.ui.ind.show() : this.ui.ind.hide()
            ind ? this.$el.find('ul').removeClass('half') : this.$el.find('ul').addClass('half')
        },

        onRender: function() {
            // DCDistlView.prototype.onRender.apply(this, arguments)
            this.ui.cell.hide()
            this.ui.ind.hide()
            this.$el.find('ul').addClass('half')
            this.$el.find('li input[type="text"]').css('width', '25%')
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

        setCell: function() {
            if (this.aps.length) {
                var e = this.aps.at(0)
                var c = e.get('CELL')

                this.ui.a.text(c['CELL_A'])
                this.ui.b.text(c['CELL_B'])
                this.ui.c.text(c['CELL_C'])
                this.ui.al.text(c['CELL_AL'])
                this.ui.be.text(c['CELL_BE'])
                this.ui.ga.text(c['CELL_GA'])
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
    })

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
                VISIT: this.getOption('VISIT')
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

            var data = { visit: this.getOption('visit'), multi: 1 }
            var integrate = []
            _.each(s, function(s, i) {
                integrate.push([s.get('ID'), s.get('selection')[0], s.get('selection')[1]])
            })

            data.int = integrate
            data.recipes = this.ui.met.val()

            _.each(['a', 'b', 'c', 'alpha', 'beta', 'gamma', 'res', 'sg'], function(f, i) {
                data[f] = this.$el.find('input[name='+f+']').val().replace(/\s/g, '')
            }, this)

            Backbone.ajax({
                url: app.apiurl+'/mc/integrate',
                data: data,
                type: 'POST',

                success: function() {
                    app.alert({ message: s.length+' job(s) successfully submitted'})
                },

                error: function() {
                    app.alert({ message: 'Something went wrong submitting these jobs, please try again'})
                }
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

            _.each(['xia2 3dii', 'xia2 dials'], function(t,i) {
                this.ui.met.append('<option value="'+(i+1)+'">'+t+'</option>')
            }, this)

            this.distlview = new DCDistlsView({ collection: this.collection })
            this.dcr.show(this.distlview)
            this.listenTo(this.distlview, 'childview:set:cell', this.setCell, this)
            this.listenTo(this.distlview, 'childview:clone:dc', this.cloneDC, this)
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