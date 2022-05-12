// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands'

Cypress.Commands.add('logInUser', (username, password) => {
  cy.session([username, password], () => {
    cy.request({
      method: 'POST',
      url: '/api/authenticate',
      body: {
        login: username,
        password
      }
    }).then(({ body }) => {
      const { jwt } = body
      cy.visit('/')
      cy.window().then((win) => {
        win.vm.$store.commit('auth/authSuccess', jwt)
        win.sessionStorage.setItem('token', jwt)
      })
    })
  })
})

Cypress.Commands.add('logOutUser', () => {
  cy.window().then((win) => {
    const token = win.sessionStorage.getItem('token')
    if (token) {
      cy.request({
        url: '/api/authenticate/logout',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(() => {
        window.sessionStorage.removeItem('token')
      })
    }
  })

  cy.visit('/')
})
