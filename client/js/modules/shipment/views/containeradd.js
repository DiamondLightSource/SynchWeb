define(['marionette',
    'views/form',
    'models/container',
    'models/protein',
    'collections/proteins',
    'models/sample',
    'collections/samples',
    'modules/shipment/views/puck',
    'modules/shipment/views/sampletable',
    
    'modules/shipment/models/cache',
    'modules/shipment/views/pastefrom',
    'modules/shipment/collections/distinctproteins',
    
    'modules/shipment/collections/platetypes',
    'modules/shipment/views/plate',
    'modules/shipment/views/singlesample',

    'modules/imaging/collections/schedules',
    'modules/imaging/views/scheduleview',

    'modules/imaging/collections/screens',
    'modules/imaging/collections/screencomponentgroups',
    'modules/imaging/collections/screencomponents',
    'modules/imaging/views/screencomponentgroup',

    'modules/imaging/collections/imagers',

    'collections/users',
    'modules/shipment/collections/containerregistry',
    
    'tpl!templates/shipment/containeradd.html',
    'tpl!templates/shipment/sampletablenew.html',
    'tpl!templates/shipment/sampletablerownew.html'], function(Marionette,
        
    FormView,
    Container,
    Protein,
    Proteins,
    Sample,
    Samples,
    PuckView,
    SampleTableView,
    Cache,
    PastFromView,
    DistinctProteins,
    PlateTypes,
    PlateView,
    SingleSample,

    Schedules,
    ScheduleView,

    Screens,
    ScreenComponentGroups,
    ScreenComponents,
    ScreenGroupView,

    Imagers,

    Users,
    ContainerRegistry,
        
    template, table, row){
    

    Backbone.Syphon.InputReaders.register('checkbox', function($el){
        return $el.prop('checked') ? $el.val() : null
    })

    // Use Location as idAttribute for this table
    var LocationSample = Sample.extend({
        idAttribute: 'LOCATION',
    })
        
        
    //return Marionette.LayoutView.extend({
    return FormView.extend({
        setupOnConstruct: false,
        className: 'content',
        template: template,
        regions: {
            table: '.table',
            puck: '.puck',
            single: '.singlesamp',
            grp: '.group',
        },
        
        templateHelpers: function() {
            return {
                SHIPPINGID: this.dewar.get('SHIPPINGID'),
                SHIPMENT: this.dewar.get('SHIPPINGNAME'),
                DEWAR: this.dewar.get('CODE'),
            }
        },
        
        ui: {
            name: 'input[name=NAME]',
            comments: 'input[name=COMMENTS]',
            type: 'select[name=CONTAINERTYPE]',
            pc: '.puck_controls',
            ext: '.extrainfo',
            schedule: 'select[name=SCHEDULEID]',
            screen: 'select[name=SCREENID]',
            pid: 'select[name=PERSONID]',
            imager: 'select[name=REQUESTEDIMAGERID]',
            barcode: 'input[name=BARCODE]',
            registry: 'select[name=CONTAINERREGISTRYID]',
            auto: 'input[name=AUTOMATED]',
        },
        
        
        events: {
            'click .pf': 'pasteFrom',
        
            'change .samples input': 'cacheContainer',
            'keyup .samples input': 'cacheContainer',
            'blur .samples input': 'cacheContainer',
            'change .samples select': 'cacheContainer',
            'keyup .samples select': 'cacheContainer',
            'blur .samples select': 'cacheContainer',
        
            'click a.clonepuck': 'clonePuck',
            'click a.clearpuck': 'clearPuck',
            'click a.autofill': 'autoFill',
        
            'change @ui.type': 'setType',

            'click @ui.ext': 'toggleExtra',

            'keypress .ui-combobox input': 'excelNavigate',
            'keypress input.sname': 'excelNavigate',
            'keypress select.sg': 'excelNavigate',
            'keypress input.barcode': 'excelNavigate',
            'keypress input.comments': 'excelNavigate',

            'click a.view_sch': 'viewSchedule',
            'click a.edit_user': 'editUser',
            'change @ui.screen': 'selectScreen',
            'change @ui.pid': 'checkPerson',

            'change @ui.imager': 'limitProteins',
            'change @ui.barcode': 'checkBarcode',
            'keyup @ui.barcode': 'checkBarcode',

            'change @ui.registry': 'updateName',
            'click @ui.auto': 'updateAutomated',
        },

        updateAutomated: function(e) {
            if (this.table.currentView) this.table.currentView.toggleAuto(this.ui.auto.is(':checked'))
        },


        updateName: function(e) {
            var rc = this.containerregistry.findWhere({ CONTAINERREGISTRYID: this.ui.registry.val() })
            if (rc) this.ui.name.val(rc.get('BARCODE'))
        },


        checkBarcode: function() {
            if (!this.ui.barcode.val()) this.model.set('BARCODECHECK', null)
            var self = this
            Backbone.ajax({
                url: app.apiurl+'/shipment/containers/barcode/'+this.ui.barcode.val(),
                success: function(resp) {
                    self.updateBarcode(resp.PROP)
                },

                error: function() {
                    self.updateBarcode()
                }
            })
        },

        updateBarcode: function(resp) {
            if (resp) {
                this.model.set('BARCODECHECK', 0)
                this.$el.find('.message').text('This barcode is already registered to '+resp).addClass('ferror')
            } else {
                this.model.set('BARCODECHECK', 1)
                this.$el.find('.message').text('').removeClass('ferror')
            }
        },


        limitProteins: function() {
            this.proteins.queryParams.externalid = this.ui.imager.val() ? 1 : null
            this.proteins.fetch()

            this.users.queryParams.login = this.ui.imager.val() ? 1 : null
            this.users.fetch()
        },

        checkPerson: function() {
            var u = this.users.findWhere({ PERSONID: this.ui.pid.val() })
            console.log('check p', u)
            if (u) {
                if (!u.get('EMAILADDRESS')) {
                    this.ui.pid.addClass('invalid')
                    this.ui.pid.after('<span class="emsg ferror">Please update your email address by clicking view</span>')

                } else {
                    this.ui.pid.removeClass('invalid')
                    this.ui.pid.siblings('span.emsg').remove()
                }
            }
        },

        editUser: function(e) {
            e.preventDefault()
            app.trigger('user:show', this.ui.pid.val())
        },

        getScreen: function() {
            return this.ui.screen.val()
        },

        selectScreen: function(e) {
            this.screencomponents.fetch()
            this.screencomponentgroups.fetch().done(this.assignScreen.bind(this))
        },

        assignScreen: function(e) {
            this.samples.each(function(s) {
                var w = this.type.getWell(s.get('LOCATION'))
                var g = this.screencomponentgroups.findWhere({ POSITION: (w+1).toString() })
                if (g) s.set({ SCREENCOMPONENTGROUPID: g.get('SCREENCOMPONENTGROUPID') }, { silent: true })
                    else s.set({ SCREENCOMPONENTGROUPID: null }, { silent: true })
            }, this)
        },

        viewSchedule: function(e) {
            e.preventDefault()
            var m = this.schedules.findWhere({ SCHEDULEID: this.ui.schedule.val() })
            if (m) app.dialog.show(new DialogView({ title: 'View Schedule', className: 'content', view: new ScheduleView({ dialog: true, model: m }), autoSize: true }))
        },


        excelNavigate: function(e) {
            var cl = '.'+e.target.className.replace(' fvalid', '').replace(' ferror', '').replace(/\s/g, '.')
            var group = $(cl)
            var cur = e.target
            var idx = group.index(cur)
            console.log(typeof(cl), cl, group,cur,idx)
            if(e.which == 13) {
                var dir = e.shiftKey ? -1 : 1
                if (idx < group.length) group.eq(idx+dir).focus()
                                   
                e.preventDefault()
            }
        },


        toggleExtra: function (e) {
            e.preventDefault()
            //this.$el.find('.extra').toggleClass('show')
            if (this.table.currentView) this.table.currentView.toggleExtra()
        },

        isForImager: function() {
            return !(!this.ui.imager.val())
        },

        setType: function(e) {
            this.$el.find('li.auto').hide()

            this.type = this.ctypes.findWhere({ name: this.ui.type.val() })
            this.type.set({ isSelected: true })
            this.model.set({
                CAPACITY: this.type.get('capacity'),
                CONTAINERTYPE: this.type.get('name'),
            })
            
            if (this.type.get('name') == 'Puck') {
                this.buildCollection()
                this.puck.$el.css('width', app.mobile() ? '100%' : '25%')
                this.puck.show(new PuckView({ collection: this.samples }))
                this.stable = new SampleTableView({ proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table, auto: this.ui.auto.is(':checked') })
                this.table.show(this.stable)
                this.single.empty()
                this.grp.empty()
                this.ui.pc.show()
                this.$el.find('li.pck').show()
                this.$el.find('li.plate').hide()
                this.$el.find('li.pcr').hide()

            } else if (this.type.get('name') == 'PCRStrip') {
                this.puck.$el.css('width', app.mobile() ? '100%' : '50%')
                this.puck.show(new PlateView({ collection: this.samples, type: this.type, showValid: true }))
                this.buildCollection()
                this.stable = new SampleTableView({ proteins: this.proteins, gproteins: this.gproteins, collection: this.samples, childTemplate: row, template: table, type: 'non-xtal' })
                this.table.show(this.stable)
                this.single.empty()
                this.grp.empty()
                this.ui.pc.show()
                this.$el.find('li.pck').hide()
                this.$el.find('li.plate').hide()                
                this.$el.find('li.pcr').show()
                this.ui.registry.val('')               

            } else {
                if (!app.mobile()) this.puck.$el.css('width', app.mobile() ? '100%' : '50%')
                this.puck.show(new PlateView({ collection: this.samples, type: this.type, showValid: true }))
                this.table.empty()
                this.stable.destroy()
                this.singlesample = new SingleSample({ proteins: this.proteins, gproteins: this.gproteins, platetypes: this.ctypes, samples: this.samples, isForImager: this.isForImager.bind(this) })
                this.single.show(this.singlesample)
                this.group = new ScreenGroupView({ components: this.screencomponents, editable: false })
                this.grp.show(this.group)
                this.ui.pc.hide()
                this.buildCollection()
                this.$el.find('li.pck').hide()
                this.$el.find('li.pcr').hide()
                this.$el.find('li.plate').show()
                this.ui.registry.val('')
            }
            console.log('samples', this.samples)
        },
        
        autoFill: function(e) {
            e.preventDefault()
            
            var acronym = this.getOption('visit')+'-p1'
            
            var p = this.proteins.findWhere({ ACRONYM: acronym })
            
            if (!p) {
                var p = new Protein({ ACRONYM: acronym })
                p.save({}, {
                    success: function() {
                        self.proteins.add(p)
                        self.$el.find('table.samples select[name=PROTEINID]').eq(0).combobox('value', p.get('PROTEINID')).trigger('change')
                        self.$el.find('table.samples input[name=NAME]').eq(0).val('x1').trigger('change')
                        self.clonePuck()
                    }
                })
            } else {            
                this.$el.find('table.samples select[name=PROTEINID]').eq(0).combobox('value', p.get('PROTEINID')).trigger('change')
                this.$el.find('table.samples input[name=NAME]').eq(0).val('x1').trigger('change')
                this.clonePuck()
            }
        },
        
        clearPlate: function(e) {
            if (e) e.preventDefault()
            this.ui.barcode.val('')
            this.ui.imager.val('')
            this.ui.schedule.val('')
            this.ui.screen.val('')
            if (this.singlesample) this.singlesample.clearAll()
            this.screencomponents.reset()
            this.screencomponentgroups.reset()
            var s = this.samples.at(0)
            if (s) s.set({ isSelected: true })
        },
        
        clearPuck: function(e) {
            if (e) e.preventDefault()
            this.ui.name.val('')
            this.ui.registry.val('')
            this.ui.comments.val('')
            this.$el.find('.clear').each(function(i,c) { $(c).trigger('click') })
        },
        
        clonePuck: function(e) {
            if (e) e.preventDefault()
            if (this.stable) this.stable.cloneAll()
        },
        
        
        // Paste from old spreadsheet
        pasteFrom: function(e) {
            e.preventDefault()
            var pf = new PastFromView({ proteins: this.proteins })
            this.listenTo(pf, 'content:parsed', this.insertContent, this)
            app.dialog.show(pf)
        },
        
        insertContent: function(data) {
            this.samples.set(data.samples, { remove: false })
            this.table.currentView.render()
            this.ui.name.val(data.title)
        },
        

        // Cache container as user types
        cacheContainer: function() {
            console.log('caching')
            var hasData = false
            this.samples.each(function(s) {
                if (s.get('PROTEINID') > -1) hasData = true
                return
            })
            
            console.log('caching', hasData)
            if (!hasData) return

            var populated_samples = new Samples(this.samples.filter(function(s) { return s.get('PROTEINID') > -1 }))
                
            var data = {
                samples: populated_samples.toJSON(),
                title: this.ui.name.val(),
                time: new Date(),
            }
            
            this.cache.set({ data: data })
            this.cache.save({}, {
                success: function() {
                    app.alert({ message: 'Container contents last saved: '+new Date(), persist: 'saved', className: 'message notify', scrollTo: false })
                }
            })
        },
        
        loadContainerCache: function() {
            if (!this.cache.get('data')) return

            _.each(this.cache.get('data').samples, function(s) {
                var samp = this.samples.findWhere({ LOCATION: s.LOCATION })
                samp.get('components').reset(s.components)
                delete s.components
                samp.set(s)
            }, this)

            this.table.currentView.render()
            
            this.ui.name.val(this.cache.get('data').title)
            
            app.alert({ message: 'Container contents last saved: '+this.cache.get('data').time, persist: 'saved', className: 'message notify', scrollTo: false })
            console.log('loaded cache', this.cache)
        },
        
        
        // Callbacks for ajax requests
        success: function() {
            var self = this

            this.samples.each(function(s) {
                s.set({ CONTAINERID: this.model.get('CONTAINERID') }, { silent: true })
            }, this)

            var samples = new Samples(this.samples.filter(function(m) { return m.get('PROTEINID') > - 1 || m.get('CRYSTALID') > - 1 }))
            if (samples.length) {
                this.$el.find('form').addClass('loading')
                this.ui.submit.prop('disabled', true)
                samples.save({
                    success: function() {
                        self.finished()
                        self.ui.submit.prop('disabled', false)
                        self.$el.find('form').removeClass('loading')
                    },
                    error: function() {
                        self.ui.submit.prop('disabled', false)
                        self.$el.find('form').removeClass('loading')
                    }
                })
            } else this.finished()
        },

        finished: function() {
            app.alert({ message: 'New container &quot;'+this.model.escape('NAME')+'&quot; created, Click <a href="/containers/cid/'+this.model.escape('CONTAINERID')+'">here</a> to view it', persist: 'cadd'+this.model.escape('CONTAINERID'), className: 'message notify' })
            this.clearPuck()
            this.clearPlate()
            this.model.set({ CONTAINERID: null })
        },
        
        error: function() {
            app.alert({ message: 'Something went wrong registering this container, please try again' })
        },
        
        
        createModel: function() {
            this.model = new Container({ DEWARID: this.dewar.get('DEWARID'), new: true })
        },
        
        
        selectSample: function() {
            if (this.type.get('name') != 'Puck' && this.type.get('name') != 'PCRStrip') {
                var s = this.samples.findWhere({ isSelected: true })
                if (s) {
                    this.singlesample.setModel(s)
                    console.log('select sample', s)

                    var w = this.type.getWell(s.get('LOCATION'))
                    var g = this.screencomponentgroups.findWhere({ POSITION: (w+1).toString() })
                    if (g) this.group.setModel(g)
                        else this.group.setModel(null)
                }
            }
        },
        
        initialize: function(options) {
            this.ready = []
            
            this.dewar = options.dewar
            this.samples = new Samples(null, { model: LocationSample })
            this.listenTo(this.samples, 'selected:change', this.selectSample)
            //this.buildCollection()
            this.setupValidation()
            
            this.users = new Users(null, { state: { pageSize: 9999 }})
            this.users.queryParams.all = 1
            this.users.queryParams.pid = app.proposal.get('PROPOSALID')
            this.listenTo(this.users, 'sync', this.updateUsers, this)
            this.ready.push(this.users.fetch())

            this.proteins = new DistinctProteins()
            this.ready.push(this.proteins.fetch())

            this.gproteins = new DistinctProteins()
            
            this.cache = new Cache({ name: 'container' })
            this.ready2 = this.cache.fetch()

            
            this.ctypes = new PlateTypes()
            if (!app.user_can('disp_cont')) this.ctypes.remove(this.ctypes.findWhere({ name: 'ReferencePlate' }))
            
            this.cacheContainer = _.debounce(this.cacheContainer, 3000)

            var self = this
            this.schedules = new Schedules()
            this.schedules.fetch().done(function() {
                self.ui.schedule.html('<option value=""> - </option>'+self.schedules.opts())
            })

            this.screens = new Screens(null, { state: { pageSize: 9999 }})
            this.screens.fetch().done(function() {
                self.ui.screen.html('<option value=""> - </option>'+self.screens.opts())
            })

            this.imagers = new Imagers()
            this.imagers.fetch().done(function() {
                self.ui.imager.html('<option value=""> - </option>'+self.imagers.opts())
            })

            this.screencomponentgroups = new ScreenComponentGroups(null, { state: { pageSize: 9999 }})
            this.screencomponentgroups.queryParams.scid = this.getScreen.bind(this)

            this.screencomponents = new ScreenComponents(null, { state: { pageSize: 9999 }})
            this.screencomponents.queryParams.scid = this.getScreen.bind(this)
          
            this.checkBarcode = _.debounce(this.checkBarcode.bind(this), 200)

            this.containerregistry = new ContainerRegistry(null, { state: { pageSize: 9999 }})
            this.containerregistry.fetch().done(function() {
                self.ui.registry.html('<option value="!">Please select one</option>'+self.containerregistry.opts({ empty: true }))
            })
        },

        buildCollection: function() {
            var samples = []
            _.each(_.range(1,this.type.get('capacity')+1), function(i) {
                samples.push(new LocationSample({ LOCATION: i.toString(), PROTEINID: -1, CRYSTALID: -1, new: true }))
            }, this)
            this.samples.reset(samples)
            this.samples.at(0).set('isSelected', true)
        },

        
        onShow: function() {
            this.getOption('visit') ? this.$el.find('a.autofill').show() : this.$el.find('a.autofill').hide()
            $.when.apply($, this.ready).then(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
            console.log('show new puck')
            //this.puck.show(new PuckView({ collection: this.samples }))
            //this.table.show(new SampleTableView({ proteins: this.proteins, collection: this.samples, childTemplate: row, template: table }))
            this.ui.type.html(this.ctypes.opts())
            this.setType()
            
            this.ready2.done(this.loadContainerCache.bind(this))

            this.updateUsers()
            this.checkPerson()
        },

        updateUsers: function(e) {
            this.ui.pid.html(this.users.opts()).val(app.personid)
        },
    })

})