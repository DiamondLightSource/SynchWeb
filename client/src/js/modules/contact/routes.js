

import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'
import Page from 'app/layouts/page.vue'

const ContactList = import(/* webpackChunkName: "contacts" */  'modules/contact/views/contacts.js')
const ContactView = import(/* webpackChunkName: "contacts" */ 'modules/contact/views/viewcontact.js')
const AddContact = import(/* webpackChunkName: "contacts" */ 'modules/contact/views/addcontact.js')
const ViewContact = import(/* webpackChunkName: "contacts" */ 'modules/contact/views/viewcontact.js')
const ViewUser = import(/* webpackChunkName: "contacts" */ 'modules/contact/views/viewuser')

import Contacts from 'collections/labcontacts.js'
import Contact from 'models/labcontact.js'
import ProposalLookup from 'models/proplookup.js'
import User from 'models/user.js'

import MarionetteApplication from 'app/marionette-application.js'

// Root breadcrumbs for these routes
const bc = { title: 'Home Lab Contacts', url: '/contacts' }

// Initialize MarionetteApplication if not already existing
let application = MarionetteApplication.getInstance()


application.addInitializer(function() {
    application.on('contact:show', function(cid) {
      console.log("Show contact")
      application.navigate('/contacts/cid/'+cid)
    })

    application.on('user:show', function(uid) {
      console.log("user:show")
      application.navigate('/contacts/user/'+uid)
  })
})

const routes = [
  {
    path: '/contacts',
    component: Page,
    children: [
      {
        path: '',
        name: 'legacy-contacts',
        component: MarionetteView,
        props: route => ({
          mview: ContactList,
          breadcrumbs: [bc],
          options: {
            collection: new Contacts(null, { state: { currentPage: route.params.page ? parseInt(route.params.page) : 1}})
          },
        }),
      },
      {
        path: 'cid/:cid',
        component: MarionetteView,
        props: route => ({ 
          mview: ContactView,
          breadcrumbs: [bc],
          breadcrumb_tags: ['CARDNAME'],
          options: {
            model: new Contact({ LABCONTACTID: route.params.cid })
          }
        }),
        beforeEnter: (to, from, next) => {
          // Call the loading state here because we are finding the proposal based on this contact id
          // Prop lookup sets the proposal and type via set application.cookie method which we mapped to the store
          application.loading()

          var lookup = new ProposalLookup({ field: 'LABCONTACTID', value: to.params.cid })
          lookup.find({
            // If OK trigger next 
            success: function() {
              console.log("Calling next - Success. model will be prefetched in marionette view")
              next()
            },
            error: function() {
              console.log("Calling next - Error, no proposal found")
              next('/')
            },
          })
        }
      },
      {
        path: 'add',
        component: MarionetteView,
        props: {
          mview: AddContact,
          breadcrumbs: [bc, {title: 'Add Contact' }]
        }
      },
      // Edit basic user contact details (email, phone etc.)
      // If no id set, edit the current logged in user
      {
        path: 'user/:pid([0-9]+)?',
        component: MarionetteView,
        props: route => ({
          mview: ViewUser,
          breadcrumbs: [bc, { title: 'View User' }],
          options: {
            model: new User({PERSONID: route.params.pid ? +route.params.pid : application.personid})
          },
        }),
      },
    ]
  },
]

export default routes
