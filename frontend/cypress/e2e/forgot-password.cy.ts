/// <reference types="cypress" />

describe('Forgot Password Flow', () => {
  beforeEach(() => {
    // Navigate to the forgot‑password page
    cy.visit('/forgot-password');
  });

  it('displays the forgot password page', () => {
    // Header should be visible
    cy.get('[data-cy="forgot-password-header"]').should('be.visible');
    // Page title should include “Forgot Password”
    cy.title().should('include', 'Forgot Password');
  });

  it('sends a password reset email for a valid user', () => {
    const validEmail = 'user@example.com';

    // Stub the reset‑email API to return success
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: { message: 'Password reset email sent' },
    }).as('sendResetEmail');

    cy.get('input[name="email"]').type(validEmail);
    cy.get('[data-cy="send-reset-email-button"]').click();

    // Wait for the API call and assert UI feedback
    cy.wait('@sendResetEmail');
    cy.contains('Password reset email sent').should('be.visible');
  });

  it('shows an error for an unregistered email', () => {
    const unknownEmail = 'unknown@example.com';

    // Stub the reset‑email API to return a 404 error
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 404,
      body: { error: 'Email not registered' },
    }).as('sendResetEmailError');

    cy.get('input[name="email"]').type(unknownEmail);
    cy.get('[data-cy="send-reset-email-button"]').click();

    cy.wait('@sendResetEmailError');
    cy.contains('Email not registered').should('be.visible');
  });

  it('navigates back to the login page', () => {
    // Click the back‑to‑login link and verify URL
    cy.get('[data-cy="back-to-login-link"]').click();
    cy.url().should('include', '/login');
  });
});
