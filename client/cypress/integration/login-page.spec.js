describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('successfully loads', () => {
    cy.findByTestId('username').should('exist')
    cy.findByTestId('password').should('exist')
    cy.findByTestId('login-submit').should('exist')
  })

  describe('logging in', () => {
    beforeEach(() => {
      cy.logOutUser()
    })

    it('logs the user in with the correct detail', () => {
      const { username, password } = Cypress.env()
      cy.logInUser(username, password)
      cy.visit('/')
      cy.findByTestId('logout-link').should('exist')
    })

    it('throws an error if password is missing', () => {
      cy.visit('/login')
      cy.get('#username').type('vdt49869')
      cy.get('#login-submit').click()
      cy.findByTestId('password-error').should('exist')
    })

    it('throws an error if username is missing', () => {
      cy.visit('/login')
      cy.get('#password').type('vdt49869')
      cy.get('#login-submit').click()
      cy.findByTestId('username-error').should('exist')
    })
  })
})