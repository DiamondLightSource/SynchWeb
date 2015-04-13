define(['marionette', 'utils/canvas', 'utils',
    'collections/samples',
    
    'tpl!templates/dc/samplechanger.html'
    ], function(Marionette, canvas, utils, Samples, template) {

    return Marionette.LayoutView.extend({
        className: 'sample_status',
        template: template,
        fullScreen: false,
        
        events: {
            'click .handle': 'toggle',
            'click @ui.clear': 'clearFilter',
            'mousemove canvas': 'mouseMoveCanvas',
            'click canvas': 'clickCanvas',
        },
        
        ui: {
            clear: '.clearf',
            canvas: 'canvas',
            param: 'select[name=param]',
            rank: 'input[name=rank]',
            wrap: '.wrap',
        },
        
        toggle: function(e) {
            if ($(e.target).is('a')) return;
            this.$el.toggleClass('in')
        },
        
        clearFilter: function(e) {
            e.preventDefault()
            
            this.dcs.queryParams['sid'] = null
            this.dcs.queryParams.visit = this.getOption('visit')
            this.dcs.fetch({ reset: true })
            this.ui.clear.css('visibility', 'hidden')
        },

        
        clickCanvas: function(e) {
            if (this.dcs) {
                this.dcs.queryParams.sid = this.current_sample.get('BLSAMPLEID')
                this.dcs.queryParams.visit = null
                this.dcs.fetch({ reset: true })
                this.ui.clear.css('visibility', 'visible')
            }
        },
        
        
        
        initialize: function(options) {
            this.dcs = options.dcs
            
            this.collection = new Samples(null, { poll: true, state: { pageSize: 9999 }, queryParams: { visit: options.visit }})
            this.listenTo(this.collection, 'change', this.drawStatus, this)
            this.ready = this.collection.fetch()
            
            this.positions = options.bl == 'i24' || options.bl == 'i04-1' ? 9 : (options.bl ==  'i03' ? 23 : 10)
            if (this.positions > 10) this.$el.addClass('wide')
            
            this.sc = 16
            this.tpad = 30
            this.pad = 30
            this.rpad = 0 //pad - 25
            
            this.current_sample = null
            this.selected_protein = -1
            
            //this.numbers = new Image()
            //this.numbers.src = '/templates/images/numbers'+(this.positions == 9 ? '2' : '')+'.png'
        },
        
        onDestroy: function() {
            this.collection.stop()
        },
        
        onRender: function() {
            this.ui.wrap.addClass('loading')
        },
        
        onDomRefresh: function() {
            this.$el.show()
            this.canvas = this.$el.find('canvas')[0]
            this.ctx = this.canvas.getContext('2d')
            
            //this.canvas.width = this.$el.width() - this.$el.find('.handle').width()
            //this.canvas.height = this.$el.width() * 1.5
            this.canvas.width = this.ui.wrap.width() - (this.getOption('fullScreen') ? 0 : this.$el.find('.handle').width())
            this.canvas.height = this.ui.wrap.width() * (this.positions > 10 ? 0.8 : 1.5)
            
            this.sw = (this.canvas.width - this.pad - this.rpad) / this.positions
            this.sh = (this.canvas.height-this.tpad-15) / (this.sc-1)
            
            if (!this.getOption('fullScreen')) this.$el.find('.handle').height(this.$el.height())
                
            this.ready.done(this.drawStatus.bind(this))
        },

        
        mouseMoveCanvas: function(e) {
            var cur = utils.get_xy(e, this.ui.canvas)

            var x = Math.floor((cur[0] - this.pad + this.sw/2)/this.sw)
            var y = Math.floor((cur[1] - this.tpad + this.sh/2)/this.sh)
            var s = this.collection.findWhere({ SCLOCATION: (x+1).toString(), LOCATION: (y+1).toString() })
                
            if (s != this.current_sample) {
                this.selected_protein = s ? s.get('PROTEINID') : -1
                this.current_sample = s
                this.showSample()
                this.drawStatus()
            }
        },
        
        
        showSample: function() {
            if (this.current_sample) {
                var s = this.current_sample
                this.$el.find('.details .sname').html('<a href="/samples/sid/'+s.get('BLSAMPLEID')+'">'+s.get('NAME')+'</a>')
                this.$el.find('.details .pname').html('<a href="/proteins/pid/'+s.get('PROTEINID')+'">'+s.get('ACRONYM')+'</a>')
                this.$el.find('.details .cname').html('<a href="/shipment/cid/'+s.get('CONTAINERID')+'">'+s.get('CONTAINER')+'</a>')
                this.$el.find('.details .loaded').html(s.get('R') > 0 ? 'Yes': 'No')
                this.$el.find('.details .screened').html((s.get('SC') > 0 ? 'Yes': 'No') + (s.get('AI') > 0 ? ' (Indexed: ' + s.get('SCRESOLUTION') + '&#8491;)' : ''))
                this.$el.find('.details .data').html((s.get('DC') > 0 ? 'Yes': 'No') + (s.get('AP') > 0 ? ' (Integrated: '+s.get('DCRESOLUTION')+'&#8491;)' : ''))
          
            }
        },
                

        drawStatus: function() {
            this.ui.wrap.removeClass('loading')
            console.log('drawing sc')
            // Get protein acronyms
            var proteins = _.uniq(this.collection.pluck('PROTEINID'))
            
            if (this.ui.rank.is(':checked')) {
                var param = this.ui.param.val()
                var option = $(this.ui.param.find('option:selected'))
                var vals = _.map(this.collection.where({ PROTEINID: this.selected_protein.toString() }), function(m) { if (m.get(param)) return m.get(param) })
                var paramdist = [_.min(vals), _.max(vals)]
            }
               
            var types = { R: '#ff6961', SC: '#fdfd96', AI: '#ffb347', DC: '#87ceeb', AP: '#77dd77',  }
      
            // Draw Grid
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            //this.ctx.drawImage(this.numbers, 0, 0, this.canvas.width, this.canvas.height)
            for (var j = 0; j < this.sc; j++) {
                this.ctx.fillStyle = '#000'
                this.ctx.font = "11px Arial"
                this.ctx.lineWidth = 1
                this.ctx.fillText(j+1,10,this.sh*j+this.tpad+4);
            }
      
            for (var i = 0; i < this.positions; i++) {
                this.ctx.fillStyle = '#000'
                this.ctx.textAlign = 'center';
                this.ctx.font = "11px Arial"
                this.ctx.lineWidth = 1
                this.ctx.fillText(i+1,this.sw*i+this.pad,12);
               
                for (var j = 0; j < this.sc; j++) {
                    var s = this.collection.findWhere({ SCLOCATION: (i+1).toString(), LOCATION: (j+1).toString() })
                    if (s) {
                        var c = '#dfdfdf'
                        for (k in types) if (s.get(k) > 0) c = types[k]
               
                        if (this.ui.rank.is(':checked') && this.selected_protein == s.get('PROTEINID')) {
                            var val = (s.get(param)-paramdist[0])/(paramdist[1]-paramdist[0])
                  
                            if (option.data('min')) {
                                if (paramdist[0] > option.data('min')) paramdist[0] = option.data('min')
                            }
                  
                            if (!option.data('inverted')) {
                                val = 1 - val
                            }
                                
                            c = s.get(param) ? utils.rainbow(val/4) : (s.get(option.data('check')) > 0 ? 'yellow' : '#dfdfdf')
                        }
                          
                        this.ctx.beginPath()
                        this.ctx.strokeStyle = '#000'
                        this.ctx.arc(i*this.sw+this.pad,j*this.sh+this.tpad,this.sh/2-1, 0, 2*Math.PI, false)
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke()
                        this.ctx.fillStyle = (this.selected_protein == -1 || this.selected_protein == s.get('PROTEINID')) ? c : '#fff'
                        this.ctx.fill()
          
                        var cst = utils.rainbow(proteins.indexOf(s.get('PROTEINID'))/proteins.length)
                  
                        if (this.selected_protein == -1 || this.selected_protein == s.get('PROTEINID')) {
                            this.ctx.beginPath()
                            this.ctx.strokeStyle = '#000'
                            this.ctx.arc(i*this.sw+this.pad,j*this.sh+this.tpad,this.sh/4, 0, 2*Math.PI, false)
                            this.ctx.stroke()
                            //this.ctx.fillStyle = s = current_sample ? '#bcbcbc' : (this.selected_protein == s.get('PROTEINID') ? '#555' : '#fff')
                            this.ctx.fillStyle = s == this.current_sample ? '#bcbcbc' : '#fff'
                            this.ctx.fill()
                        }
          
                        this.ctx.beginPath()
                        this.ctx.arc(i*this.sw+this.pad,j*this.sh+this.tpad,this.sh/8, 0, 2*Math.PI, false)
                        this.ctx.fillStyle = cst
                        this.ctx.fill()
                    }
                }
            }
        }

                
    })


})