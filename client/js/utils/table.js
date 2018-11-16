define(['marionette', 'backgrid', 
    'utils',
    'modules/projects/views/addto',
    'backbone', 'backbone-validation'], function(Marionette, Backgrid, utils, 
        AddToProjectView, 
        Backbone) {
    

    var ValidatedCell = Backgrid.Cell.extend({
        fromRaw: function (value, model) {
            return value == null ? '' : value
        },

        toRaw: function(value, model) {
            var prop = this.column.get('name')
            var msg = this.model.preValidate(prop, value)
            console.log(prop, msg, model.validation[prop])

            if (msg) this.$el.find('input').addClass('ferror')
            else this.$el.find('input').removeClass('ferror')

            return msg ? undefined : value
        },

        initialize: function(options) {
            ValidatedCell.__super__.initialize.call(this,options)

            this.formatter.toRaw = this.toRaw.bind(this)
            this.formatter.fromRaw = this.fromRaw.bind(this)

            _.extend(this.model.__proto__, Backbone.Validation.mixin)
        }
    })



    var ValidatedTemplateCell = Backgrid.Cell.extend({
        events: {
            'change input': 'updateModel',
            'blur input': 'updateModel',
            'keyup input': 'updateModel',
            'change select': 'updateModel',
        },

        updateModel: function(e) {
            console.log('up mod', $(e.target).attr('name'))
            this.model.set($(e.target).attr('name'), $(e.target).val())
            this.validate({ attr: $(e.target).attr('name'), val: $(e.target).val() })
            this.preSave()
        },

        preSave: function() {
            if (this.model.isValid(true)) {
                var ch = this.model.changedAttributes()
                if (ch && !(Object.keys(ch).length == 1 && ('isSelected' in ch || '_valid' in ch))) {
                    console.log('attrs changed', this.model.changedAttributes())
                    this.model.save(this.model.attributes, { patch: true })   
                }

            } else {
                console.log('model invalid')
            }
        },

        validate: function(options) {
            var error = this.model.preValidate(options.attr, options.val)
            var attr = this.$el.find('[name='+options.attr+']')
            if (error) this.invalid(attr, error)
            else this.valid(attr)
        },

        invalid: function(attr, error) {
            $(attr).removeClass('fvalid').addClass('ferror')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            $(attr).removeClass('ferror').addClass('fvalid').siblings('span.errormessage').remove()
        },

        initialize: function(options) {
            ValidatedTemplateCell.__super__.initialize.call(this,options)
            this.preSave = _.debounce(this.preSave, 1000)
            this.updateModel = _.debounce(this.updateModel, 100)
        },

        bindModel: function() {
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
                model: this.model,
                selector: 'name',
                valid: function(view, attr) {
                    view.valid(view.$el.find('[name='+attr+']'))
                },
                invalid: function(view, attr, error) {
                    view.invalid(view.$el.find('[name='+attr+']'), error)
                }
            })
        },
    })

  
    return {
        ValidatedCell: ValidatedCell,
        ValidatedTemplateCell: ValidatedTemplateCell,

        ClickableRow: Backgrid.Row.extend({
            events: {
                'click': 'onClick',
            },
            
            onClick: function(e) {
                if ($(e.target).is('i') || $(e.target).is('a') || $(e.target).is('input') || $(e.target).hasClass('editable')) return
                if (this.cookie && this.model.get('PROP')) app.cookie(this.model.get('PROP'))
                app.trigger(this.event, this.model.get(this.argument))
            },
        }),

        BGSelectRow: Backgrid.Row.extend({
            events: {
                'click': 'onClick',
            },
            onClick: function(e) {
                if ($(e.target).is('input[type=checkbox]')) return
                this.model.trigger('backgrid:select', this.model, !this.$el.find('input[type=checkbox]').is(':checked'))
            },
        }),
        
        TemplateCell: Backgrid.Cell.extend({
            render: function() {
                this.$el.empty();

                if (!this.column.get('test') || 
                    (this.column.get('test') && Object.prototype.toString.call(this.model.get(this.column.get('test'))) !== '[object Array]' && this.model.get(this.column.get('test')) != '0') ||
                    (this.column.get('test') && Object.prototype.toString.call(this.model.get(this.column.get('test'))) === '[object Array]' && this.model.get(this.column.get('test')).length)) {
                    
                    var temp = _.isFunction(this.getTemplate) ? _.result(this, 'getTemplate') : this.column.get('template')
                    var t = _.isFunction(temp) ? temp : _.template(temp)

                    var data = _.extend({}, this.model.toJSON(), { APIURL: app.apiurl })
                    this.$el.html(t(data))
                }
                
                this.delegateEvents();
                return this;
            }
        }),
        
        ProjectCell: Backgrid.Cell.extend({
            events: {
              'click a.atp': 'addToProject',
            },
              
            addToProject: function(e) {
              e.preventDefault()
              app.dialog.show(new AddToProjectView({ name: this.model.get(this.column.get('itemname')), type: this.column.get('itemtype'), iid: this.model.get(this.column.get('itemid')) }))
            },
              
            render: function() {
              this.$el.append('<a class="button button-notext atp"><i class="fa fa-book"></i> <span>Add to Project</span></a>')
              return this
            }
        }),
        
        HTMLCell: Backgrid.Cell.extend({
            render: function(column) {
                this.$el.empty();
                this.$el.html(this.model.get(this.column.get('name')));
                if (!this.column.get('center')) this.$el.addClass('la')
                this.delegateEvents();
                return this;
            }
        }),

        StatusCell: Backgrid.Cell.extend({
            render: function() {
                this.$el.empty()
                
                var st = ''
                _.each(['R', 'GR', 'SC', 'AI', 'DC', 'AP'], function(t) {
                    if (this.model.get(t) > 0) st = '<li class="'+t+'"></li>'
                }, this)
                
                if (st) this.$el.append('<ul class="status">'+st+'</ul>')
                
                return this
            }
        }),

        ShadedCell: Backgrid.Cell.extend({
            render: function() {
                var val = this.model.get(this.column.get('name'))
                this.$el.text(val)

                var vals = this.model.collection.fullCollection.pluck(this.column.get('name'))
                var avg = _.reduce(vals, function(v, n) { return v + n }, 0) / vals.length

                col = null
                if (val > avg) {
                    col = utils.shadeColor('#00cc00', 1-(0.35*(val/avg)))
                }

                if (val < avg) {
                    col = utils.shadeColor('#cc0000', 0.55*(val/avg))
                }

                if (col) this.$el.css('background-color', col)

                return this
            }
        }),

        SelectInputCell: Backgrid.SelectCell.extend({
            optionValues: function() {
                return this.column.get('options').array({ none: this.column.get('none')} )
            }
        }),
    }
    
})
    