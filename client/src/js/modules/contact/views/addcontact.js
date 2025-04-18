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
            lb: '.leaveblank',
        },

        events: {
            'change @ui.pid': 'fillUserInfo',
            'change @ui.country': 'onCountryChange',
        },

        onCountryChange: function() {
            let country = this.ui.country.val()
            if (
                app.options.get('facility_courier_countries').indexOf(country) > -1 ||
                app.options.get('facility_courier_countries_nde').indexOf(country) > -1
            ) {
                this.ui.lb.html('<br />Academic users from '+country+' can leave this blank to use the facility courier.')
            } else {
                this.ui.lb.html('')
            }
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
            this.users = new Users()
            this.users.queryParams.login = 1
        },

        createModel: function() {
            this.model = new Contact()
        },

        onRender: function() {
            Promise.all([this.countries.fetch(), this.users.fetch()]).then(() => {
                this.populateCountries();
                this.populateUsers();
                this.onCountryChange();
            })
            this.ui.ad.css('height', '100px')
            this.ui.ad.css('width', '50%')
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
