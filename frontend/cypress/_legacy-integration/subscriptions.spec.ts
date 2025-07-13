/// <reference types="cypress" />

describe('Subscription Management', () => {
  before(() => {
    // Custom login command for authentication
    cy.loginAs('testuser@example.com', 'password123'); // Replace with actual credentials or mock login
  });

  beforeEach(() => {
    // Visit the subscription page before each test
    cy.visit('/subscriptions');
  });

  it('should display available subscription plans', () => {
    // Mock API response for subscription plans
    cy.intercept('GET', '/api/subscription/plans', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Basic', price: 10 },
        { id: 2, name: 'Premium', price: 20 },
        { id: 3, name: 'Pro', price: 30 },
      ],
    }).as('getPlans');

    // Reload the page and wait for the plans to load
    cy.reload();
    cy.wait('@getPlans');

    // Verify the plans are displayed
    cy.contains(/basic/i).should('be.visible');
    cy.contains(/premium/i).should('be.visible');
    cy.contains(/pro/i).should('be.visible');
  });

  it('should allow a user to subscribe to a plan', () => {
    // Select a plan and subscribe
    cy.contains('button', /subscribe/i)
      .first()
      .click();

    // Mock API response for successful subscription
    cy.intercept('POST', '/api/subscription/subscribe', {
      statusCode: 200,
      body: { message: 'Subscription successful' },
    }).as('subscribe');

    // Verify the success message is displayed
    cy.wait('@subscribe');
    cy.contains(/subscription successful/i).should('be.visible');
  });

  it("should display the user's current subscription", () => {
    // Mock API response for current subscription
    cy.intercept('GET', '/api/subscription/current', {
      statusCode: 200,
      body: { id: 2, name: 'Premium', price: 20 },
    }).as('getCurrentSubscription');

    // Reload the page and wait for the current subscription to load
    cy.reload();
    cy.wait('@getCurrentSubscription');

    // Verify the current subscription is displayed
    cy.contains(/current subscription/i).should('be.visible');
    cy.contains(/premium/i).should('be.visible');
  });

  it('should allow upgrading to a higher plan', () => {
    // Mock API response for upgrade
    cy.intercept('POST', '/api/subscription/upgrade', {
      statusCode: 200,
      body: { message: 'Upgrade successful' },
    }).as('upgradeSubscription');

    // Click the upgrade button
    cy.contains('button', /upgrade/i).click();

    // Verify the success message is displayed
    cy.wait('@upgradeSubscription');
    cy.contains(/upgrade successful/i).should('be.visible');
  });

  it('should allow downgrading to a lower plan', () => {
    // Mock API response for downgrade
    cy.intercept('POST', '/api/subscription/downgrade', {
      statusCode: 200,
      body: { message: 'Downgrade successful' },
    }).as('downgradeSubscription');

    // Click the downgrade button
    cy.contains('button', /downgrade/i).click();

    // Verify the success message is displayed
    cy.wait('@downgradeSubscription');
    cy.contains(/downgrade successful/i).should('be.visible');
  });

  it('should handle subscription errors gracefully', () => {
    // Simulate a server error for subscription
    cy.intercept('POST', '/api/subscription/subscribe', {
      statusCode: 500,
      body: { error: 'Subscription failed' },
    }).as('subscribeError');

    // Attempt to subscribe
    cy.contains('button', /subscribe/i)
      .first()
      .click();

    // Verify the error message is displayed
    cy.wait('@subscribeError');
    cy.contains(/subscription failed/i).should('be.visible');
  });

  it('should allow canceling a subscription', () => {
    // Mock API response for canceling a subscription
    cy.intercept('POST', '/api/subscription/cancel', {
      statusCode: 200,
      body: { message: 'Subscription canceled successfully' },
    }).as('cancelSubscription');

    // Click the cancel subscription button
    cy.contains('button', /cancel subscription/i).click();

    // Verify the success message is displayed
    cy.wait('@cancelSubscription');
    cy.contains(/subscription canceled successfully/i).should('be.visible');
  });

  it('should restrict access to subscription management for unauthenticated users', () => {
    // Mock an unauthenticated user response
    cy.intercept('GET', '/api/subscription/plans', {
      statusCode: 401,
      body: { error: 'Unauthorized' },
    }).as('unauthorizedAccess');

    // Visit the subscription page without login
    cy.clearCookies(); // Simulate logging out
    cy.visit('/subscriptions');

    // Verify the access denied message
    cy.wait('@unauthorizedAccess');
    cy.contains(/unauthorized/i).should('be.visible');
  });
});
