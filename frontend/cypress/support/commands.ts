// cypress/support/commands.ts
/// <reference types="cypress" />
import 'cypress-file-upload';

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaSession(email: string, password?: string): Chainable<void>;
      loginAs(email: string, password?: string): Chainable<void>;
      simulateApiFailure(endpoint: string): Chainable<void>;
      uploadFileCustom(selector: string, fileName: string): Chainable<void>;
      sendMessageInChatroom(message: string): Chainable<void>;
      waitForElement(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;
      assertText(selector: string, expectedText: string): Chainable<JQuery<HTMLElement>>;
      clearLocalStorageCustom(): Chainable<void>;
      navigateToPayments(): Chainable<AUTWindow>;
      navigateToMilitarySupport(): Chainable<AUTWindow>;
      simulateSuccessfulPayment(amount: number, method: string): Chainable<void>;
      simulateFailedPayment(errorMessage: string): Chainable<void>;
      verifyDisclaimer(text: string): Chainable<void>;
      clearChatHistory(): Chainable<void>;
      verifyResourceLinks(resources: { name: string; url: string }[]): Chainable<void>;
      mockAccessControl(role: string): Chainable<void>;
      mockNewMessageNotification(hasNewMessages: boolean): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginViaSession', (email, password) => {
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

Cypress.Commands.add('loginAs', (email, password) => {
  cy.loginViaSession(email, password);
});

Cypress.Commands.add('simulateApiFailure', (endpoint) => {
  cy.intercept(endpoint, {
    statusCode: 500,
    body: { error: 'Internal Server Error' },
  }).as('apiFailure');
});

Cypress.Commands.add('uploadFileCustom', (selector, fileName) => {
  cy.get(selector).attachFile(fileName);
});

Cypress.Commands.add('sendMessageInChatroom', (message) => {
  cy.get('textarea[aria-label="Chat Input"]').type(message);
  cy.get('button[aria-label="Send Message"]').click();
});

Cypress.Commands.add('waitForElement', (selector, timeout = 5000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

Cypress.Commands.add('assertText', (selector, expectedText) => {
  cy.get(selector).should('contain.text', expectedText);
});

Cypress.Commands.add('clearLocalStorageCustom', () => {
  cy.clearLocalStorage();
});

Cypress.Commands.add('navigateToPayments', () => cy.visit('/payments'));
Cypress.Commands.add('navigateToMilitarySupport', () => cy.visit('/military-support'));

Cypress.Commands.add('simulateSuccessfulPayment', (amount, method) => {
  cy.get('input[name="amount"]').type(amount.toString());
  cy.get(`button[data-method="${method}"]`).click();
  cy.contains('Payment successful').should('be.visible');
});

Cypress.Commands.add('simulateFailedPayment', (errorMessage) => {
  cy.contains('Payment failed').should('be.visible');
  cy.contains(errorMessage).should('be.visible');
});

Cypress.Commands.add('verifyDisclaimer', (text) => {
  cy.contains(text).should('be.visible');
});

Cypress.Commands.add('clearChatHistory', () => {
  cy.get('[data-cy="clear-chat-button"]').click();
});

// ——— Updated verifyResourceLinks ———
Cypress.Commands.add('verifyResourceLinks', (resources: { name: string; url: string }[]) => {
  // Use native array forEach so TS knows each item has name & url
  resources.forEach((resource) => {
    const { name, url } = resource;
    cy.contains('a', name).should('have.attr', 'href', url).and('have.attr', 'target', '_blank');
  });
});

Cypress.Commands.add('mockAccessControl', (role) => {
  cy.window().then((win) => win.localStorage.setItem('userRole', role));
  cy.reload();
});

Cypress.Commands.add('mockNewMessageNotification', (hasNewMessages) => {
  if (hasNewMessages) {
    cy.contains('New messages available').should('be.visible');
  } else {
    cy.contains('New messages available').should('not.exist');
  }
});

export {};
