define(['marionette',
        'models/labcontact',
        'collections/labcontacts',
    
        'modules/contact/views/contacts',
        'modules/contact/views/viewcontact',
        'modules/contact/views/addcontact',

], function(Marionette, Contact, Contacts, ContactList, ContactView, AddContactView) {
    
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
        
        add: function() {
            app.bc.reset([bc,{ title: 'Add Contact' }])
            app.content.show(new AddContactView())
        },
    }
    
    
    app.addInitializer(function() {
        app.on('contact:show', function(cid) {
            app.navigate('contacts/cid/'+cid)
            controller.view(cid)
        })
    })
    
    
    return controller
})