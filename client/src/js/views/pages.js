define(['marionette', 'backgrid', 'backgrid-paginator'], function(Marionette, Backgrid) {

    var PageHandleWithUrl = Backgrid.Extension.PageHandle.extend({
        url: true,
        urlFragment: 'page',

        changePage: function (e) {
            PageHandleWithUrl.__super__.changePage.call(this, e)

            var $el = this.$el, col = this.collection;
            if (!$el.hasClass("active") && !$el.hasClass("disabled")) {
              if (this.url) {
                  if (this.urlFragment) {
                      var url = window.location.pathname.replace(new RegExp('\\/'+this.urlFragment+'\\/\\w+'), '')+(this.collection.state.currentPage > 1 ? '/'+this.urlFragment+'/'+this.collection.state.currentPage : '')
                  } else {
                      var url = window.location.pathname.replace(/\/\w+$/, '')+(this.value ? '/'+this.collection.state.currentPage : '')
                  }
                  window.history.pushState({}, '', url)
              }
            }
            return this;
          }
    })

    var PaginatorWithUrl = Backgrid.Extension.Paginator.extend({
        pageHandle: PageHandleWithUrl,

        initialize: function(options) {
            this.pageUrl = options.url
            PaginatorWithUrl.__super__.initialize.call(this, options)
        },

        makeHandles: function () {

            var handles = [];
            var collection = this.collection;
      
            var window = this._calculateWindow();
            var winStart = window[0], winEnd = window[1];
      
            if (this.renderIndexedPageHandles) {
              for (var i = winStart; i < winEnd; i++) {
                handles.push(new this.pageHandle({
                  collection: collection,
                  pageIndex: i,
                  url: this.pageUrl
                }));
              }
            }
      
            var controls = this.controls;
            _.each(["back", "rewind", "forward", "fastForward"], function (key) {
              var value = controls[key];
              if (value) {
                var handleCtorOpts = {
                  collection: collection,
                  title: value.title,
                  label: value.label
                };
                handleCtorOpts["is" + key.slice(0, 1).toUpperCase() + key.slice(1)] = true;
                var handle = new this.pageHandle(handleCtorOpts);
                if (key == "rewind" || key == "back") handles.unshift(handle);
                else handles.push(handle);
              }
            }, this);
      
            return handles;
          },
    })

    return Marionette.ItemView.extend({
        template: _.template('<div class="per_page"><select name="pp"></select></div>'),
        events: {
            'change select': 'changePageSize',
        },
        
        ui: {
            pp: 'select[name=pp]',
        },
        
        initialize: function(options) {
            this.paginator = new PaginatorWithUrl({ 
                className: 'pages pp', 
                collection: options.collection, 
                url: !options.noUrl
            })
        },
        
        pages: [5,10,15,25,50,100,500],
        
        onRender: function() {
            var current = this.getOption('collection').state.pageSize
            
            
            this.ui.pp.html(_.map(this.getOption('pages'), function(p) { return '<option value="'+p+'">'+p+'</option>' }).join('')).val(current)
            
            this.$el.append(this.paginator.render().$el)
        },
        
        changePageSize: function() {
            console.log(this.$el.find('select').val())
            this.getOption('collection').setPageSize(parseInt(this.ui.pp.val()))
        }
        
    })

})
