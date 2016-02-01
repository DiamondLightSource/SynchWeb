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
    
    'models/proposal',
    
    'utils',
    'json!config.json',
    'jquery.cookie', 'jquery-ui',
        ],
function(Backbone, Marionette, _, $, HeaderView, SideBarView, DialogRegion, Proposal, utils, config) {

  window.app = new Marionette.Application()

  console.log('CONFIG', config)

  // Base url for the api
  app.apiurl = config.apiurl

  // Base url for the app
  app.appurl = config.appurl


  // reference to config
  app.config = config
  

  // Allow us to set a global base url for the API
  var oldSync = Backbone.sync;
  Backbone.sync = function(method, model, options) {
    var url = _.isFunction(model.url) ? model.url() : model.url;

    options = options || {};
    if (url) options.url = app.apiurl+url

    // Pass cookied proposal to API
    if (!options.data) options.data = {}
    options.data.prop = $.cookie('ispyb_prop_'+app.user)
      
    return oldSync.call(this, method, model, options);
  }



  app.addRegions({
    content: '#container',
    header: '#header',
    sidebar: '#sidebar',
    dialog: DialogRegion,
  })
    
    
  /*
   Monitor all ajax requests to detect when user needs to login and/or
   is disconnected from the interwebs
  */
  $(document).ajaxError(function(event, xhr, settings, error) {
    console.log('ajax error', 'status', xhr.status, 'code', xhr.statusCode())
    if (xhr.status == 0) app.login(xhr)
  })
    
    
  /*
   I'd love to know a better way to do this.
   We try and load a page from the API, when we can read the href of
   the iframe we know we've been reidrected to the resource from CAS
   and the user is logged in.
  */
  app.login = function(xhr) {
    $('iframe').attr('src', app.apiurl+'/proposal/login').load(function() {
        $('#login').dialog('open')
        var poll = true
        var refresh_thread = null
        var refresh = function() {
            if (poll) {
                clearTimeout(refresh_thread)
                /*
                 This will throw an exception if the page is not on the same origin
                 as the client
                */
                try {
                    var loc = $('#login iframe').contents().get(0).location.href
                    poll = false
                    console.log('logged in', loc)
                    $('#login').dialog('close')
                    app.getuser()
                    // if (xhr) Backbone.ajax(xhr)

                } catch (e) {
                    refresh_thread = setTimeout(refresh, 1000)
                }
            }
            
        }
        refresh()
    })
  }
    
    
  /*
    Load module routers and startup application
  */
  app.addInitializer(function(options){
    $('#login').dialog({
      resizable: false,
      width: '100%', // : '80%',
      height: $(window).height(),
      modal: true,
      autoOpen: false,
      closeOnEscape: false,
      draggable: false,
      title: 'Login',
      dialogClass: 'no-close'
    })
      
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
          
        app.getuser()
    })
  })
    
    
  /*
   Get the fedid for the logged in user to read cookie
  */
  app.getuser = function() {
    Backbone.ajax({
      url: app.apiurl+'/proposal/user',
      success: function(resp) {
          app.user = resp.user
          app.personid = resp.personid
          app.staff = resp.is_staff
          app.type = resp.ty

          // Should put this somewhere else...
          app.user_can = function(perm) {
            return resp.permissions.indexOf(perm) > -1
          }

          // Breadcrumbs collection
          if (!app.bc) {  
            app.bc = new Backbone.Collection()
            if (!this.headerview) this.headerview = new HeaderView({ bc: app.bc })
            app.header.show(this.headerview)
          }
        
          app.cookie(null, function() {
              if (!Backbone.History.started) app.starthistory()
              console.log('success', resp)
          })
      },
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
  */
  app.cookie = function(prop, callback) {
    if (prop) $.cookie('ispyb_prop_'+app.user, prop, { path: '/' })
    else prop = $.cookie('ispyb_prop_'+app.user)
        
    //console.log('prop', prop, callback)
    if (prop) {
        var proposal = new Proposal({ PROPOSAL: prop })
        proposal.fetch({
            success: function() {
                require(['modules/types/'+proposal.get('TYPE')+'/menu'], function(menus) {
                    proposal.set('MENUS', menus)
                    app.prop = prop
                    app.proposal = proposal
                    app.trigger('proposal:change', proposal)
                    if (callback) callback()
                })
            },

            // error: function() {
            //     $.removeCookie('ispyb_prop_'+app.user)
            //     app.trigger('proposals:show')
            // }
        })
    } else if (callback) callback()
    //app.trigger('proposal:change', prop)
  },
    
    
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
                  return href.indexOf("#") === -1 && (is_relative_to_page(href) || href.indexOf(Backbone.history.root) > -1 || href.indexOf('/') == 0) && (href.indexOf(app.apiurl) != 0);
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

                  // Append proposal to links to api
                  } else {
                    if (href.indexOf(app.apiurl) == 0) {
                      e.preventDefault()
                      window.location.href = href + '?prop='+app.prop
                    }
                  }
              });
          }
          
          Backbone.history.on('route', function(route, params) {
              console.log('routing', arguments)
              log()
          })
          
          
          if(Backbone.history.fragment === ""){
            //if (!app.prop) app.trigger('proposals:show')
            //else app.trigger('current:show')
          }
      }
  }


  function log() {
      var data = { location: window.location.pathname }
      Backbone.ajax({ 
          url: app.apiurl+'/proposal/log/',
          type: 'POST',
          data: data
      })
  }

  log()
       
  return app
  
})
