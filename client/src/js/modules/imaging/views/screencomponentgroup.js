define(['marionette', 'backbone', 'views/table', 'views/validatedrow', 'utils',
		'modules/shipment/collections/distinctproteins',
		'modules/imaging/collections/screencomponents',
		'modules/imaging/models/screencomponent',
        'utils/editable',
        'templates/imaging/screencomponentgroup.html',
        'templates/imaging/screencomprow.html',
        'templates/imaging/screencomprownew.html',
		'jquery'
        ], function(Marionette, Backbone, 
        	TableView, ValidatedRow, utils,
        	DistinctProteins,
        	ScreenComponents, ScreenComponent,
        	Editable, 
        	template, rowtemplate, rowtemplatenew, $) {

    var ComponentGridRow = ValidatedRow.extend({
    	editable: true,
    	getTemplate: function() {
    		return this.model.get('new') || this.model.get('edit') ? rowtemplatenew : rowtemplate
    	},

    	templateHelpers: function() {
    		return {
    			editable: this.getOption('editable')
    		}
    	},

    	events: {
    		'click a.edit': 'edit',
    		'click a.cancel': 'cancel',
    		'click a.delete': 'delete',
    	},

    	ui: {

    	},

    	setData: function() {
            var data = {}
            _.each(['CONCENTRATION', 'PH'], function(f) {
                data[f] = $('[name='+f+']').val()
            })
            this.model.set(data)
        },

        success: function() {
        	this.model.set({ edit: false })
        	this.model.set({ new: false })
        	this.render()
        },

        failure: function() {
        	app.alert({ message: 'Something went wrong registering that component' })
        },

    	edit: function(e) {
    		e.preventDefault()
    		this.model.set({ edit: true })
    		this.render()
    	},

    	cancel: function(e) {
    		e.preventDefault()

    		if (this.model.get('edit')) {
    			this.model.set({ edit: false })
    			this.render()
    		} else {
    			this.model.collection.remove(this.model)
    		}
    	},

    	delete: function(e) {
    		e.preventDefault()
    		this.model.destroy()
    	},

    	onRender: function() {
    		if (this.model.get('edit') || this.model.get('new')) {
    			_.each(['CONCENTRATION', 'PH'], function(f) {
                	if (this.model.get(f)) this.$el.find('input[name='+f+']').val(this.model.get(f))
            	}, this)
    		}
    	}
    })

    var EmptyComponentView = ValidatedRow.extend({
    	template: '<tr><td colspan="5">No components for this group</td></tr>'
    })


	return Marionette.CompositeView.extend({
		editable: true,
		template: template,
		childView: ComponentGridRow,
		emptyView: EmptyComponentView,

		childViewContainer: 'tbody',
		childViewOptions: function() {
			return {
				editable: this.getOption('editable')
			}
		},

		templateHelpers: function() {
    		return {
    			canSave: !(this.model && this.model.get('SCREENCOMPONENTGROUPID') > 0),
    			editable: this.getOption('editable'),
    		}
    	},

		ui: {
			add: 'input[name=addcomp]'
		},

		events: {
			'click button.submit': 'saveGroup',
		},

		saveGroup: function(e) {
			e.preventDefault()
			console.log('submit')
			if (this.model) {
				console.log(this.model)
				this.model.save({}, {
					success: this.onSave.bind(this),
					error: function() {
						app.alert({ message: 'Something went wrong registering the group' })
					}
				})
			}
		},

		onSave: function() {
			this.model.set({ new: false })

			if (this.collection.length) {
				this.collection.each(function(m) {
					m.set('SCREENCOMPONENTGROUPID', this.model.get('SCREENCOMPONENTGROUPID'))
				}, this)

				this.components.save({
					success: this.onSaveCollection.bind(this),
					failure: function() {
						app.alert({ message: 'Something went wrong registering the group components' })
					}
				})

			} else this.render()
		},

		onSaveCollection: function() {
			this.components.each(function(m) {
				m.set({ new: false })
			})

			this.render()
		},


		initialize: function(options) {
			this.collection = new ScreenComponents()

			this.components = options && options.components
			this.listenTo(this.components, 'add remove sync', this.selectComponents, this)


			this.componentlist = new DistinctProteins()
			// this._ready = []
			// this._ready.push(this.componentlist.fetch())
		},

		onRender: function() {
			this.ui.add.autocomplete({ source: this.getComponentList.bind(this), select: this.addComponent.bind(this) })
		},

		getComponentList: function(req, resp) {
            var self = this
            this.componentlist.fetch({
                data: {
                    term: req.term,
                    global: 1,
                },
                success: function() {
                    resp(self.componentlist.map(function(m) {
                        return {
                            value: m.get('NAME') || m.get('ACRONYM'),
                            id: m.get('PROTEINID'),
                        }
                    }))
                }
            })
        },

		addComponent: function(e, ui) {
			e.preventDefault()
			var component = this.componentlist.findWhere({ PROTEINID: ui.item.id })
			if (component) {
				this.components.add(new ScreenComponent({
					SCREENCOMPONENTGROUPID: this.model.get('SCREENCOMPONENTGROUPID'),
					COMPONENTID: component.get('PROTEINID'),
					COMPONENT: component.get('NAME') || component.get('ACRONYM'),
					UNIT: component.get('UNIT'),
					HASPH: component.get('HASPH'),
					POSITION: this.model.get('POSITION'),

					new: true,
					canSave: this.model.get('SCREENCOMPONENTGROUPID') > 0
				}))
			}

			this.ui.add.val('')
		},


		setModel: function(s) {
			this.undelegateEvents()
			this.model = s
			this.delegateEvents()

			this.selectComponents()
			this.render()
		},

		selectComponents: function() {
			let cs;
			if (this.model) {
				cs = this.components.where({ POSITION: this.model.get('POSITION') });
			} else {
				cs = [];
			}
			this.collection.reset(cs)
		}

	})

})