define(['marionette',
    'backbone',
    'modules/cell/collections/datacollections',
    'views/pages',
    'templates/cell/cell.html',
    'templates/cell/item.html'],
    function(Marionette,
        Backbone,
        DCs,
        Pages,
        template,
        itemtemplate) {

    var DCItem = Marionette.ItemView.extend({
        template: itemtemplate,
        className: 'cells data_collection clearfix',
        
        initialize: function() {
            var us = []
            _.each(this.model.get('USERS'), function(u) {
                var last = $(u.split(' ')).get(-1)
                if (this.getOption('authors').toLowerCase().indexOf(last.toLowerCase()) > -1) us.push('<span class="found">'+u+'</span>')
                    else us.push(u)
            }, this)
            
            this.options.templateHelpers = { us: us }
        }
    })
    
    var NoDCs = Marionette.ItemView.extend({
        className: 'data_collection',
        template: _.template('<div>No data collections found</div>')
        
    })
    
    return Marionette.CompositeView.extend({
        template: template,
        className: 'content',
        
        childView: DCItem,
        childViewContainer: '.data_collections',
        childViewOptions: function() {
            return {
                authors: $('.pdb_details .author').html()
            }
        },
        emptyView: NoDCs,
        
        templateHelpers: function() {
            return {
                cell: this.getOption('cell'),
                pdb: this.getOption('pdb'),
            }
        },
        
        
        ui: {
            get: 'a.get',
            lookup: 'a.lookup',
        
            a: 'input[name=a]',
            b: 'input[name=b]',
            c: 'input[name=c]',
            al: 'input[name=al]',
            be: 'input[name=be]',
            ga: 'input[name=ga]',
        
            res: 'input[name=res]',
            sg: 'input[name=sg]',
            tol: 'input[name=tol]',
            pdb: 'input[name=pdb]',
            year: '.pdb_details .date',
        
            count: '.results span.count',
        },
        
        events: {
            'click @ui.get': 'getPDB',
            'click @ui.lookup': 'search',
        },
        
        initialize: function(options) {
            console.log(options)
            var self = this
            this.collection = new DCs(null, {
                queryParams: {
                    res: function() { if (self.ui.res.val()) return self.ui.res.val()*1.25 },
                    tol: function() { return self.ui.tol.val() },
                    a: function() { return self.ui.a.val() },
                    b: function() { return self.ui.b.val() },
                    c: function() { return self.ui.c.val() },
                    al: function() { return self.ui.al.val() },
                    be: function() { return self.ui.be.val() },
                    ga: function() { return self.ui.ga.val() },
                    sg: function() { return self.ui.sg.val().replace(/\s+/g, '') },
                    year: function() { return self.ui.year.html() },
                },
                state: {
                    currentPage: options.page
                },
            })
            
            this.listenTo(this.collection, 'request', this.displaySpinner);
            this.listenTo(this.collection, 'sync', this.removeSpinner);
            this.listenTo(this.collection, 'error', this.removeSpinner);
            
            this.first = true
        },
        
        
        getPDB: function(e) {
            if (e) e.preventDefault()
            
            if (this.ui.pdb.val()) {
                var self = this
                Backbone.ajax({
                    url: app.apiurl+'/cell/pdb?pdb='+this.ui.pdb.val(),
                    type: 'GET',
                    dataType: 'xml',
                    timeout: 5000,
                    success: function(xml){
                        var found = false;
                        $(xml).find('record').each(function(i,r) {
                            found = true;
                            $.each({ a: 'lengthOfUnitCellLatticeA',
                                    b: 'lengthOfUnitCellLatticeB',
                                    c: 'lengthOfUnitCellLatticeC',
                                    al: 'unitCellAngleAlpha',
                                    be: 'unitCellAngleBeta',
                                    ga: 'unitCellAngleGamma',
                                   }, function(k,v) {
                                self.ui[k].val($(r).find('dimStructure\\.'+v).text())
                            })
                                    
                            self.$el.find('.pdb_details .title').text(self.ui.pdb.val()+': '+$(r).find('dimStructure\\.structureTitle').text())
                                                   
                            var res = $(r).find('dimStructure\\.resolution').text()
                            $('.pdb_details .res').text(res)
                            self.ui.res.val(res)
                                                   
                            self.ui.sg.val($(r).find('dimStructure\\.spaceGroup').text().replace(/\s+/g, ''))
                                                   
                            if ($(r).find('dimStructure\\.diffractionSource').text() != 'null') $('.pdb_details .beamline').text($(r).find('dimStructure\\.diffractionSource').text())
                            self.$el.find('.pdb_details .author').text($(r).find('dimStructure\\.structureAuthor').text())
                                                   
                            var cit = $(r).find('dimStructure\\.title').text()
                            if (cit) {
                                $.each(['citationAuthor', 'firstPage', 'volumeId', 'journalName', 'publicationYear'], function(i,f) {
                                    if ($(r).find('dimStructure\\.'+f).text() != 'null') cit += ', '+$(r).find('dimStructure\\.'+f).text()
                                })
                            } else cit = 'N/A'
                                                   
                            self.$el.find('.pdb_details .citation').text(cit)
                            self.$el.find('.pdb_details .date').text($(r).find('dimStructure\\.releaseDate').text())
                            self.$el.find('.pdb_details').slideDown()

                            self.search()
                                
                        })
                        if (!found) self.$el.find('.pdb_details_not_found').slideDown()
                    }
                })
            }

        },
        
        search: function(e) {
            if (!(this.ui.a.val() && this.ui.b.val() && this.ui.c.val() && this.ui.al.val() && this.ui.be.val() && this.ui.ga.val())) {
                app.alert({ message: 'Please make sure to fill in all unit cell parameters: a, b, c, alpha, beta, gamma are required' })
                return
            }

            this.$el.find('.results').show()
            this.ui.count.html('<i class="fa fa-spin fa-circle-o-notch"></i>')
            if (e) e.preventDefault()
            var self = this
            this.collection.state.currentPage = 1
            this.collection.fetch({
                success: this.onSearch.bind(this),
                error: this.onError.bind(this),
            })
            
            return false
        },
        
        onError: function() {
        
        },
        
        onSearch: function(a,b,c) {
            this.ui.count.text(this.collection.state.totalRecords)
            this.$el.find('.data_collections, .page_wrap').show()
        },
        
        displaySpinner: function() {
            this.$el.find('.data_collections').addClass('loading')
        },
            
        removeSpinner: function() {
            this.$el.find('.data_collections').removeClass('loading')
        },
        
        onRender: function() {
            console.log('rendering')
            
            if (this.first) {
                this.ui.tol.val(0.01)
                this.$el.find('.results, .data_collections, .page_wrap').hide()
                
                if (this.ui.pdb.val()) this.getPDB()
                if (this.ui.a.val() && this.ui.b.val() && this.ui.c.val() && this.ui.al.val() && this.ui.be.val() && this.ui.ga.val()) this.search()
                this.first = false
            }
            
            this.pages = new Pages({ collection: this.collection })
            this.$el.find('.page_wrap').html(this.pages.render().$el)
        },
    })

})