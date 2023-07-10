define(['views/form',
    'models/labcontact',
    'collections/countries',
    'collections/users',
    'templates/contact/contactadd.html',
    'jquery',
    'backbone',
    
    'backbone-validation',
    
    ], function(FormView,
        Contact, Countries, Users,
        template, $_, Backbone) {


    return FormView.extend({
        template: template,
        
        ui: {
            country: 'select[name=COUNTRY]',
            pid: 'select[name=PERSONID]',
            cn: 'input[name=CARDNAME]',
            fn: 'input[name=FAMILYNAME]',
            gn: 'input[name=GIVENNAME]',
            pn: 'input[name=PHONENUMBER]',
            ea: 'input[name=EMAILADDRESS]',
            ln: 'input[name=LABNAME]',
            ad: 'textarea[name=ADDRESS]',
            ci: 'input[name=CITY]',
            pc: 'input[name=POSTCODE]',
        },

        events: {
            'change @ui.pid': 'fillUserInfo',
        },

        fillUserInfo: function() {
            var u = this.users.findWhere({ PERSONID: this.ui.pid.val() })
            if (u){
                this.ui.cn.val(u.get('FULLNAME'))
                this.ui.fn.val(u.get('FAMILYNAME'))
                this.ui.gn.val(u.get('GIVENNAME'))
                this.ui.pn.val(u.get('PHONENUMBER'))
                this.ui.ea.val(u.get('EMAILADDRESS'))
                this.ui.ln.val(u.get('LABNAME'))
                this.ui.ad.val(u.get('ADDRESS'))
                this.ui.ci.val(u.get('CITY'))
                this.ui.pc.val(u.get('POSTCODE'))
                this.ui.country.val(u.get('COUNTRY'))
            }
        },

        initialize: function() {
            this.countries = new Countries()
            this.countries.state.pageSize = 9999
            this.ready = this.countries.fetch()
            this.users = new Users()
            this.users.queryParams.login = 1
            this.ready2 = this.users.fetch()
        },

        createModel: function() {
            this.model = new Contact()
        },

        onRender: function() {
            $.when(this.ready).done(this.populateCountries.bind(this))
            $.when(this.ready2).done(this.populateUsers.bind(this))
        },

        populateCountries: function() {
            this.ui.country.html(this.countries.opts())
        },

        populateUsers: function() {
            // only want to display the current user
            var u = this.users.findWhere({ PERSONID: app.personid.toString() })
            var opts = '<option value=""> - </option>'
            opts += '<option value="'+u.get('PERSONID')+'">'+u.get('FULLNAME')+'</option>'
            this.ui.pid.html(opts)
        },

        success: function(model, response, options) {
            console.log('success from contact add')
            if (this.getOption('dialog')) {
                app.message({ message: 'New Lab Contact Registered' })
                if (app.dialog.currentView) app.dialog.currentView.closeDialog()
            } else app.trigger('contact:show', model.get('LABCONTACTID'))
        },

        failure: function(model, response, options) {
            console.log('failure from contact add')
            var message = 'Something went wrong registering this lab contact'
            if (response && response.responseJSON && response.responseJSON.message) {
                message += ': '+response.responseJSON.message
            }
            app.alert({ message: message })
        },
    })

})
