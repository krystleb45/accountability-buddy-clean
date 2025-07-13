/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should load the authentication page', () => {
    cy.get('.auth-header').should('contain', 'Welcome');
    cy.title().should('include', 'Auth');
  });

  it('should handle successful login', () => {
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('.login-button').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, testuser').should('be.visible');
  });

  it('should display an error for invalid login', () => {
    cy.get('input[name="username"]').type('invaliduser');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('.login-button').click();
    cy.contains('Invalid username or password').should('be.visible');
  });

  it('should navigate to the registration page', () => {
    cy.get('.register-link').click();
    cy.url().should('include', '/register');
  });

  it('should navigate to forgot password page', () => {
    cy.get('.forgot-password-link').click();
    cy.url().should('include', '/forgot-password');
  });
});
