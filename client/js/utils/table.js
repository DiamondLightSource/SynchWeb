define(['marionette', 'backgrid', 'modules/projects/views/addto'], function(Marionette, Backgrid, AddToProjectView) {
    
  
    return {
        ClickableRow: Backgrid.Row.extend({
            events: {
                'click': 'onClick',
            },
            
            onClick: function(e) {
                if ($(e.target).is('i') || $(e.target).is('a') || $(e.target).hasClass('editable')) return
                if (this.cookie && this.model.get('PROP')) app.cookie(this.model.get('PROP'))
                app.trigger(this.event, this.model.get(this.argument))
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
                _.each(['R', 'SC', 'AI', 'DC', 'AP'], function(t) {
                    if (this.model.get(t) > 0) st = '<li class="'+t+'"></li>'
                }, this)
                
                if (st) this.$el.append('<ul class="status">'+st+'</ul>')
                
                return this
            }
        }),
    }
    
})
    