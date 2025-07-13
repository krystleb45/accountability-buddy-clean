// cypress/support/commands.ts
/// <reference types="cypress" />

// ——————————————————————————————————————
// 1) TypeScript augmentation for all custom commands
// ——————————————————————————————————————
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Programmatic login via NextAuth + CSRF + session caching
       */
      loginViaSession(email: string, password?: string): Chainable<void>;

      /**
       * Simulate backend failure on the given endpoint
       */
      simulateApiFailure(endpoint: string): Chainable<void>;

      /**
       * Send a message in the chatroom textarea
       */
      sendMessageInChatroom(message: string): Chainable<void>;

      /**
       * Verify that a disclaimer text is visible
       */
      verifyDisclaimer(text: string): Chainable<void>;

      /**
       * Clear the chat history via UI button
       */
      clearChatHistory(): Chainable<void>;

      /**
       * Verify that a list of resources (name + URL) is rendered as links
       */
      verifyResourceLinks(resources: { name: string; url: string }[]): Chainable<void>;

      /**
       * Mock UI-based access control by setting localStorage
       */
      mockAccessControl(role: string): Chainable<void>;

      /**
       * Assert presence or absence of a "New messages available" UI indicator
       */
      mockNewMessageNotification(hasNewMessages: boolean): Chainable<void>;

      // add any other custom commands here…
    }
  }
}

// ——————————————————————————————————————
// 2) Implementations
// ——————————————————————————————————————

// Programmatic login via NextAuth Credentials + session caching
Cypress.Commands.add('loginViaSession', (email: string, password?: string) => {
  const pw = password ?? Cypress.env('TEST_USER_PASSWORD');
  cy.session([email, pw], () => {
    cy.request('GET', '/api/auth/csrf')
      .its('body.csrfToken')
      .then((csrfToken) => {
        cy.request({
          method: 'POST',
          url: '/api/auth/callback/credentials',
          form: true,
          body: { email, password: pw, csrfToken },
        })
          .its('status')
          .should('eq', 200);
      });
  });
});

// Simulate backend failure
Cypress.Commands.add('simulateApiFailure', (endpoint: string) => {
  cy.intercept(endpoint, {
    statusCode: 500,
    body: { error: 'Internal Server Error' },
  }).as('apiFailure');
});

// Send a message in the chatroom textarea
Cypress.Commands.add('sendMessageInChatroom', (message: string) => {
  cy.get('textarea[aria-label="Type a message"]').type(message);
  cy.get('button[aria-label="Send"]').click();
});

// Verify a disclaimer text is visible
Cypress.Commands.add('verifyDisclaimer', (text: string) => {
  cy.contains(text).should('be.visible');
});

// Clear the chat history via UI button
Cypress.Commands.add('clearChatHistory', () => {
  cy.get('button[aria-label="Clear Chat"]').click();
});

// Verify that a list of resources (name + URL) is rendered as links
Cypress.Commands.add('verifyResourceLinks', (resources: { name: string; url: string }[]) => {
  resources.forEach(({ name, url }) => {
    cy.contains('a', name).should('have.attr', 'href', url);
  });
});

// Mock UI-based access control
Cypress.Commands.add('mockAccessControl', (role: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('userRole', role);
  });
  cy.reload();
});

// Assert presence or absence of a "New messages available" UI indicator
Cypress.Commands.add('mockNewMessageNotification', (hasNewMessages: boolean) => {
  if (hasNewMessages) {
    cy.contains('New messages available').should('be.visible');
  } else {
    cy.contains('New messages available').should('not.exist');
  }
});

// Ensure this file is treated as a module
export {};
