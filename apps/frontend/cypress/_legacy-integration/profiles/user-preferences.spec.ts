/// <reference types="cypress" />

describe('User Preferences Management', () => {
  before(() => {
    // Custom login command for user authentication
    cy.loginAs('testuser@example.com', 'password123'); // Replace with actual credentials or mock login
  });

  beforeEach(() => {
    // Navigate to the preferences page before each test
    cy.visit('/profile/preferences');
  });

  it('should load the user preferences page', () => {
    // Verify the page header or section is visible
    cy.contains(/user preferences/i).should('be.visible');
  });

  it('should update a preference successfully', () => {
    // Check the email notifications checkbox
    cy.get('input[name="emailNotifications"]').check();

    // Click the "Save Preferences" button
    cy.get('button[aria-label="Save Preferences"]').click();

    // Verify the success message is displayed
    cy.contains(/preferences updated successfully/i).should('be.visible');

    // Reload the page and verify the preference remains updated
    cy.reload();
    cy.get('input[name="emailNotifications"]').should('be.checked');
  });

  it('should show an error message if preferences update fails', () => {
    // Simulate a server error for the preferences API
    cy.intercept('POST', '/api/preferences', {
      statusCode: 500,
      body: { error: 'Update failed' },
    }).as('updatePreferencesError');

    // Attempt to save preferences
    cy.get('button[aria-label="Save Preferences"]').click();

    // Wait for the mocked API call
    cy.wait('@updatePreferencesError');

    // Verify the error message is displayed
    cy.contains(/update failed/i).should('be.visible');
  });

  it('should allow toggling multiple preferences', () => {
    // Toggle multiple preferences (adjust selectors as needed)
    cy.get('input[name="emailNotifications"]').check();
    cy.get('input[name="smsNotifications"]').uncheck();

    // Save preferences
    cy.get('button[aria-label="Save Preferences"]').click();

    // Verify the success message is displayed
    cy.contains(/preferences updated successfully/i).should('be.visible');

    // Reload the page to confirm the preferences are persisted
    cy.reload();
    cy.get('input[name="emailNotifications"]').should('be.checked');
    cy.get('input[name="smsNotifications"]').should('not.be.checked');
  });

  it('should display the default preferences on page load', () => {
    // Simulate default preferences using API mock
    cy.intercept('GET', '/api/preferences', {
      statusCode: 200,
      body: {
        emailNotifications: true,
        smsNotifications: false,
      },
    }).as('getPreferences');

    // Reload the page and wait for the mocked API response
    cy.reload();
    cy.wait('@getPreferences');

    // Verify default preferences are displayed
    cy.get('input[name="emailNotifications"]').should('be.checked');
    cy.get('input[name="smsNotifications"]').should('not.be.checked');
  });

  it('should disable the save button when no changes are made', () => {
    // Verify the "Save Preferences" button is disabled on page load
    cy.get('button[aria-label="Save Preferences"]').should('be.disabled');

    // Make a change
    cy.get('input[name="emailNotifications"]').check();

    // Verify the "Save Preferences" button is enabled after a change
    cy.get('button[aria-label="Save Preferences"]').should('not.be.disabled');
  });
});
