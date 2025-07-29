/// <reference types="cypress" />

describe('Navigation Functionality', () => {
  beforeEach(() => {
    // Globally stubbed auth: visit home and wait for session
    cy.visit('/');
    cy.wait('@getSession');
  });

  it('navigates to the dashboard page', () => {
    cy.get('[data-cy="nav-dashboard-link"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="dashboard-header"]').should('be.visible');
  });

  it('navigates to the profile page', () => {
    cy.get('[data-cy="nav-profile-link"]').click();
    cy.url().should('include', '/profile');
    cy.get('[data-cy="profile-header"]').should('be.visible');
  });

  it('navigates to the settings page', () => {
    cy.get('[data-cy="nav-settings-link"]').click();
    cy.url().should('include', '/settings');
    cy.get('[data-cy="settings-header"]').should('be.visible');
  });

  it('logs out and redirects to the login page', () => {
    cy.get('[data-cy="nav-logout-link"]').click();
    cy.url().should('include', '/login');
    cy.contains(/please log in/i).should('be.visible');
  });
});
