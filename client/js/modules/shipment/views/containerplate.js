define(['marionette',
    'modules/shipment/collections/distinctproteins',
    
    'models/sample',
    'collections/samples',
    'collections/subsamples',
    
    'modules/shipment/collections/platetypes',
    'modules/shipment/views/plate',
    'modules/shipment/views/singlesample',

    'modules/imaging/collections/inspections',
    'modules/imaging/models/inspectionimage',
    'modules/imaging/collections/inspectionimages',
    'modules/imaging/views/imageviewer',
    'modules/imaging/views/imagehistory',

    'modules/imaging/views/addinspection',
    'modules/imaging/views/actualschedule',
    'modules/imaging/views/subtosample',
    'modules/imaging/views/ssdiffractionplan',
    'modules/imaging/views/queuecontainer',
    
    'modules/imaging/collections/screencomponentgroups',
    'modules/imaging/collections/screencomponents',
    'modules/imaging/views/screencomponentgroup',

    'modules/imaging/collections/inspectiontypes',

    'utils/editable',
    'views/table',
    'utils/table',
    'utils/xhrimage',
    'utils',

    'tpl!templates/shipment/containerplate.html',
    'tpl!templates/shipment/containerplateimage.html',
    'jquery.touchswipe'], function(Marionette,
        
    DistinctProteins,
    Sample,
    Samples,
    Subsamples,
        
    PlateTypes,
    PlateView,
    SingleSample,

    ContainerInspections, InspectionImage, InspectionImages, ImageViewer, ImageHistoryView,
    AddInspectionView, ActualScheduleView, SubToSampleView, SSDiffractionPlan, QueueContainerView,

    ScreenComponentGroups,
    ScreenComponents,
    ScreenGroupView,

    InspectionTypes,
        
    Editable, TableView, table, XHRImage, utils,
    template, templateimage){

    // $.event.props.push('dataTransfer');    
            

    var ActionCell = Backgrid.Cell.extend({

        events: {
            'click a.delete': 'delete',
            'click a.fish': 'fish',
            'click a.measure': 'measure',
            'click a.details': 'details',
        },

        initialize: function(options) {
            //console.log(this.model, options)
            this.listenTo(this.model, 'change:EXPERIMENTKIND', this.render, this)
            ActionCell.__super__.initialize.call(this, options)
        },

        delete: function(e) {
            var self = this
            e.preventDefault()

            var self = this
            utils.confirm({
                title: 'Delete Subsample',
                content: 'Are you sure you want to delete this subsample?',
                callback: function() {
                    self.model.destroy()
                },
            })
        },

        fish: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ 
                title: 'Add Subsample to Container',
                className: 'content', 
                view: new SubToSampleView({ dialog: true, model: this.model }),
                autoSize: true 
            }))
        },

        measure: function(e) {
            e.preventDefault()
        },

        details: function(e) {
            e.preventDefault()

            app.dialog.show(new DialogView({ 
                title: 'View Subsample Details',
                className: 'content', 
                view: new SSDiffractionPlan({ dialog: true, model: this.model }),
                autoSize: true 
            }))  
        },

        render: function() {
            this.$el.empty();

            var active = this.model.get('EXPERIMENTKIND') ? 'active' : ''
            var active2 = this.model.get('SAMPLES') > 0 ? 'active' : ''

            this.$el.html('<!--<a href="#" class="button button-notext measure" title="Measure"><i class="fa fa-arrows-h"></i> <span>Measure</span></a>-->\
             <a href="#" class="button button-notext fish '+active2+'" title="Fish into puck"><i class="fa fa-crosshairs"></i> <span>Fish</span></a>\
             <!--<a href="#" class="button button-notext details '+active+'" title="View Experimental Parameters"><i class="fa fa-flask"></i> <span>Experimental Parameters</span></a>-->\
             <a href="#" class="button button-notext delete"><i class="fa fa-times"></i> <span>Delete</span></a>')
            
            this.delegateEvents();
            return this;
        }
    })


    var ClickableRow = Backgrid.Row.extend({
        events: {
            'click': 'onClick',
        },

        initialize: function(options) {
            this.listenTo(this.model, 'change:isSelected', this.setSelected, this)
            ClickableRow.__super__.initialize.call(this, options)
        },
        
        onClick: function(e) {
            if ($(e.target).is('i') || $(e.target).is('a')) return
            
            console.log('click row')
            this.model.set({ isSelected: true })
            console.log('model', this.model)
        },

        setSelected: function() {
            console.log('addclass')
            this.model.get('isSelected') ? this.$el.addClass('selected') : this.$el.removeClass('selected')
        }
    })


    return Marionette.LayoutView.extend({
        className: 'content',

        // template: template,
        getTemplate: function(m) {
            return this.model.get('INSPECTIONS') > 0 ? templateimage : template
        },


        regions: {
            table: '.table',
            plate: '.plate',
            sample: '.singlesamp',
            img: '.img',
            subs: '.subs',
            sten: '.startend',
            grp: '.group',
        },
        
        ui: {
            // ext: '.extrainfo',
            ins: 'select[name=inspection]',
            add: '.add_image',
            ads: 'a.add_point',
            adr: 'a.add_region',

            drop: '.dropimage',
            prog: '.progress',

            play: 'a.play_inspection',
            gap: 'input[name=gap]',

            ity: 'select[name=INSPECTIONTYPEID]',
            status: 'span.sta',
        },

        events: {
            // 'click @ui.ext': 'toggleExtra',
            'change @ui.ins': 'selectInspection',
            'click @ui.ads': 'setAddSubsamplePoint',
            'click @ui.adr': 'setAddSubsampleRegion',
            'click a.add_inspection': 'showAddInspection',
            'click a.view_sched': 'showViewSchedule',
            'click @ui.play': 'playInspection',

            'dragover @ui.drop': 'dragHover',
            'dragleave @ui.drop': 'dragHover',
            'drop @ui.drop': 'uploadFile',

            'click a.queue': 'queueContainer',
            'click a.adhoc': 'requestAdhoc',
        },

        modelEvents: {
            'change:QUEUED': 'updatedQueued',
        },


        updateAdhoc: function() {

        },

        updatedQueued: function() {

        },



        dragHover: function(e) {
            e.stopPropagation()
            e.preventDefault()
            if (e.type == 'dragover') this.ui.drop.addClass('active')
            else this.ui.drop.removeClass('active')
        },

        uploadFile: function(e) {
            this.dragHover(e)
            var files = e.originalEvent.dataTransfer.files
            var f = files[0]

            var types = ['image/jpeg', 'image/png']
            if (types.indexOf(f.type) > -1) {
                var image = new InspectionImage({
                    CONTAINERINSPECTIONID: this.ui.ins.val(),
                    BLSAMPLEID: this.getSample(),
                    IMAGE: f
                })
                this.listenTo(image, 'model:progress', this.updateProgress, this)

                var self = this
                this.ui.prog.show()
                image.save({}, {
                    success: function() {
                        self.inspectionimages.add(image)
                        self.ui.prog.hide()
                        self.ui.add.removeClass('enable')
                        self.image.setModel(image)
                        self.historyimages.fetch()
                    },

                    error: function() {
                        app.alert({ message: 'Something went wrong uploading this image' })
                    }
                })

            } else app.alert({ message: 'You can only upload jpeg or png files' })

            console.log(f.type, f.name, f.size)
        },

        updateProgress: function(value) {
            console.log('prog', value)
            this.ui.prog.progressbar({ value: value })
        },


        showAddInspection: function(e) {
            e.preventDefault()
            this.addInspection = new AddInspectionView({ dialog: true, CONTAINERID: this.model.get('CONTAINERID') })
            this.listenTo(this.addInspection, 'inspection:created', this.appendInspection, this)

            app.dialog.show(new DialogView({ title: 'Add Manual Container Inspection', className: 'content', view: this.addInspection, autoSize: true }))
        },

        appendInspection: function(e) {
            var m = this.addInspection.getModel()
            this.inspections.add(m)
            this.ui.ins.html(this.inspections.opts())
            this.model.set('INSPECTIONS', this.model.get('INSPECTIONS')+1)

            if (this.model.get('INSPECTIONS') == 1) {
                this.render()
                this.doOnShow()

            } else this.ui.ins.val(m.get('CONTAINERINSPECTIONID')).trigger('change')
        },


        showViewSchedule: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ title: 'View Inspection Schedule', className: 'content', view: new ActualScheduleView({ dialog: true, CONTAINERID: this.model.get('CONTAINERID') }), autoSize: true }))
        },


        queueContainer: function(e) {
            e.preventDefault()
            app.dialog.show(new DialogView({ 
                title: 'Queue Container for Data Collection',
                className: 'content', 
                view: new QueueContainerView({ dialog: true, model: this.model, autoSize: true, type: this.type })
            }))
        },


        requestAdhoc: function(e) {
            e.preventDefault()

            var self = this
            Backbone.ajax({
                url: app.apiurl+'/imaging/inspection/adhoc',
                data: {
                    cid: this.model.get('CONTAINERID'),
                    INSPECTIONTYPEID: this.ui.ity.val(),
                },
                success: function(resp) {
                    app.alert({ message: 'Adhoc inspection successfully requested for this container' })
                    self.updateAdhoc()
                },
                error: function(resp) {
                    app.alert({ message: 'Something went wrong request an adhoc inspection for this container' })
                }
            })

        },

        setAddSubsamplePoint: function(e) {
            e.preventDefault()

            if (this.ui.ads.hasClass('button-highlight')) {
                this.ui.ads.removeClass('button-highlight')
                this.image.setAddSubsample(false)
                this.ui.ads.find('span').html('Mark Point')
                
            } else {
                this.ui.ads.addClass('button-highlight')
                this.image.setAddSubsample(true)
                this.ui.ads.find('span').html('Finish')
            }
        },


        setAddSubsampleRegion: function(e) {
            e.preventDefault()

            if (this.ui.adr.hasClass('button-highlight')) {
                this.ui.adr.removeClass('button-highlight')
                this.image.setAddSubsampleRegion(false)
                this.ui.adr.find('span').html('Mark Region')
                
            } else {
                this.ui.adr.addClass('button-highlight')
                this.image.setAddSubsampleRegion(true)
                this.ui.adr.find('span').html('Finish')
            }
        },


        // toggleExtra: function (e) {
        //     e.preventDefault()
        //     this.singlesample.toggleExtra()
        // },

        selectInspection: function() {
            this.inspectionimages.fetch().done(this.inspectionLoaded.bind(this))
        },

        inspectionLoaded: function() {
            this.selectSample()
            this.preCache(1)
        },

        preCache: function(n) {
            clearTimeout(this.cachethread)
            
            var self = this
            var i = this.inspectionimages.at(n)
            if (this.caching && i) {
                var xhr =  new XHRImage()
                console.log('caching', i.urlFor('hd'))
                xhr.load(i.urlFor('full'), function() {
                    self.plateView.drawPlate()

                    if (n+1 == self.inspectionimages.length) self.ui.status.html('')
                    else self.ui.status.html('Loaded '+(n+1)+' out of '+self.inspectionimages.length+' images')

                    self.cachethread = setTimeout(function() {
                        self.preCache(++n)
                    }, 200)
                })
            }
            
        },


        playInspection: function(e) {
            e.preventDefault()

            this.isPlaying =  !(this.isPlaying)

            if (this.isPlaying) this.ui.play.find('i').removeClass('fa-play').addClass('fa-stop')
            else this.ui.play.find('i').addClass('fa-play').removeClass('fa-stop')

            if (this.isPlaying) this.doPlayInspection()
        },

        doPlayInspection: function() {
            var self = this
            clearTimeout(this.playthread)

            if (this.isPlaying) {
                this.playthread = setTimeout(function() {
                    var s = self.getNext()
                    if (s) s.set('isSelected', true)
                    console.log(s)
                    self.doPlayInspection()
                }, this.ui.gap.val()*1000)
            }
        },

        getNext: function(options) {
            var cur = options && options.s ? options.s : this.samples.findWhere({ isSelected: true })
            var idx = this.samples.indexOf(cur)

            if (options && options.first) var next = this.samples.first()
            else if (options && options.last) var next = this.samples.last()
            else var next = this.samples.at(idx+(options && options.prev ? -1 : 1))
            if (!next) next = options && options.prev ? this.samples.last() : this.samples.at(0)

            var hasimg = this.inspectionimages.findWhere({ BLSAMPLEID: next.get('BLSAMPLEID') })
            return hasimg ? next : this.getNext({ s: next, prev: options && options.prev })
        },


        initialize: function(options) {
            this.isPlaying = false
            this.cachethread = null
            this.playthread = null
            this.caching = !app.mobile()

            var self = this
            this.samples = new Samples([], { containerID: options.model.get('CONTAINERID'), state: {pageSize: 9999} })
            this.listenTo(this.samples, 'selected:change', this.selectSample)

            this.subsamples = new Subsamples()
            this.subsamples.queryParams.sid = this.getSample.bind(this)
            this.listenTo(this.subsamples, 'change:COMMENTS', this.saveComment, this)

            this._ready = []
            this._ready.push(this.samples.fetch({ data: {'sort_by': 'POSITION' } }))
            
            this.proteins = new DistinctProteins()
            this.proteins.fetch()
            this.ctypes = PlateTypes

            this.gproteins = new DistinctProteins()
            
            this.inspections = new ContainerInspections()
            this.inspections.queryParams.cid = this.model.get('CONTAINERID')
            this.inspections.setSorting('BLTIMESTAMP', 1)
            this._ready.push(this.inspections.fetch())

            this.screencomponentgroups = new ScreenComponentGroups()
            this.screencomponentgroups.queryParams.scid = this.model.get('SCREENID')

            this.screencomponents = new ScreenComponents()
            this.screencomponents.queryParams.scid = this.model.get('SCREENID')

            if (this.model.get('SCREENID')) {
                this.screencomponents.fetch()
                this.screencomponentgroups.fetch()
            }

            this.inspectiontypes = new InspectionTypes()
            this.inspectiontypes.fetch().done(this.updateTypes.bind(this))

            Backbone.Validation.bind(this)
        },

        updateTypes: function(e) {
            this.ui.ity.html(this.inspectiontypes.opts())
        },

        saveComment: function(m, v) {
            console.log('model changed', arguments)
            m.save(m.changedAttributes(), { patch: true })
        },

        prevImage: function(e) {
            var s = this.getNext({ prev: true })
            s.set({ isSelected: true })
        },

        nextImage: function(e) {
            var s = this.getNext()
            s.set({ isSelected: true })
        },

        firstImage: function(e) {
            var s = this.getNext({ first: true })
            s.set({ isSelected: true })
        },

        lastImage: function(e) {
            var s = this.getNext({ last: true })
            s.set({ isSelected: true })
        },

        getInspection: function() {
            return this.ui.ins.val()
        },

        getSample: function() {
            var s = this.samples.findWhere({ isSelected: true })
            if (s) return s.get('BLSAMPLEID')
        },

        
        selectSample: function() {
            var s = this.samples.findWhere({ isSelected: true })
            if (s) {
                this.singlesample.setModel(s)

                if (this.model.get('SCREENID')) {
                    var g = this.screencomponentgroups.findWhere({ SCREENCOMPONENTGROUPID: s.get('SCREENCOMPONENTGROUPID') })
                    if (g) this.groupview.setModel(g)
                        else this.groupview.setModel(null)
                }

                if (this.model.get('INSPECTIONS') == 0) return
                if (!s.get('BLSAMPLEID')) {
                    this.ui.add.removeClass('enable')

                    if (this.model.get('INSPECTIONS') > 0) {
                        this.historyimages.reset([])
                        this.startendimages.reset([])
                        this.image.setEmpty()
                    }
                    return
                } 

                this.subsamples.fetch()
                this.historyimages.fetch()

                var im = this.inspectionimages.findWhere({ BLSAMPLEID: s.get('BLSAMPLEID') })
                if (im) {
                    this.image.setModel(im)
                    this.ui.add.removeClass('enable')
                } else {
                    this.historyimages.reset([])
                    this.startendimages.reset([])
                    this.image.setEmpty()

                    var ins = this.inspections.findWhere({ CONTAINERINSPECTIONID: this.ui.ins.val() })
                    if (ins) {
                        if (ins.get('MANUAL') && !app.mobile()) this.ui.add.addClass('enable')
                        else this.ui.add.removeClass('enable')
                    }
                }
            }
        },

        updateStartEnd: function() {
            var sten = []
            if (this.historyimages.length) {
                sten.push(this.historyimages.first())
                sten.push(this.historyimages.last())
            }
            this.startendimages.reset(sten)
        },

        
        onRender: function() {  
            var edit = new Editable({ model: this.model, el: this.$el })
            edit.create('NAME', 'text')

            if (this.model.get('INSPECTIONS') > 0) {
                var columns = [
                        { label: '#', cell: table.TemplateCell, editable: false, template: '<%=(RID+1)%>' },
                        { label: 'Type', cell: table.TemplateCell, editable: false, template: '<%=(X2 ? "Region" : "Point")%>' },
                        { name: 'X', label: 'X', cell: 'string', editable: false },
                        { name: 'Y', label: 'Y', cell: 'string', editable: false },
                        { name: 'COMMENTS', label: 'Comments', cell: 'string', editable: true },
                        { label: '', cell: ActionCell, editable: false },
                ]
                        
                this.subtable = new TableView({ collection: this.subsamples, columns: columns, tableClass: 'subsamples', loading: false, pages: false, backgrid: { row: ClickableRow, emptyText: 'No subsamples found', } })
                this.subs.show(this.subtable)
            }

        },
        
        onShow: function() {
            $.when.apply($, this._ready).then(this.doOnShow.bind(this))
        },
        
        doOnShow: function() {
            this.ui.ins.html(this.inspections.opts())

            this.type = this.ctypes.findWhere({ name: this.model.get('CONTAINERTYPE') })
            this.plateView = new PlateView({ collection: this.samples, type: this.type, showImageStatus: this.model.get('INSPECTIONS') > 0 })
            this.plate.show(this.plateView)
            this.singlesample = new SingleSample({ proteins: this.proteins, existingContainer: true, gproteins: this.gproteins })

            var total = _.map(_.range(1, parseInt(this.model.get('CAPACITY'))+1), function(e) { return e.toString() })
            var diff = _.difference(total, this.samples.pluck('LOCATION'))
            _.each(diff, function(l) {
                var w = this.type.getWell(l)
                var g = this.screencomponentgroups.findWhere({ POSITION: (w+1).toString() })

                this.samples.add(new Sample({ 
                    LOCATION: l.toString(), 
                    PROTEINID: -1, 
                    CONTAINERID: this.model.get('CONTAINERID'), 
                    SCREENCOMPONENTGROUPID: g ? g.get('SCREENCOMPONENTGROUPID') : null,
                    new: true }))
            }, this)


            if (this.model.get('SCREENID')) {
                this.groupview = new ScreenGroupView({ components: this.screencomponents, editable: false })
                this.grp.show(this.groupview)
            }

            if (this.model.get('INSPECTIONS') > 0) {
                this.inspectionimages = new InspectionImages()
                this.inspectionimages.queryParams.iid = this.getInspection.bind(this)

                this.plateView.setInspectionImages(this.inspectionimages)

                this.historyimages = new InspectionImages()
                this.historyimages.queryParams.sid = this.getSample.bind(this)
                this.listenTo(this.historyimages, 'sync', this.updateStartEnd, this)

                this.startendimages = new InspectionImages()

                this.image = new ImageViewer({ subsamples: this.subsamples, inspectionimages: this.inspectionimages, historyimages: this.historyimages })
                this.listenTo(this.image, 'space', this.playInspection, this)
                this.listenTo(this.image, 'image:next', this.nextImage, this)
                this.listenTo(this.image, 'image:prev', this.prevImage, this)
                this.listenTo(this.image, 'image:first', this.firstImage, this)
                this.listenTo(this.image, 'image:last', this.lastImage, this)

                if (this.getOption('params').iid) this.ui.ins.val(this.getOption('params').iid)
                this.selectInspection()

                this.ui.prog.hide()
                this.ui.prog.progressbar({ value: 0 })

                this.img.show(this.image)
                this.sten.show(new ImageHistoryView({ historyimages: this.startendimages, embed: true }))

                // Enable swiping for mobile
                if (app.mobile()) {
                    var self = this
                    console.log('enable swipe')
                    this.img.$el.find('canvas').swipe({
                        swipe: function(e, direction, distance, duration, fingerCount, fingerData) {
                            e.preventDefault()

                            var s = null

                            console.log('swipe', direction)

                            if (direction == 'left') {
                                s = self.getNext()
                            }
                            
                            if (direction == 'right') {
                                s = self.getNext({ prev: true })
                            }
                            
                            if (direction == 'up') {
                                
                            }

                            if (direction == 'down') {
                                
                            }

                            if (s) s.set({ isSelected: true })

                        },

                        threshold: 0
                    })
                }
            }

            if (this.getOption('params').sid) {
                var s = this.samples.findWhere({ BLSAMPLEID: this.getOption('params').sid })
                if (s) s.set({ isSelected: true })
            } else this.samples.at(0).set({isSelected: true})
            this.sample.show(this.singlesample)

        },

        onDestroy: function() {
            this.caching = false
        },
    })

})