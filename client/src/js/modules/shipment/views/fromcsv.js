define(['backbone', 
    'marionette',
    'papaparse',
    'models/protein',
    'collections/proteins',
    'models/sample',
    'collections/samples',
    'models/container',
    'collections/containers',
    'models/samplegroup',
    'collections/samplegroups',
    'collections/dewars',
    'views/validatedrow',
    'views/form',
    'modules/shipment/collections/containerregistry',
    'collections/users',
    'modules/shipment/collections/distinctproteins',

    'utils/sgs',
    'utils/experimentkinds',
    'utils/centringmethods',

    'templates/shipment/fromcsv.html',
    'templates/shipment/fromcsvtable.html',
    'templates/shipment/fromcsvcontainer.html'
    ], function(
        Backbone,
        Marionette,
        Papa,
        Protein,
        Proteins,
        Sample,
        Samples,
        Container,
        Containers,
        SampleGroup,
        SampleGroups,
        Dewars,
        ValidatedRow,
        FormView,
        ContainerRegistry,
        Users,
        DistinctProteins,
        SG,
        EXP,
        CM,
        template, table, container) {


    var GridRow = ValidatedRow.extend({
        template: false,
        tagName: 'tr',

        columnTypes: {
            LOCATION: function(v) {
                return '<td>'+v+'</td>'
            },

            CELL: function(v, model) {
                return `
                <td class="unitcell">
                    <input type="text" name="CELL_A" placeholder="A" value="${model.escape('CELL_A')||''}"/>
                    <input type="text" name="CELL_B" placeholder="B" value="${model.escape('CELL_B')||''}"/>
                    <input type="text" name="CELL_C" placeholder="C" value="${model.escape('CELL_C')||''}"/>
                    <input type="text" name="CELL_ALPHA" placeholder="&alpha;" value="${model.escape('CELL_ALPHA')||''}"/>
                    <input type="text" name="CELL_BETA" placeholder="&beta;" value="${model.escape('CELL_BETA')||''}"/>
                    <input type="text" name="CELL_GAMMA" placeholder="&gamma;" value="${model.escape('CELL_GAMMA')||''}"/>
                </td>`
            },
            SPACEGROUP: function(v, m) {
              return '<td><select name="SPACEGROUP">'+SG.opts()+'</select>'  
            },
            CENTRINGMETHOD: function(v, m) {
              return '<td><select name="CENTRINGMETHOD">'+CM.opts()+'</select>'  
            },
            EXPERIMENTKIND: function(v, m) {
              return '<td><select name="EXPERIMENTKIND">'+EXP.opts()+'</select>'  
            },
            ACRONYM: function(v) {
                return '<td><span name="ACRONYM">'+v+'</span></td>'
            },
        },

        onRender: function() {
            var cts = this.getOption('columnTypes')
            var columns = _.map(this.getOption('profile').columns, function(c, k) {
                var val = this.model.get(k) || ''
                return cts[k] ? cts[k](val, this.model, this) : '<td><input type="text" name="'+k+'" value="'+val+'" /></td>'
            }, this)

            this.$el.html(columns.join(''))
            this.$el.find('select[name=SPACEGROUP]').val(this.model.get('SPACEGROUP'))
            if (this.model.get('EXPERIMENTKIND') in EXP.obj()) {
                this.$el.find('select[name=EXPERIMENTKIND]').val(this.model.get('EXPERIMENTKIND'))
            } else if (this.model.get('EXPERIMENTKIND')) {
                app.alert({ message: 'Experiment kind '+this.model.get('EXPERIMENTKIND')+' not valid' })
                this.model.set({EXPERIMENTKIND: ''})
            }
            if (this.model.get('CENTRINGMETHOD') in CM.obj()) {
                this.$el.find('select[name=CENTRINGMETHOD]').val(this.model.get('CENTRINGMETHOD'))
            } else if (this.model.get('CENTRINGMETHOD')) {
                app.alert({ message: 'Centring method '+this.model.get('CENTRINGMETHOD')+' not valid' })
                this.model.set({CENTRINGMETHOD: ''})
            }
            this.model.validate()
        },
    })

    var TableView = Marionette.CompositeView.extend({
        tagName: "table",
        className: 'samples reflow',
        template: table,
        childView: GridRow,
        childViewOptions: function() {
            return {
                profile: this.getOption('profile'),
            }
        },

        ui: {
            tr: 'thead tr',
        },

        onRender: function() {
            var headers = _.map(this.getOption('profile').columns, function(c, k) {
                return '<th>'+c+'</th>'
            })

            this.ui.tr.html(headers.join(''))
        },

    })

    var ContainerView = Marionette.LayoutView.extend({
        template: _.template('<h2><%-NAME%></h2><div class="rcontainer"></div><div class="rsamples table"></div>'),

        regions: {
            rsamples: '.rsamples',
            rcontainer: '.rcontainer',
        },

        initialize: function(options) {
            this.samples = new Samples()
            this.listenTo(options.samples, 'sync reset', this.generateSamples)
            this.generateSamples()
        },

        generateSamples: function() {
            this.samples.reset(this.getOption('samples').where({ CONTAINER: this.model.get('NAME') }))
        },

        onRender: function() {
            this.rsamples.show(new TableView({ 
                collection: this.samples, 
                profile: this.getOption('profile'),
            }))
            this.rcontainer.show(new ModifyContainerView({
                model: this.model,
                users: this.getOption('users'),
                containerregistry: this.getOption('containerregistry'),
            }))
        }
    })

    var ModifyContainerView = FormView.extend({
        template: container,
        ui: {
            registry: '[name=CONTAINERREGISTRYID]',
            person: '[name=PERSONID]',
        },

        events: {
            'change select': 'updateModel',
            'change input': 'updateModel',
        },

        createModel: function() {

        },

        updateModel: function(e) {
            var attr = $(e.target).attr('name')
            console.log('updateModel', attr, e.target.value)
            this.model.set({ [attr]: e.target.value })
        },

        onRender: function() {
            this.ui.registry.html('<option value="!">Please select one</option>'+this.getOption('containerregistry').opts({ empty: true }))
            this.ui.person.html(this.getOption('users').opts()).val(this.model.get('OWNERID') || app.personid)

            if (!this.model.get('CONTAINERTYPE')) {
                this.model.set({ CONTAINERTYPE: 'Puck', CAPACITY: 16 })
            }

            if (!this.model.get('CONTAINERREGISTRYID')) {
                var reg = this.getOption('containerregistry')
                var nearest = reg.findWhere({ LASTNAME: this.model.get('NAME') })
                this.model.set({ CONTAINERREGISTRYID: nearest ? nearest.get('CONTAINERREGISTRYID') : '!' })
            }
            this.ui.registry.val(this.model.get('CONTAINERREGISTRYID'))

            this.model.set({ SOURCE: 'SynchWeb-CSV-Upload' })

            this.model.isValid(true)
        }
    })

    var ContainersView = Marionette.CollectionView.extend({
        childView: ContainerView,
        childViewOptions: function() {
            return {
                samples: this.getOption('samples'),
                profile: this.getOption('profile'),
                containerregistry: this.getOption('containerregistry'),
                users: this.getOption('users'),
                proteins: this.getOption('proteins'),
            }
        }
    })


    var MessageView = Marionette.ItemView.extend({
        tagName: 'li',
        template: _.template('<%-message%>')
    })

    var MessagesView = Marionette.CollectionView.extend({
        tagName: 'ul',
        childView: MessageView
    })

    var Message = Backbone.Model.extend({

    })

    return Marionette.LayoutView.extend({
        template: template,
        className: 'content',

        regions: {
            rcontainers: '.rcontainers',
            rmessages: '.rmessages',
        },

        ui: {
            drop: '.dropimage',
            pnew: '.pnew',
            browse: '#browse',
            csvmessage: '#csvmessage',
        },

        events: {
            'dragover @ui.drop': 'dragHover',
            'dragleave @ui.drop': 'dragHover',
            'drop @ui.drop': 'dropFile',
            'click .submit': 'import',
            'change @ui.browse': 'fileselected',
        },
        
        fileselected: function(e) {
            console.log('file selected')
            console.log(e)
            //console.log(e.originalEvent.dataTransfer.files)
            console.log(e.target.files[0])
            f = e.target.files[0]
            this.uploadFile(f)
        },

        addMessage: function(options) {
            this.messages.add(new Message({ message: options.message }))
        },

        import: function(e) {
            e.preventDefault()
            this.messages.reset()

            if (!this.containers.length && !this.samples.length) {
                app.alert({ message: 'No containers and samples found' })
                return
            }

            var valid = true
            this.containers.each(function(c) {
                var cValid = c.isValid(true)
                console.log(c.get('CODE'), c)
                if (!cValid) {
                    valid = false
                    this.addMessage({ message: `Container ${c.get('NAME')} is invalid` })
                }
            }, this)

            this.samples.each(function(s) {
                var sValid = s.isValid(true)
                console.log(s.get('NAME'), s)
                if (!sValid) {
                    valid = false
                    this.addMessage({ message: `Sample ${s.get('NAME')} is invalid` })
                }
            }, this)

            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (!valid) {
                app.alert({ message: 'Shipment is not valid' })
                return
            }

            this.messages.reset()

            var self = this

            var gg = []
            this.newGroups.each(function(g) {
                gg.push(g.save({}, { 
                    success: function(result) {
                        g.set({BLSAMPLEGROUPID: result.get('BLSAMPLEGROUPID')})
                        self.addMessage({ message: 'Created group '+g.get('NAME')+'id: '+g.get('BLSAMPLEGROUPID')})
                    },
                    error: function(xhr, status, error) {
                        self.addMessage({ messages: 'Error creating group: '+error})
                    }
                }))
            }, this)

            $.when.apply($, gg).done(function() {
                var cp = []
                self.containers.each(function(c) {
                    if (c.isNew()) {
                        cp.push(c.save({}, { 
                            success: function() {
                                self.addMessage({ message: 'Created container: '+c.get('NAME') })
                            }, 
                            error: function(xhr, status, error) {
                                self.addMessage({ messages: 'Error creating container: '+error})
                            }
                        }))
                    }
                })

                $.when.apply($, cp).done(function() {
                    var news = new Samples(self.samples.filter(function(s) {
                        return s.isNew()
                    }))

                    if (news.length == 0) return

                    news.each(function(s) {
                        if (!s.get('CONTAINERID')) {
                            var c = self.containers.findWhere({ NAME: s.get('CONTAINER')})
                            s.set({ CONTAINERID: c.get('CONTAINERID') }, { silent: true })
                        }
                        if (s.get('SAMPLEGROUPNAME')) {
                            var g = self.newGroups.findWhere({ NAME: s.get('SAMPLEGROUPNAME')})
                            s.set({ SAMPLEGROUP: g.get('BLSAMPLEGROUPID') })
                        }

                    })

                    news.save({
                        success: function() {
                            window.location.href = '/shipments/sid/'+self.model.escape('SHIPPINGID')
                        },
                        error: function(xhr, status, error) {
                            self.addMessage({ messages: 'Error creating samples: '+error})
                        }
                    })
                })
            })

        },
        
        initialize: function(options) {
            this.messages = new Backbone.Collection()

            this.samples = new Samples(null, { state: { pageSize: 9999 }})
            this.samples.queryParams.SHIPPINGID = this.model.get('SHIPPINGID')
            this.samples.fetch()

            this.containers = new Containers()
            this.containers.shipmentID = this.model.get('SHIPPINGID')
            this.containers.setSorting('BLTIMESTAMP', 0)
            this.containers.fetch()

            this.ready = []

            this.sampleGroups = new SampleGroups(null, { state: { pageSize: 9999 }})
            this.ready.push(this.sampleGroups.fetch())
            this.newGroups = new SampleGroups()

            this.containerregistry = new ContainerRegistry(null, { state: { pageSize: 9999 }})
            this.ready.push(this.containerregistry.fetch())

            this.users = new Users(null, { state: { pageSize: 9999 }})
            this.users.queryParams.all = 1
            this.ready.push(this.users.fetch())

            this.proteins = new DistinctProteins()
            if (app.valid_samples) {
                this.proteins.queryParams.SAFETYLEVEL = 'GREEN';
            }
            this.ready.push(this.proteins.fetch())

            this.dewars = new Dewars()
            this.dewars.queryParams.sid = this.model.get('SHIPPINGID')
            this.ready.push(this.dewars.fetch())

            this.csvProfile = require('csv/'+app.config.csv_profile+'.js')
            this.valid = true
            console.log('initialize', this.csvProfile)
        },


        dragHover: function(e) {
            e.stopPropagation()
            e.preventDefault()
            if (e.type == 'dragover') this.ui.drop.addClass('active')
            else this.ui.drop.removeClass('active')
        },

        dropFile: function(e) {
            this.dragHover(e)
            var files = e.originalEvent.dataTransfer.files
            var f = files[0]
            this.uploadFile(f)
        },


        uploadFile: function(f) {
            if (f.name.endsWith('csv')) {
                var reader = new FileReader()
                var self = this
                reader.onload = function(e) {
                    self.parseCSVContents(e.target.result)
                }
                reader.readAsText(f)
            } else {
                app.alert({ message: 'Cannot import file "'+f.name+'" is not a csv file' })
            }
        },
        
        createObjects: function(raw) {
            var parsed = Papa.parse(raw)

            if (parsed.errors.length) {
                var errs = []
                _.each(parsed.errors, function(e) {
                    errs.push({ message: e.code + ': ' + e.message + ' at row ' + e.row })
                })
                this.messages.reset(errs)
                app.alert({ message: 'Error parsing csv file, see messages below' })
                return
            }

            var objects = parsed.data
            var mapping = this.csvProfile.mapping
            var headers = this.csvProfile.headers
            var transforms = this.csvProfile.transforms

            var newGroups = []
            var populatedObject = []
            _.each(objects, function(item){
                if (!item.length || (item.length == 1 && !item[0].trim())) return
                if (["#", ";", "!"].includes(item[0][0])) return
                if (item[0] === headers[0]) return
                var obj = {}
                _.each(item, function(v, i) {
                    var key = mapping[i]
                    if (v) obj[key] ? obj[key] += ' | '+v : obj[key] = v
                })

                _.each(obj, function(v, k) {
                    if (k in transforms) {
                        transforms[k](v, obj)
                    }
                }, this)

                if (!obj.PROTEINID) {
                    var protein = this.proteins.findWhere({ ACRONYM: obj.ACRONYM })
                    if (protein) {
                        obj.PROTEINID = protein.get('PROTEINID')
                    } else {
                        app.alert({ message: 'Invalid protein: '+obj.ACRONYM })
                        this.valid = false
                        return
                    }
                }
                
                if (obj.SAMPLEGROUPNAME) {
                    var newg = _.findWhere(newGroups, { NAME: obj.SAMPLEGROUPNAME })
                    if (newg) {
                        newg.SAMPLES.push(obj.NAME)
                    } else {
                        newGroups.push({
                            NAME: obj.SAMPLEGROUPNAME,
                            SAMPLES: [obj.NAME],
                        })
                    }
                }
                
                // must be a number between 1 and 16, allow spaces before and after and zero padding
                validLocations = /^ *(0?[1-9]|1[0-6]) *$/
                if (!obj.LOCATION || !validLocations.test(obj.LOCATION)) {
                    app.alert({ message: obj.NAME+ ': Location must be between 1 and 16' })
                    this.valid = false
                    return
                }
                
                _.each(populatedObject, function(previousSample){
                    if (obj.ACRONYM == previousSample.ACRONYM && obj.NAME == previousSample.NAME) {
                        app.alert({ message: 'Multiple rows exist for protein '+obj.ACRONYM+' and sample name '+obj.NAME })
                        this.valid = false
                        return
                    }
                    if (obj.CONTAINER == previousSample.CONTAINER && obj.LOCATION == previousSample.LOCATION) {
                        app.alert({ message: 'Multiple rows exist for container '+obj.CONTAINER+' and location '+obj.LOCATION })
                        this.valid = false
                        return
                    }
                }, this)
                
                if (obj.SCREENINGMETHOD) {
                    validScreeningMethods = ['', 'none', 'best', 'all']
                    if (!validScreeningMethods.includes(obj.SCREENINGMETHOD)) {
                        app.alert({ message: obj.NAME+ ': Screening method must be none, best or all' })
                        this.valid = false
                        return
                    }
                }
                
                populatedObject.push(obj)
            }, this)

            this.newGroups.reset(newGroups)
            console.log('newGroups')
            console.log(newGroups)
            return populatedObject
        },

        parseCSVContents: function(raw) {
            this.valid = true
            var samples = this.createObjects(raw)
            console.log('parseCSVContents', samples)

            var existingContainers = this.containers.pluck('NAME')
            _.each(_.unique(_.pluck(samples, 'CONTAINER')), function(name) {
                if (existingContainers.indexOf(name) > -1) {
                    app.alert({ message: 'Container ' + name + ' already exists' })
                    this.valid = false
                }
            }, this)

            var existingSamples = this.samples.pluck('NAME')
            _.each(samples, function(sample) {
                if (existingSamples.indexOf(sample.NAME) > -1) {
                    app.alert({ message: 'Sample ' + sample.NAME + ' already exists' })
                    this.valid = false
                }
            }, this)

            var existingSampleGroups = this.sampleGroups.pluck('NAME')
            _.each(samples, function(sample) {
                if (existingSampleGroups.indexOf(sample.SAMPLEGROUPNAME) > -1) {
                    app.alert({ message: 'Sample group ' + sample.SAMPLEGROUPNAME + ' already exists' })
                    this.valid = false
                }
            }, this)

            if (!this.valid) {
                return
            }

            this.samples.reset(samples)

            this.containers.reset(_.map(_.unique(_.pluck(samples, 'CONTAINER')), function(name) {
                var sample = this.samples.findWhere({ CONTAINER: name })

                var ownerid = null
                if (sample) {
                    var oid = this.users.findWhere({ FULLNAME: sample.get('OWNER') })
                    if (oid) ownerid = oid.get('PERSONID')
                }

                return { NAME: name, DEWARID: this.dewars.at(0).get('DEWARID'), OWNERID: ownerid }
            }, this))

        },

        onRender: function() {
            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
            this.rmessages.show(new MessagesView({ collection: this.messages }))
        },

        doOnRender: function() {
            // this.parseCSVContents(this.csvProfile.exampleCSV)
            this.ui.csvmessage.html(app.config.csv_message)

            this.rcontainers.show(new ContainersView({ 
                collection: this.containers, 
                samples: this.samples, 
                profile: this.csvProfile,
                containerregistry: this.containerregistry,
                users: this.users,
                proteins: this.proteins,
            }))
        },

    })

})
