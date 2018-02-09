define(['marionette', 'backgrid', 
    'utils',
    'modules/projects/views/addto'], function(Marionette, Backgrid, utils, AddToProjectView) {
    

    var ValidatedCell = Backgrid.Cell.extend({
        fromRaw: function (value, model) {
            return value
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

            _.extend(this.model, Backbone.Validation.mixin)
        }
    })

  
    return {
        ValidatedCell: ValidatedCell,

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

                if (!this.column.get('test') || (this.column.get('test') && this.model.get(this.column.get('test')) && this.model.get(this.column.get('test')) != '0')) {
                    
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
    }
    
})
    