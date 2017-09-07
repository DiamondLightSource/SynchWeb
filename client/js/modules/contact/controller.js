define(['marionette',
        'models/labcontact',
        'collections/labcontacts',
    
        'modules/contact/views/contacts',
        'modules/contact/views/viewcontact',
        'modules/contact/views/addcontact',

        'models/user',
        'modules/contact/views/viewuser',

        'models/proplookup',

], function(Marionette, Contact, Contacts, ContactList, ContactView, AddContactView, User, ViewUser, ProposalLookup) {
    
    var bc = { title: 'Home Lab Contacts', url: '/contacts' }
    
    var controller = {
        list: function(page) {
            app.loading()
            app.bc.reset([bc])
            page = page ? parseInt(page) : 1
            var contacts = new Contacts(null, { state: { currentPage: page }})
            contacts.fetch().done(function() {
                app.content.show(new ContactList({ collection: contacts }))
            })
        },
        
        view: function(cid) {
            app.loading()
            var lookup = new ProposalLookup({ field: 'LABCONTACTID', value: cid })
            lookup.find({
                success: function() {
                    var contact = new Contact({ LABCONTACTID: cid })
                    contact.fetch({
                        success: function() {
                            app.bc.reset([bc,{ title: contact.get('CARDNAME') }])
                            app.content.show(new ContactView({ model: contact }))
                        },
                        error: function() {
                            app.bc.reset([bc,{ title: 'No such contact' }])
                            app.message({ title: 'No such contact', message: 'The specified contact doesn\'t exist'})
                        },
                        
                    })

                },

                error: function() {
                    app.bc.reset([bc,{ title: 'No such contact' }])
                    app.message({ title: 'No such contact', message: 'The specified contact doesn\'t exist'})
                },

            })
        },
        
        add: function() {
            app.bc.reset([bc,{ title: 'Add Contact' }])
            app.content.show(new AddContactView())
        },


        edit_user: function(pid) {
            app.loading()
            app.bc.reset([bc,{ title: 'View User' }])
            var user = new User({ PERSONID: pid ? pid : app.personid })
            user.fetch({
                success: function() {
                    app.bc.reset([bc,{ title: user.get('FULLNAME') }])
                    app.content.show(new ViewUser({ model: user }))        
                },

                error: function() {
                    app.bc.reset([bc,{ title: 'No such user' }])
                    app.message({ title: 'No such user', message: 'The specified user doesn\'t exist'})
                }
            })

            
        },
    }
    
    
    app.addInitializer(function() {
        app.on('contact:show', function(cid) {
            app.navigate('contacts/cid/'+cid)
            controller.view(cid)
        })

        app.on('user:show', function(uid) {
            app.navigate('contacts/user/'+uid)
            controller.edit_user(uid)
        })
    })
    
    
    return controller
})