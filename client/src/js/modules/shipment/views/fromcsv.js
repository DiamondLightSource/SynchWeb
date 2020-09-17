define(['backbone', 
    'marionette',
    'papaparse',
    'models/protein',
    'collections/proteins',
    'models/sample',
    'collections/samples',
    'models/container',
    'collections/containers',
    'collections/dewars',
    'views/validatedrow',
    'views/form',
    'modules/shipment/collections/platetypes',
    'modules/shipment/collections/containerregistry',
    'collections/users',
    'modules/shipment/collections/distinctproteins',

    'utils/sgs',
    'utils/collectionmode',

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
        Dewars,
        ValidatedRow,
        FormView,
        PlateTypes,
        ContainerRegistry,
        Users,
        DistinctProteins,
        SG,
        COLM,
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
            COLLECTIONMODE: function() {
                return '<td><select name="COLLECTIONMODE">'+COLM.opts()+'</select></td>'
            },
            PROTEINID: function(v, m) {
                var newProtein = v == 0 ? 'active' : ''
                return '<td><span class="'+newProtein+'">'+m.escape('ACRONYM')+'</span></td>'
            },
            SPACEGROUP: function(v, m) {
              return '<td><select name="SPACEGROUP">'+SG.opts()+'</select>'  
            }
        },

        onRender: function() {
            var cts = this.getOption('columnTypes')
            var columns = _.map(this.getOption('profile').columns, function(c, k) {
                var val = this.model.get(k) || ''
                return cts[k] ? cts[k](val, this.model, this) : '<td><input type="text" name="'+k+'" value="'+val+'" /></td>'
            }, this)

            this.$el.html(columns.join(''))
            this.$el.find('select[name=SPACEGROUP]').val(this.model.get('SPACEGROUP'))
            this.$el.find('select[name=COLLECTIONMODE]').val(this.model.get('COLLECTIONMODE'))
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
                platetypes: this.getOption('platetypes'),
                users: this.getOption('users'),
                containerregistry: this.getOption('containerregistry'),
            }))
        }
    })

    var ModifyContainerView = FormView.extend({
        template: container,
        ui: {
            containertype: '[name=CONTAINERTYPE]',
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
            if (attr == 'CONTAINERTYPE') {
                this.updateContainerType()
            } else {
                this.model.set({ [attr]: e.target.value })
            }
        },

        updateContainerType: function() {
            var containerType = this.getOption('platetypes').findWhere({ name: this.ui.containertype.val() })
            this.model.set({ CONTAINERTYPE: this.ui.containertype.val(), CAPACITY: containerType.get('capacity') })
        },

        onRender: function() {
            this.ui.containertype.html(this.getOption('platetypes').opts())
            this.ui.registry.html('<option value="!">Please select one</option>'+this.getOption('containerregistry').opts({ empty: true }))
            this.ui.person.html(this.getOption('users').opts()).val(this.model.get('OWNERID') || app.personid)

            if (!this.model.get('CONTAINERTYPE')) {
                this.updateContainerType()
            }

            if (!this.model.get('CONTAINERREGISTRYID')) {
                var reg = this.getOption('containerregistry')
                var nearest = reg.findWhere({ LASTNAME: this.model.get('NAME') })
                this.model.set({ CONTAINERREGISTRYID: nearest ? nearest.get('CONTAINERREGISTRYID') : '!' })
            }
            this.ui.registry.val(this.model.get('CONTAINERREGISTRYID')) 

            this.model.isValid(true)
        }
    })

    var ContainersView = Marionette.CollectionView.extend({
        childView: ContainerView,
        childViewOptions: function() {
            return {
                samples: this.getOption('samples'),
                profile: this.getOption('profile'),
                platetypes: this.getOption('platetypes'),
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
        },

        events: {
            'dragover @ui.drop': 'dragHover',
            'dragleave @ui.drop': 'dragHover',
            'drop @ui.drop': 'uploadFile',
            'click .submit': 'import',
            'click a.export': 'export',
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

            var pos = this.$el.find('.top').offset().top
            $('html, body').animate({scrollTop: pos}, 300);

            if (!valid) {
                app.alert({ message: 'Shipment is not valid' })
                return
            }

            this.messages.reset()

            var self = this
            var pp = []
            this.newProteins.each(function(p) {
                pp.push(p.save({}, { 
                    success: function() {
                        self.addMessage({ message: 'Created component: '+p.get('ACRONYM') })    
                    },
                    error: function(xhr, status, error) {
                        self.addMessage({ messages: 'Error creating component: '+error})
                    }
                }))
            }, this)

            $.when.apply($, pp).done(function() {
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

                        if (s.get('PROTEINID') == 0) {
                            var p = self.newProteins.findWhere({ ACRONYM: s.get('ACRONYM')})
                            s.set({ PROTEINID: p.get('PROTEINID') }, { silent: true })
                        }
                    })

                    news.save({
                        success: function() {
                            app.alert({ message: 'Shipment contents imported, Click <a href="/shipments/sid/'+self.model.escape('SHIPPINGID')+'">here</a> to view it', persist: 'simport'+self.model.escape('SHIPPINGID'), className: 'message notify' })
                            self.addMessage({ messages: 'Samples created' })
                        },
                        error: function(xhr, status, error) {
                            self.addMessage({ messages: 'Error creating samples: '+error})
                        }
                    })
                })

            })
        },

        export: function() {
            var rows = []
            rows.push(this.csvProfile.headers)
            this.samples.each(function(s) {
                var row = []
                _.each(this.csvProfile.mapping, function(k, i) {
                    if (k in this.csvProfile.export) {
                        row.push(this.csvProfile.export[k](s.toJSON(), this.csvProfile.headers[i]))
                    } else {
                        row.push(s.get(k))
                    }
                }, this)

                rows.push(row)
            }, this)

            var csv = Papa.unparse(rows)
            var a = document.createElement('a')
            var file = new Blob([csv], {type: 'application/octet-stream'})

            a.href= URL.createObjectURL(file)
            a.download = this.model.get('SHIPPINGNAME') + '.csv'
            a.click()

            URL.revokeObjectURL(a.href);

            console.log(csv)
        },

        initialize: function(options) {
            this.messages = new Backbone.Collection()

            this.samples = new Samples()
            this.samples.queryParams.SHIPPINGID = this.model.get('SHIPPINGID')
            this.samples.fetch()

            this.containers = new Containers()
            this.containers.queryParams.SHIPPINGID = this.model.get('SHIPPINGID')
            this.containers.setSorting('BLTIMESTAMP', 0)
            this.containers.fetch()

            this.platetypes = new PlateTypes()

            this.ready = []
            this.containerregistry = new ContainerRegistry(null, { state: { pageSize: 9999 }})
            this.ready.push(this.containerregistry.fetch())

            this.users = new Users(null, { state: { pageSize: 9999 }})
            this.users.queryParams.all = 1
            this.users.queryParams.pid = app.proposal.get('PROPOSALID')
            this.ready.push(this.users.fetch())

            this.newProteins = new Proteins()
            this.proteins = new DistinctProteins()
            if (app.valid_samples) {
                this.proteins.queryParams.external = 1
            }
            this.ready.push(this.proteins.fetch())

            this.dewars = new Dewars()
            this.dewars.queryParams.sid = this.model.get('SHIPPINGID')
            this.ready.push(this.dewars.fetch())

            this.csvProfile = require('csv/'+app.config.csv_profile+'.js')
            console.log('initialize', this.csvProfile)
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
            var headers = this.csvProfile.mapping
            var transforms = this.csvProfile.transforms
            objects.splice(0, 1)

            var newProteins = []
            var populatedObject = []
            _.each(objects, function(item){
                if (!item.length || (item.length == 1 && !item[0].trim())) return
                var obj = {}
                _.each(item, function(v, i) {
                    var key = headers[i]
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
                        obj.PROTEINID = 0
                        var newp = _.findWhere(newProteins, { ACRONYM: obj.ACRONYM })
                        if (!newp) {
                            newProteins.push({
                                ACRONYM: obj.ACRONYM,
                                NAME: obj.ACRONYM,
                            })
                        }
                    }
                }

                populatedObject.push(obj)
            }, this)

            this.newProteins.reset(newProteins)
            return populatedObject
        },

        parseCSVContents: function(raw) {
            var samples = this.createObjects(raw)
            console.log('parseCSVContents', samples)
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

            if (this.newProteins.length) this.ui.pnew.text('Need to create '+this.newProteins.length+' components: '+this.newProteins.pluck('ACRONYM').join(', '))
        },

        onRender: function() {
            $.when.apply($, this.ready).done(this.doOnRender.bind(this))
            this.rmessages.show(new MessagesView({ collection: this.messages }))
        },

        doOnRender: function() {
            // this.parseCSVContents(this.csvProfile.exampleCSV)

            this.rcontainers.show(new ContainersView({ 
                collection: this.containers, 
                samples: this.samples, 
                profile: this.csvProfile,
                platetypes: this.platetypes,
                containerregistry: this.containerregistry,
                users: this.users,
                proteins: this.proteins,
            }))
        },

    })

})
