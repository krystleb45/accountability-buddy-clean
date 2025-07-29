/// <reference types="cypress" />

describe('Dashboard Notifications', () => {
  before(() => {
    // Custom login command for authentication
    cy.loginAs('testuser@example.com', 'password123'); // Replace with valid credentials or mock login
  });

  beforeEach(() => {
    // Visit the notifications page before each test
    cy.visit('/dashboard/notifications');
  });

  it('should display the notifications page header', () => {
    // Verify the header is visible
    cy.contains(/notifications/i).should('be.visible');
  });

  it('should show a list of notifications', () => {
    // Verify the notifications list is displayed and has items
    cy.get('.notification-item')
      .should('have.length.greaterThan', 0)
      .each(($notification) => {
        cy.wrap($notification).should('be.visible');
      });
  });

  it('should mark a notification as read when clicked', () => {
    // Click the first notification and verify it is marked as read
    cy.get('.notification-item').first().as('firstNotification');
    cy.get('@firstNotification').click();
    cy.get('@firstNotification').should('have.class', 'read'); // Ensure 'read' class is applied
  });

  it('should load more notifications when "Load More" is clicked', () => {
    // Simulate loading more notifications
    cy.intercept('GET', '/api/notifications?offset=5', {
      fixture: 'more-notifications.json', // Use a fixture to mock the response
    }).as('loadMoreNotifications');

    // Click "Load More" button
    cy.contains(/load more/i).click();

    // Wait for the mocked API call and verify new notifications are added
    cy.wait('@loadMoreNotifications');
    cy.get('.notification-item').should('have.length.greaterThan', 5);
  });

  it('should display an error message if notifications fail to load', () => {
    // Simulate a server error
    cy.intercept('GET', '/api/notifications', {
      statusCode: 500,
      body: { error: 'Failed to load notifications' },
    }).as('getNotificationsError');

    // Reload the page to trigger the API call
    cy.reload();
    cy.wait('@getNotificationsError');

    // Verify the error message is displayed
    cy.contains(/failed to load notifications/i).should('be.visible');
  });

  it('should clear all notifications when "Clear All" is clicked', () => {
    // Simulate clearing all notifications
    cy.intercept('DELETE', '/api/notifications', { statusCode: 200 }).as('clearAllNotifications');

    // Click "Clear All" button
    cy.contains(/clear all/i).click();

    // Wait for the mocked API call and verify no notifications are displayed
    cy.wait('@clearAllNotifications');
    cy.get('.notification-item').should('not.exist');
  });
});
