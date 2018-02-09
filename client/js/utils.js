define(['marionette', 'views/dialog', 'jquery', 'jquery.color'], function(Marionette, DialogView, $) {

  var utils = {
       
    // Convert timestamp string into javascript date object
    _date_to_unix: function(strtime) {
       var dt = strtime.trim().split(' ')
       var dmy = dt[0].split('-')
       var hms = dt[1].split(':')
       var date = new Date(dmy[2], dmy[1]-1, dmy[0], hms[0], hms[1], hms[2], 0)
       return date
    },
      
      
      
      
      
    // Reasonable default plot options
    default_plot: {
      grid: {
        borderWidth: 0,
      },
      series: {
        points: {
          show: true,
          radius: 1,
        }
      },
    },
      
    labelFormatter: function (label, series) {
        return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%<br />(" + series.data[0][1].toFixed(1) + "hr)</div>";
    },
      
    labelFormatterNo: function (label, series) {
        return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%<br />(" + series.data[0][1] + ")</div>";
    },

      
    // Generic Message View
    generic_msg: Marionette.ItemView.extend({
        className: 'content',
        template: _.template('<h1><%-title%></h1><div><p><%=msg%></p></div>'),
        templateHelpers: function() {        
            return {
                msg: this.message,
                title: this.title,
            }
        },
        
        initialize: function(options) {
            this.message = options.message
            this.title = options.title
        }
    }),
      

    // Alert Message View
    alert: Marionette.ItemView.extend({
        persist: false,
        scrollTo: true,
        dismissible: false,
        
        className: function() {
            return 'message ' + (this.getOption('notify') ? 'notify' : 'alert')
        },
        tagName: 'p',

        getTemplate: function() {
            return this.getOption('dismissible') ? _.template('<span class="r"><a href="#" class="dismiss"><i class="fa fa-times"></i></a></span><%=msg%>')
                : _.template('<%=msg%>')
        },

        templateHelpers: function() {        
            return {
                msg: this.getOption('message'),
            }
        },
        
        events: {
            'click a.dismiss': 'disimss',
        },

        disimss: function(e) { 
            e.preventDefault()
            this.destroy()
        },


        onRender: function() {
            var self = this
            
            if (this.getOption('scrollTo')) {
                $('html, body').animate({
                    scrollTop: this.$el.offset().top }, 500, function() { self.$el.toggle('highlight')
                })
            }

            if (this.getOption('persist')) this.$el.addClass(this.getOption('persist'))
            
            if (!this.getOption('persist')) {
                setTimeout(function() {
                    self.$el.fadeOut(function() {
                        self.destroy()
                    })
                    
                }, 10000)
            }
        },
    }),
      
    // Confirmation dialog
    confirm: function(options) {
        var ConfirmDialog = DialogView.extend({
            title: options.title,
            template: _.template(options.content),
            buttons: {
                'Ok': 'onOK',
                'Cancel': 'closeDialog',
            },
            
            onOK: function() {
                options.callback()
                this.closeDialog()
            },
        })
        app.dialog.show(new ConfirmDialog())
    },
      
      
    // Return x,y coordinate for a mouse event
    get_xy: function(e, obj) {
        if (e.offsetX == undefined) {
            return [e.pageX-$(obj).offset().left, e.pageY-$(obj).offset().top]
        } else {
            return [e.offsetX, e.offsetY]
        }
    },
      
    
    // Generate colour gradient from 0-1
    rainbow: function(val, width, cent) {
        var col = val*2*Math.PI
        if (width === undefined) width = 126
        if (cent === undefined) cent = 127
        return 'rgb('+ Math.floor(Math.sin(col)*width+cent) + ',' + Math.floor(Math.sin(col+2*Math.PI/3)*width+cent) + ',' + Math.floor(Math.sin(col+4*Math.PI/3)*width+cent)+ ')'
    },
      
    getColors: function(len) {
        return _.map(_.range(len), function (o, i) {
            return $.Color({ hue: (i*360/len), saturation: 0.90, lightness: 0.40, alpha: 1 }).toHexString();
        })
    },
    
    shadeColor: function(color, percent) {   
        var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    },

      
    // Check if an element is in view
    inView: function(element, threshold) {
        var $w = $(window)
        var th = threshold || 0
        
        if (element.is(":hidden")) return;
        
        var wt = $w.scrollTop(),
        wb = wt + $w.height(),
        et = element.offset().top,
        eb = et + element.height();
        
        return (eb >= wt - th && et <= wb + th)
    },


    sign: function(options) {
        Backbone.ajax({
            url: app.apiurl+'/download/sign',
            method: 'POST',
            data: {
                validity: options.url.replace(app.apiurl, ''),
            },
            success: function(resp) {
                if (options && options.callback) options.callback(resp)
            }
        })  
    },

    signHandler: function(e) {
        e.preventDefault()
        var target = $(e.target)
        if (target.is('i') || target.is('img')) target = target.closest('a')

        var url = target.attr('href')
        utils.sign({
            url: url,
            callback: function(resp) {
                window.location = url+'?token='+resp.token
            }
        })
    },

    shuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1
            temporaryValue = array[currentIndex]
            array[currentIndex] = array[randomIndex]
            array[randomIndex] = temporaryValue
        }

        return array
    },


    jsonError: function(model, xhr, status) {
        var json = {}
        if (xhr.responseText) {
            try {
                json = $.parseJSON(xhr.responseText)
            } catch(err) {

            }
        }
        if (json.message) app.alert({ message: json.message })
    }
    

  }

  return utils
    
})