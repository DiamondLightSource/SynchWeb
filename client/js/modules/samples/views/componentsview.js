define(['marionette', 'utils/editable'], function(Marionette) {

    var ComponentView = Marionette.ItemView.extend({
        tagName: 'li',
        getTemplate: function() {
            return this.getOption('editable') 
                ? _.template('<%-ACRONYM%>: <input type="text" name="ABUNDANCE" /> <%-CONCENTRATIONTYPE%> <a href="#" class="delete button"><i class="fa fa-times"></i></a>')
                : (this.getOption('viewLink') && !this.model.get('new')
                	? _.template('<%-ACRONYM%>: <%-ABUNDANCE%> <%-CONCENTRATIONTYPE%> <a href="#" class="delete button"><i class="fa fa-times"></i></a> <% if(GLOBAL==0) { %><a href="/proteins/pid/<%-PROTEINID%>" class="button r"><i class="fa fa-search"></i> View All</a><% } %>')
                	: ((this.getOption('editinline') && this.model.get('new'))
                		? _.template('<%-ACRONYM%>: <input type="text" name="ABUNDANCE" /> <%-CONCENTRATIONTYPE%> <a href="#" class="save button"><i class="fa fa-check"></i></a> <a href="#" class="delete button"><i class="fa fa-times"></i></a>')
                		: (this.getOption('editinline')
                			? _.template('<%-ACRONYM%>: <%-ABUNDANCE%> <%-CONCENTRATIONTYPE%> <a href="#" class="delete button"><i class="fa fa-times"></i></a>')
                			: _.template('<%-ACRONYM%>: <%-ABUNDANCE%> <%-CONCENTRATIONTYPE%>')
                		)
                	)
                )
        },

        ui: {
        	ab: 'input[name=ABUNDANCE]',
        },

        events: {
            'click a.delete': 'remComp',
            'click a.save': 'addComp',
            // 'change @ui.ab': 'updateAbundance',

            'change input':  'validateField',
            'blur input':  'validateField',
            'keyup input':  'validateField',
        },


		validateField: function(e) {
            // Dont validate if we're in editable mode
            if ($(e.target).closest('.editable').length) return
                
            var attr = $(e.target).attr('name')
            var val = $(e.target).val()
            
            console.log('update component', this)
            this.model.set(attr,val)
            var error = this.model.preValidate(attr, val)
            if (error) $(e.target).addClass('ferror')
            else $(e.target).removeClass('ferror')
        },

        updateAbundance: function(e) {
        	this.model.set({ ABUNDANCE: this.ui.ab.val() })
        },

        addComp: function(e) {
        	e.preventDefault()
        	Backbone.ajax({
        		url: app.apiurl+'/sample/components',
        		type: 'POST',
        		data: {
        			BLSAMPLETYPEID: this.getOption('CRYSTALID'),
        			COMPONENTID: this.model.get('PROTEINID'),
        			ABUNDANCE: this.model.get('ABUNDANCE'),
        		},
        		success: this.compAdded.bind(this)
        	})
        },

        compAdded: function(response) {
        	this.model.set('new', false)
        	this.render()
        },

        remComp: function(e) {
            e.preventDefault()

            if (this.getOption('editinline') && !this.model.get('new')) {
            	var self = this
            	Backbone.ajax({
            		url: app.apiurl+'/sample/components/'+this.getOption('CRYSTALID')+'-'+this.model.get('PROTEINID'),
        			type: 'DELETE',
        			dataType: 'json',
        			success: function(response) {
        				self.model.collection.remove(self.model)
        			}
            	})

            } else this.model.collection.remove(this.model)
        },

        initialize: function(options) {
        	Backbone.Validation.bind(this)
        },

        onRender: function() {
        	this.ui.ab.val(this.model.get('ABUNDANCE'))
        },
    })

	var EmptyView = Marionette.ItemView.extend({
		tagName: 'li',
		template: _.template('No Components')
	})

   	return ComponentsView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: ComponentView,
        className: function() {
        	if (this.getOption('viewLink')) return 'visits'
        },

        initialize: function(options) {
            console.log('cv opts', options)
        },

        getEmptyView: function() {
        	return this.getOption('showEmpty') ? EmptyView : null
        },

        childViewOptions: function() {
            return {
                editable: this.getOption('editable'),
                editinline: this.getOption('editinline'),
                viewLink: this.getOption('viewLink'),
                CRYSTALID: this.getOption('CRYSTALID'),
            }
        },
    })


})