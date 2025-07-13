// cypress/support/index.ts

// ——————————————————————————————————————
// 1) Third‑party setup
// ——————————————————————————————————————
import 'cypress-file-upload';
import './commands'; // your custom commands

/// <reference types="cypress" />

// ——————————————————————————————————————
// 2) Stub out NextAuth session on every spec
// ——————————————————————————————————————
beforeEach(() => {
  cy.intercept(
    { method: 'GET', url: '**/api/auth/session*' },
    {
      statusCode: 200,
      body: {
        user: { name: 'Admin User', email: 'admin@example.com' },
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    },
  ).as('getSession');
});

// ——————————————————————————————————————
// 3) Global timeouts & fixtures
// ——————————————————————————————————————
Cypress.config('defaultCommandTimeout', 10_000);
Cypress.config('pageLoadTimeout', 30_000);

before(() => {
  // load any fixtures once
  cy.fixture('users.json').as('users');
});
