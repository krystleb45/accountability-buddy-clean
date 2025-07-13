/// <reference types="cypress" />

describe('Audit Logs Page', () => {
  before(() => {
    // Ensure the user is authenticated before running the tests
    cy.loginAs('admin@example.com', 'securepassword123'); // Replace with actual credentials or mock authentication
  });

  beforeEach(() => {
    // Visit the Audit Logs page before each test
    cy.visit('/audit-logs');
  });

  it('should load the audit logs page and display the header', () => {
    // Verify the header or title is displayed
    cy.contains(/audit logs/i).should('be.visible');
  });

  it('should display a list of audit logs', () => {
    // Verify that at least one audit log item is displayed
    cy.get('.audit-log-item').should('have.length.greaterThan', 0); // Adjust the selector if needed
  });

  it('should filter audit logs by date', () => {
    // Input start and end dates for filtering
    cy.get('input[aria-label="Start Date"]').type('2024-01-01');
    cy.get('input[aria-label="End Date"]').type('2024-01-31');
    cy.get('button[aria-label="Filter"]').click();

    // Verify the filtered results
    cy.get('.audit-log-item').each(($log) => {
      cy.wrap($log)
        .find('.log-date') // Adjust the selector to match your app
        .invoke('text')
        .then((dateText: string) => {
          const date = new Date(dateText.trim()); // Ensure `trim` works by casting `dateText` as a string
          const startDate = new Date('2024-01-01');
          const endDate = new Date('2024-01-31');

          // Use Chai assertions with Cypress
          expect(date).to.be.gte(startDate);
          expect(date).to.be.lte(endDate);
        });
    });
  });

  it('should allow sorting audit logs by columns', () => {
    // Click the column header to sort by a specific column (e.g., Date)
    cy.get('th[aria-label="Date"]').click();

    // Verify the logs are sorted by date
    let previousDate: Date | null = null;

    cy.get('.audit-log-item .log-date').each(($date) => {
      const currentDate = new Date($date.text().trim());
      if (previousDate) {
        expect(currentDate).to.be.gte(previousDate);
      }
      previousDate = currentDate;
    });
  });

  it('should support pagination of audit logs', () => {
    // Verify that pagination controls are visible
    cy.get('.pagination-controls').should('be.visible');

    // Navigate to the next page
    cy.get('button[aria-label="Next Page"]').click();

    // Verify logs for the second page are displayed
    cy.get('.audit-log-item').should('have.length.greaterThan', 0); // Adjust as needed
  });

  it('should allow searching for specific audit logs', () => {
    // Search for a specific log (e.g., by user or action)
    cy.get('input[aria-label="Search Logs"]').type('User Login');
    cy.get('button[aria-label="Search"]').click();

    // Verify the search results contain the expected text
    cy.get('.audit-log-item').each((log) => {
      cy.wrap(log).should('contain.text', 'User Login');
    });
  });
});
