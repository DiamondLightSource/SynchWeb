/*
    Copyright 2015 Diamond Light Source <stuart.fisher@diamond.ac.uk>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

define(['backbone', 'marionette', 'underscore', 'jquery',
    
    'views/header',
    'views/sidebar',
    'views/dialogregion',
    'views/login',
    
    'models/proposal',
    'models/options',
    
    'utils',
    'json!config.json',
    'jquery.cookie', 'jquery-ui',
        ],
function(Backbone, Marionette, _, $, HeaderView, SideBarView, DialogRegion, LoginView, Proposal, Options, utils, config) {

  window.app = new Marionette.Application()

  console.log('CONFIG', config)

  // Base url for the api
  app.apiurl = config.apiurl

  // Base url for the app
  app.appurl = config.appurl


  // reference to config
  app.config = config

  // Restore token if its in sessionStorage
  app.token = sessionStorage.getItem('token')
  

  // Allow the app to load a proposal on bootstrap
  app.parseQuery = function() {
      var str = location.search.replace(/\?/, '').split(/&/)
      var pairs = {}
      _.each(str, function(v) {
          var kv = v.split(/=/)
          pairs[kv[0]] = kv[1]
      })

      console.log('pairs', pairs)

      if ('prop' in pairs) sessionStorage.setItem('prop', pairs.prop)
  }

  app.parseQuery()


  // Allow the app to autoupdate itself when running
  app.checkForUpdate = function() {
      Backbone.ajax({
          url: app.appurl+'/js/config.json?t='+(new Date().getTime()),
          success: function(config) {
              console.log('old', app.config.build, 'new', config.build)
              if (config.build != app.config.build) {
                  app.alert({ message: 'An update to SynchWeb is available. This page will automatically refresh in 5 secods' })
                  setTimeout(function() {
                      window.location.reload()
                  }, 5000)
              } 

              setTimeout(app.checkForUpdate, 1000 * 60 * 30)
          },
      })
  }
  app.checkForUpdate()


  // Allow us to set a global base url for the API
  var oldSync = Backbone.sync;
  Backbone.sync = function(method, model, options) {
    var url = _.isFunction(model.url) ? model.url() : model.url;

    options = options || {};
    if (url) options.url = app.apiurl+url
      
    return oldSync.call(this, method, model, options);
  }

  // Pass prop to Backbone.ajax
  var oldAjax = Backbone.ajax
  Backbone.ajax = function(options) {
      var prop = app.prop

      // FormData
      if (options.data instanceof FormData) {
          options.data.append('prop', prop)

      // JSON content
      } else if (options.contentType == 'application/json' || options.type == 'DELETE') {
          if (options.data) var tmp = JSON.parse(options.data)
          else var tmp = {}

          if (Array.isArray(tmp)) tmp[0].prop = prop
          else tmp.prop = prop
          options.data = JSON.stringify(tmp)

      // Append to object for anything else
      } else {
          if (!options.data) options.data = {}
          options.data.prop = prop
      }

      // Send token with requst
      if (app.token) {
          options.beforeSend = function(request){
              request.setRequestHeader('Authorization', 'Bearer ' + app.token);
          }
      }

      return oldAjax.call(this, options)
  }


  // Override so we can redirect to login when theres no token present
  Backbone.Router.prototype.execute = function(callback, args, name) {
      if (!app.token) {
        app.login()
        return false
      }

      if (callback) callback.apply(this, args)
  }



  app.addRegions({
    content: '#container',
    header: '#header',
    sidebar: '#sidebar',
    dialog: DialogRegion,
    motd: '#motd',
  })
    
    
  /*
   Monitor all ajax requests to detect when user needs to login and/or
   is disconnected from the interwebs
  */
  $(document).ajaxError(_.debounce(function(event, xhr, settings, error) {
    console.log('ajax error', 'status', xhr.status, 'code', settings, error)

    var json;
    if (xhr.responseText) {
        try {
            json = $.parseJSON(xhr.responseText)
        } catch(err) {

        }
    }
    var msg = json && (json.error || json.msg) ? (json.error ? json.error : json.msg) : error

    if (xhr.readyState == 0) {
        app.alert({ message: 'A network request failed' })
        
    }

    if (xhr.status == 401) app.login(xhr)
    if (xhr.status == 500) app.alert({ message: 'An application error has occured <pre>'+msg+'</pre>', persist: 'e500' })
    if (xhr.status == 503) app.alert({ message: 'A database error has occured <pre>'+msg+'</pre>', persist: 'e503' })
  }, 300))
    
  

  app.login = function(xhr) {
      app.bc.reset([{ title: 'Login' }])
      app.content.show(new LoginView())
  }
    
    
  /*
    Load module routers and startup application
  */
  app.addInitializer(function(options){
    require([
        'modules/dc/router',
        'modules/proposal/router',
        'modules/shipment/router',
        'modules/samples/router',
        'modules/projects/router',
        'modules/calendar/router',
        'modules/contact/router',
        'modules/cell/router',
        'modules/assign/router',
        'modules/fault/router',
        'modules/stats/router',
        'modules/blstats/router',
        'modules/status/router',
        'modules/docs/router',
        'modules/feedback/router',
        'modules/mc/router',
        'modules/admin/router',
        'modules/imaging/router',
        ], function() {
            
        this.sidebarview = new SideBarView()
        app.sidebar.show(this.sidebarview)
          
        // Breadcrumbs collection
        if (!app.bc) {  
          app.bc = new Backbone.Collection()
          if (!this.headerview) this.headerview = new HeaderView({ bc: app.bc })
          app.header.show(this.headerview)
        }


        $.when(app.loadopts()).done(function() {
          if (app.token) app.getuser({ 
            callback: function() {
                if (!Backbone.History.started) app.starthistory()
            }
          })
          else {
            if (!Backbone.History.started) app.starthistory()
          }
        })
    })
  })
    
    
  /*
   Get the fedid for the logged in user to read cookie
  */
  app.getuser = function(options) {
    Backbone.ajax({
      url: app.apiurl+'/users/current',
      success: function(resp) {
          app.user = resp.user
          app.personid = resp.personid
          app.givenname = resp.givenname
          app.staff = resp.is_staff
          if (!app.type) app.type = resp.ty

          // Should put this somewhere else...
          app.user_can = function(perm) {
            return resp.permissions.indexOf(perm) > -1
          }

          app.cookie(null, function() {
            if (options && options.callback) options.callback()
          })
      },

      error: function() {
          if (options && options.callback) options.callback()
      }

    })
  }
    
    
  /*
   Shortcut to navigate
  */
  app.navigate = function(route,  options){
    options || (options = {});
    Backbone.history.navigate(route, options);
    log()
  }
    
    
  /*
   Cookie the selected proposal
      rename me app.get_proposal()
  */
  app.cookie = function(prop, callback) {
    if (prop) sessionStorage.setItem('prop', prop)
    else prop = sessionStorage.getItem('prop')
      
    app.prop = prop
        
    if (prop) {
        var proposal = new Proposal({ PROPOSAL: prop })
        proposal.fetch({
            success: function() {
                app.type = proposal.get('TYPE'),
                require(['modules/types/'+proposal.get('TYPE')+'/menu'], function(menus) {
                    proposal.set('MENUS', menus)
                    app.prop = prop
                    app.proposal = proposal
                    app.trigger('proposal:change', proposal)
                    if (callback) callback()
                })
            },

            error: function() {
                app.message({ title: 'No such proposal', message: 'The selected proposal does not exist' })
                app.prop = null
                sessionStorage.removeItem('prop')
            },

        })
    } else if (callback) callback()
  },
    

  /*
   Load client side options and show MOTD
  */
  app.loadopts = function() {
      app.options = new Options()
      return app.options.fetch({
          data: { t: new Date().getTime() },
          success: function() {
              if (app.options.get('motd')) {
                  var options = {
                      persist: 'motd',
                      dismissible: true,
                      notify: true,
                      message: app.options.get('motd')
                  }
                  app.motd.show(new utils.alert(options))
              }
          }
      })
  }

    
  /*
   Log message to console
  */
  app.log = function() {
    console.log.apply(console, arguments)
  },
    
    
  /* 
    Show an alert message at the top of the page and highlight
  */
  app.alert = function(options) {
      if (options && options.persist) {
          app.content.$el.find('.content .'+options.persist).remove()
      }
          
      app.content.$el.find('.content').prepend(new utils.alert(options).render().$el)
  }
    
    
  /*
   Show the generic message page (for errors, etc)
  */
  app.message = function(options) {
    app.content.show(new utils.generic_msg(options))
  }
  
    
  /*
   Check screen width
  */
  app.mobile = function() {
    return $(window).width() <= 600
  }
    
    
  /*
   Show blank loading view
  */
  app.loading = function() {
    var LoadingView = Marionette.ItemView.extend({ className: 'loading-container', template: '<div><div class="loading">&nbsp;</div></div>' })
    app.content.show(new LoadingView())
  }
    
    
  /*
   Single Event for window scrolling
  */
  $(window).scroll(_.debounce(function() {
    app.trigger('window:scroll')
  }, 10))
    
    
  app.starthistory = function() {
      if(Backbone.history){
          Backbone.history.start({ pushState: true, root: app.appurl });
          
          // Only need this for pushState enabled browsers
          if (Backbone.history && Backbone.history._hasPushState) {
              var $document = $(window.document);
              var openLinkInTab = false;
              
              var is_relative_to_page = function(href) {
                  return href.match(/^\/|(http:|https:|ftp:|mailto:|javascript:)/) === null;
              };
              
              var is_routable = function(href) {
                  console.log('routable', href.indexOf('/'))
                  return href.indexOf("#") === -1 && (is_relative_to_page(href) || href.indexOf(Backbone.history.root) == 0 || href.indexOf('/') == 0) && (href.indexOf(app.apiurl) != 0);
              };
              
              $document.keydown(function(e) {
                  if (e.ctrlKey || e.keyCode === 91) {
                      openLinkInTab = true;
                  }
              });
              
              $document.keyup(function(e) {
                  openLinkInTab = false;
              });
              
              $document.on("click", "a", function(e) {
                  var href =  $(this).attr("href");
                  if (!href) return
                  if (is_routable(href)) {
                      e.preventDefault();
                      Backbone.history.navigate(href, true);
                  } 
              });
          }
          
          Backbone.history.on('route', function(route, params) {
              console.log('routing', arguments)
              log()
          })
      }
  }


  function log() {
      var data = { location: window.location.pathname }
      Backbone.ajax({ 
          url: app.apiurl+'/users/log/',
          type: 'POST',
          data: data
      })
  }

  // log()
       
  return app
  
})
