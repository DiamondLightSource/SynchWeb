describe('Home Page', () => {
  beforeEach(() => {
    const { username, password } = Cypress.env()
    cy.logInUser(username, password)
    cy.visit('/')
  })

  it('shows the current url', () => {
    cy.url().should('include','/current')
  })

  it('shows the current visit header', () => {
    cy.findByTestId('current-visit-header').should('exist')
  })
})