describe("Create Slices", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('A user can create a custom type', () => {
    cy.setupSliceMachineUserContext()
    cy.visit('/slices')
    cy.get('[data-cy=create-slice]').click()
    cy
      .get('[data-cy=create-slice-modal]')
      .should('be.visible');
    cy.get('input[data-cy=slice-name-input]').type('MySlice')
    cy.get('[data-cy=create-slice-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should('eq', '/slices/MySlice/default-slice')
  })
})
