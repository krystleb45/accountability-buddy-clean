/// <reference types="cypress" />

describe('Login Functionality', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login page', () => {
    cy.contains(/login/i).should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[name="email"]').type('user@example.com'); // Replace with valid test email
    cy.get('input[name="password"]').type('password123'); // Replace with valid test password
    cy.get('button[type="submit"]').click();

    // Verify successful redirection or dashboard load
    cy.url().should('include', '/dashboard');
    cy.contains(/welcome back/i).should('be.visible');
  });

  it('should display an error message with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Check for error message
    cy.contains(/invalid email or password/i).should('be.visible');
  });

  it('should disable the login button when fields are empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  // Add more tests for password reset links or error handling if needed
});
