/// <reference types="cypress" />

describe('Settings Management', () => {
  beforeEach(() => {
    cy.visit('/settings');
  });

  it('should load the settings page', () => {
    cy.get('h1').should('contain', 'Settings');
  });

  it('should update user preferences', () => {
    cy.get('input[name="username"]').clear().type('UpdatedUser');
    cy.get('button').contains('Save Changes').click();
    cy.get('.success-message').should('contain', 'Preferences updated successfully');
  });
});
