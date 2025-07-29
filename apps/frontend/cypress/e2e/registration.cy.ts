/// <reference types="cypress" />

describe('User Registration', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('loads the registration page', () => {
    cy.get('[data-cy="register-header"]').should('contain', 'Register');
  });

  it('registers a new user successfully', () => {
    // Stub the registration API to return success
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: { message: 'Registration successful' },
    }).as('registerUser');

    cy.get('[data-cy="register-name-input"]').type('newuser');
    cy.get('[data-cy="register-email-input"]').type('newuser@example.com');
    cy.get('[data-cy="register-password-input"]').type('Secret123!');
    cy.get('[data-cy="register-confirm-password-input"]').type('Secret123!');
    cy.get('[data-cy="register-button"]').click();

    cy.wait('@registerUser');
    cy.contains('Registration successful').should('be.visible');
  });

  it('displays an error for mismatched passwords', () => {
    cy.get('[data-cy="register-name-input"]').type('testuser');
    cy.get('[data-cy="register-email-input"]').type('test@example.com');
    cy.get('[data-cy="register-password-input"]').type('password123');
    cy.get('[data-cy="register-confirm-password-input"]').type('password321');
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Passwords do not match').should('be.visible');
  });

  it('displays an error for an existing username', () => {
    // Stub the registration API to return a conflict error
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 409,
      body: { error: 'Username already exists' },
    }).as('registerUserConflict');

    cy.get('[data-cy="register-name-input"]').type('existinguser');
    cy.get('[data-cy="register-email-input"]').type('existing@example.com');
    cy.get('[data-cy="register-password-input"]').type('password123');
    cy.get('[data-cy="register-confirm-password-input"]').type('password123');
    cy.get('[data-cy="register-button"]').click();

    cy.wait('@registerUserConflict');
    cy.contains('Username already exists').should('be.visible');
  });
});
