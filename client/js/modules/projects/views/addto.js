define(['marionette',
    'views/dialog',
    'collections/projects',
    'modules/projects/models/itemstate',
    'tpl!templates/projects/addto.html'], function(Marionette, DialogView, Projects, ProjectItemState, template) {


    return DialogView.extend({
        template: template,
        title: 'Add To Project',
        
        events: {
            'change @ui.project': 'checkItem',
        },
        
        ui: {
            project: 'select[name=project]',
        },
        
        initialize: function(options) {
            this.projects = new Projects()
            var self = this
            this.projects.fetch().done(function() {
                var opts = []
                self.projects.each(function(p) {
                    opts.push('<option value="'+p.get('PROJECTID')+'">'+p.get('ACRONYM')+'</option>')
                })
                self.ui.project.html(opts.join(''))
                self.checkItem()
            })
        },
        
        
        checkItem: function() {
            var self = this
            this.itemState = new ProjectItemState({ type: this.getOption('type'), pid: this.ui.project.val(), iid: this.getOption('iid') })
            this.itemState.fetch({
                success: function(x, m, o) {
                    var btns = {}
                    btns[self.itemState.get('state') == 1 ? 'Remove' : 'Add'] = 'processItem'
                    btns['Cancel'] = 'closeDialog'
                    
                    self.setButtons(btns)
                },
                error: function(x, m, o) {
                    
                }
                
            })
        },
        
        onRender: function() {
            this.$el.find('.title').text(this.getOption('name'))
        },
        
        processItem: function() {
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/projects/addto/pid/'+this.ui.project.val()+'/ty/'+this.getOption('type')+'/iid/'+this.getOption('iid')+(this.itemState.get('state') ? '/rem/1' : ''),
                
                success: function() {
                    self.closeDialog()
                },
                
                error: function() {
                
                },
            })
        },
    })
    
    
})