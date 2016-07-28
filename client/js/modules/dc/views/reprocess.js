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
			sel: '.selection',
		},

		events: {
			'click .cells': 'sendCell',
			'click a.add': 'clone',
			'click a.rem': 'rem',
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
        	this.ui.sel.html('Images '+x1+' to '+x2+' selected')
        },

        setDeselection: function() {
        	DCDistlView.prototype.setDeselection.apply(this)
        	this.ui.sel.html('No images selected')
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


		buttons: {
			Integrate: 'integrate',
			Close: 'closeDialog',
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
			var distlview = new DCDistlsView({ collection: this.collection })
			this.dcr.show(distlview)
		    this.listenTo(distlview, 'childview:set:cell', this.setCell, this)
		    this.listenTo(distlview, 'childview:clone:dc', this.cloneDC, this)
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