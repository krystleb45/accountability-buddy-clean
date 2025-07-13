/// <reference types="cypress" />

describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should load the registration page', () => {
    cy.get('h1').should('contain', 'Register');
  });

  it('should register a new user successfully', () => {
    cy.get('input[name="name"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button').contains('Register').click();
    cy.get('.success-message').should('contain', 'Registration successful');
  });

  it('should display an error for mismatched passwords', () => {
    cy.get('input[name="name"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password321');
    cy.get('button').contains('Register').click();
    cy.get('.error-message').should('contain', 'Passwords do not match');
  });

  it('should display an error for an existing username', () => {
    cy.get('input[name="name"]').type('existinguser');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button').contains('Register').click();
    cy.get('.error-message').should('contain', 'Username already exists');
  });
});
