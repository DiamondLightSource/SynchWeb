define(['marionette', 
    'views/dialog',
    'modules/projects/views/addto',
    'modules/dc/views/dccomments',
    'modules/dc/views/attachments',
    'templates/dc/dc_title.html',
    ], function(Marionette, 
        DialogView,
        AddToProjectView,
        DCCommentsView,
        AttachmentsView,
        title_template
    ) {


    var DCTitleBase = Marionette.LayoutView.extend({
        template: title_template,

        attachments: true,
        comments: true,

        extraButtons: null,

        ui: {
            extra: '.extra',
            batt: '.button.attachments',
            bcom: '.button.comments',
        },

        onRender: function() {
            if (this.ui.batt) this.getOption('attachments') ? this.ui.batt.show() : this.ui.batt.hide()
            if (this.ui.bcom) this.getOption('comments') ? this.ui.bcom.show() : this.ui.bcom.hide()

            if (this.getOption('extraButtons')) {
                this.extraView = new (this.getOption('extraButtons'))({ 
                    model: this.model, 
                    templateHelpers: this.getOption('templateHelpers'),
                    el: this.ui.extra
                })
                this.extraView.render()
            }
        }
    })


    var DCBaseView = Marionette.LayoutView.extend({
        titleView: DCTitleBase,
        fullPath: false,

        modelEvents: {
            'change': 'updateInPlace',
        },

        _baseUI: function() {
            return {
                title: 'h1.title',
                ul: 'ul',
            }
        },

        _baseEvents: function() {
            return {
                'click .atp': 'addToProject',
                'click .flag': 'flag',
                'click .comments': 'showComments',
                'click a.sn': 'showSnapshots',
                'click i.expand': 'expandPath',
                'click a.attach': 'attachments',
                'click li.sample a': 'setProposal',
            }
        },

        delegateEvents: function(events) {
            this.ui = _.extend(this._baseUI(), _.result(this, 'ui'));
            this.events = _.extend(this._baseEvents(), _.result(this, 'events'));
            return DCBaseView.__super__.delegateEvents.call(this, events);
        },
            
        updateDCC: function(value) {
            console.log('updateDCC', this.ui.dcglink, this.model)
            if (this.model.get('DCC') > 1) {
                this.$el.find('li.group').show()
                this.$el.find('.dcglink').show()
                this.$el.find('.dclink').hide()
            } else {
                this.$el.find('li.group').hide()
                this.$el.find('.dcglink').hide()
                this.$el.find('.dclink').show()
            }

            return value
        },

        updateBLSAMPLEID: function(value) {
            value > 0 ? this.$el.find('li.sample').show() : this.$el.find('li.sample').hide()
            return value
        },

        updateFLAG: function(value) {
            value ? this.$el.find('.flag').addClass('button-highlight') : this.$el.find('.flag').removeClass('button-highlight')
            return value
        },

        updateInPlace: function(all) {
            var attrs = all ? this.model.attributes : this.model.changedAttributes()
            _.each(attrs, function(value, key) {
                var attrEl = this.$el.find('.'+key)
                var updatefn = 'update'+key
                if (attrEl && value !== null) {
                    if (this[updatefn]) value = this[updatefn](value)
                    attrEl.text(value)
                }
            }, this)
        },

        flag: function(e) {
            e.preventDefault()
            this.model.flag()
        },

        showComments: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'Data Collection Comments', view: new DCCommentsView({ model: this.model }), autoSize: true }))
        },

        showSnapshots: function(e) {
            e.preventDefault()
            this.$el.find('.snapshots a').eq(0).trigger('click')
        },
          
        addToProject: function(e) {
            console.log("show add to project")
            e.preventDefault()
            app.dialog.show(new AddToProjectView({ name: this.model.get('DIR')+this.model.get('FILETEMPLATE'), type: 'dc', iid: this.model.get('DCG') }))
        },

        expandPath: function(e) {
            e.preventDefault()

            this.$el.find('span.temp').text(this.fullPath ? (this.model.get('DIR')+this.model.get('FILETEMPLATE')) : (this.model.get('DIRFULL')+this.model.get('FILETEMPLATE')))
            this.$el.find('i.expand').toggleClass('fa-caret-right')
            this.$el.find('i.expand').toggleClass('fa-caret-left')
            
            this.fullPath = !this.fullPath
        },

        setProposal: function(e) {
            console.log('setting proposal', this.model.get('PROP'))
            if (this.model.get('PROP')) app.cookie(this.model.get('PROP'))
        },

        attachments: function(e) {
            e.preventDefault()

            var d = []
            if (this.model.get('DCC') > 1) d.dcg = this.model.get('DCG')
            else d.id = this.model.get('ID')

            app.dialog.show(new DialogView({ 
                title: 'Attachments', 
                view: new AttachmentsView(d)
            }))
        },

        onRender: function() {
            this.titleView = new (this.getOption('titleView'))({ 
                model: this.model, 
                templateHelpers: this.getOption('templateHelpers'), 
                extraButtons: this.getOption('extraButtons'),
                el: this.ui.title,
            })
            this.titleView.render()

            var vis_link =this.getOption('templateHelpers')()['VIS_LINK']
            this.ui.ul.prepend('<li class="group">Group: <a href="/dc/visit/'+vis_link+'/dcg/'+this.model.escape('DCG')+'"><span class="DCC">'+this.model.escape('DCC')+'</span> Data Collections</a></li>')
            this.ui.ul.prepend('<li class="sample"><span class="wrap">Sample: <a href="/samples/sid/'+this.model.escape('BLSAMPLEID')+'">'+this.model.escape('SAMPLE')+'</a></span></li>')
            
            this.updateBLSAMPLEID()
            this.updateInPlace(true)
        }

    })

    DCBaseView.TitleView = DCTitleBase

    return DCBaseView

})
