/// <reference types="cypress" />

describe('Forgot Password Flow', () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('should display the forgot password page', () => {
    cy.get('.forgot-password-header').should('be.visible');
    cy.title().should('include', 'Forgot Password');
  });

  it('should send a password reset email for a valid user', () => {
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('.send-reset-email-button').click();
    cy.contains('Password reset email sent').should('be.visible');
  });

  it('should show an error for an unregistered email', () => {
    cy.get('input[name="email"]').type('unknown@example.com');
    cy.get('.send-reset-email-button').click();
    cy.contains('Email not registered').should('be.visible');
  });

  it('should navigate back to the login page', () => {
    cy.get('.back-to-login-link').click();
    cy.url().should('include', '/login');
  });
});
