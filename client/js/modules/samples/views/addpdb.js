define(['backbone', 'views/dialog', 'modules/samples/models/pdb', 'modules/samples/collections/pdbs', 'tpl!templates/samples/addpdb.html', 'backbone-validation', 'jquery-ui'], function(Backbone, DialogView, PDB, PDBs, template) {


    return DialogView.extend({
        template: template,
        className: 'form',
        title: 'Add PDB to Protein',
        
        ui: {
            exist: 'select[name=existing_pdb]',
            type: 'select[name=type]',
            prog: '.progress',
        },
        
        events: {
            'change @ui.type': 'showType',
            'change @ui.exist': 'validateField',
            'change input': 'validateField',
            'keyup @ui.exist': 'validateField',
            'keyup input': 'validateField',
        },
        
        
        showType: function() {
            this.$el.find('.ty').hide()
            this.$el.find('.'+this.ui.type.val()).show()
        },
        
        buttons: {
            'Add': 'addPDB',
            'Cancel': 'closeDialog',
        },
        
        addPDB: function() {
            this.ui.prog.show()
            
            var vals = {}
            if (this.ui.type.val() == 'pdb_file') vals.pdb_file = this.$el.find('input[name=pdb_file]')[0].files[0]
            else vals[this.ui.type.val()] = this.$el.find('[name="'+this.ui.type.val()+'"]').val()
            
            this.model.set(vals)

            var self = this
            if (this.model.isValid(true)) {
                this.model.save({}, {
                    success: function(xhr, model, options) {
                        self.ui.prog.hide()
                        self.closeDialog()
                        self.trigger('pdb:success')
                    },
                    error: function(xhr, model, options) {
                        self.trigger('error', xhr, model, options)
                    },
                })
            }
            
        },
        
        updateProgress: function(value) {
            this.ui.prog.progressbar({ 'value': value })
        },
        
        initialize: function(options) {
            this.model = new PDB({ PROTEINID: options.pid })
            this.setupValidation()
            this.listenTo(this.model, 'model:progress', this.updateProgress, this)
            
            this.pdbs = new PDBs()
            var self = this
            this.pdbs.fetch().done(function() {
                self.ui.exist.html(self.pdbs.opts())
            })
        },
        
        onRender: function() {
            this.showType()
            this.ui.prog.progressbar({ value: 0 });
            this.ui.prog.hide()
        },
        
        
        validateField: function(e) {
            var attr = $(e.target).attr('name')
            var val = e.target.files ? e.target.files[0] : $(e.target).val()
            console.log('validating', attr, val)
            
            var error = this.model.preValidate(attr, val)
            if (error) this.invalid(e.target, error)
            else this.valid(e.target)
        },
        
        
        invalid: function(attr, error) {
            $(attr).removeClass('fvalid').addClass('ferror')
            if (!$(attr).siblings('span.errormessage').length) $(attr).after('<span class="errormessage ferror">'+error+'</span>')
            else $(attr).siblings('span.errormessage').text(error)
        },
        
        valid: function(attr) {
            $(attr).removeClass('ferror').addClass('fvalid').siblings('span.errormessage').remove()
        },
        
        setupValidation: function() {
            Backbone.Validation.unbind(this)
            Backbone.Validation.bind(this, {
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


})