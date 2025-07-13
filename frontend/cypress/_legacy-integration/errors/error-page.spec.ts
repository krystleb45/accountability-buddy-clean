/// <reference types="cypress" />

describe('Error Pages', () => {
  beforeEach(() => {
    cy.visit('/'); // Ensure the base URL is correctly configured in cypress.config.js
  });

  it('should display a 404 page for non-existent routes', () => {
    cy.visit('/non-existent-page');
    cy.contains(/404/i).should('be.visible');
    cy.contains(/page not found/i).should('be.visible'); // Added a more descriptive check
  });

  it('should handle server errors gracefully (500 Internal Server Error)', () => {
    cy.intercept('GET', '/api/failing-endpoint', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getFailingEndpoint');

    cy.visit('/error-page');
    cy.wait('@getFailingEndpoint');
    cy.contains(/something went wrong/i).should('be.visible');
  });

  it('should redirect to a custom error page on major failures', () => {
    // Simulate a redirection to a custom error page
    cy.visit('/major-failure');
    cy.contains(/custom error page/i).should('be.visible');
  });

  // Add additional tests for other error handling scenarios as needed
});
