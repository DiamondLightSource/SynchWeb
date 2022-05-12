describe('Landing Page', () => {
  beforeEach(() => {
    cy.logOutUser()
  })

  it('successfully loads', () => {
    cy.visit('/')
    cy.findByTestId('home-link').should('exist')
  })

  it('does not show logout link', () => {
    cy.visit('/')
    cy.findByTestId('logout-link').should('not.exist')
  })
})