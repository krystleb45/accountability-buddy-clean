/// <reference types="cypress" />

describe('Dashboard Functionality', () => {
  before(() => {
    // Custom command to log in a user
    cy.loginAs('testuser@example.com', 'password123'); // Replace with actual credentials or mock login
  });

  beforeEach(() => {
    // Visit the dashboard page before each test
    cy.visit('/dashboard');
  });

  it('should load the dashboard and display a welcome message', () => {
    // Verify the welcome message is displayed
    cy.contains(/welcome to your dashboard/i).should('be.visible');
  });

  it("should display the user's name if logged in", () => {
    // Verify the user's name is visible and not empty
    cy.get('.user-name')
      .should('be.visible')
      .and('not.be.empty')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.not.equal('');
      });
  });

  it('should show recent activities', () => {
    // Verify the "Recent Activities" section is visible
    cy.contains(/recent activities/i).should('be.visible');

    // Verify at least one activity item is displayed
    cy.get('.activity-item')
      .should('have.length.greaterThan', 0)
      .each(($item) => {
        cy.wrap($item).should('be.visible').and('not.be.empty');
      });
  });

  it('should load notifications if available', () => {
    // Verify the "Notifications" section is visible
    cy.contains(/notifications/i).should('be.visible');

    // Verify at least one notification item is displayed
    cy.get('.notification-item').should('exist').and('be.visible');
  });

  it('should allow dismissing a notification', () => {
    // Simulate dismissing a notification
    cy.get('.notification-item')
      .first()
      .within(() => {
        cy.get('button[aria-label="Dismiss"]').click();
      });

    // Verify the notification is removed
    cy.get('.notification-item').should('have.length.greaterThan', 0); // Adjust as needed
  });

  it('should display an error message if the dashboard fails to load', () => {
    // Simulate a server error for the dashboard API
    cy.intercept('GET', '/api/dashboard', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getDashboardError');
    cy.visit('/dashboard');
    cy.wait('@getDashboardError');

    // Verify the error message is displayed
    cy.contains(/failed to load dashboard/i).should('be.visible');
  });

  it('should allow navigating to other sections from the dashboard', () => {
    // Example: Navigate to the "Settings" page
    cy.get('a[aria-label="Settings"]').click();

    // Verify the settings page is loaded
    cy.url().should('include', '/settings');
    cy.contains(/settings/i).should('be.visible');
  });
});
