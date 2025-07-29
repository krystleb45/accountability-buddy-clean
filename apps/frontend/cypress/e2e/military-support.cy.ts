/// <reference types="cypress" />

describe('Military Support Section', () => {
  beforeEach(() => {
    // stub session check
    cy.intercept('GET', '/api/auth/session', { fixture: 'session.json' }).as('getSession');
    cy.visit('/military-support');
    cy.wait('@getSession');
  });

  it('displays the Military Support page header', () => {
    cy.contains(/military support/i).should('be.visible');
  });

  it('navigates to external resource links when clicked', () => {
    const resources = [
      { name: 'Veterans Crisis Line', url: 'https://www.veteranscrisisline.net/' },
      { name: 'Military OneSource', url: 'https://www.militaryonesource.mil/' },
      { name: 'National Suicide Prevention Lifeline', url: 'https://988lifeline.org/' },
    ];

    resources.forEach(({ name, url }) => {
      cy.contains('a', name).should('have.attr', 'href', url).and('have.attr', 'target', '_blank');
    });
  });

  it('allows users to send messages in the chatroom', () => {
    const testMessage = 'Hello, is anyone here?';
    cy.sendMessageInChatroom(testMessage);
    cy.contains('.chat-message', testMessage).should('be.visible');
  });

  it('loads existing chat messages on page load', () => {
    cy.intercept('GET', '/api/military-support/messages', {
      statusCode: 200,
      body: [
        { id: 1, sender: 'User1', message: 'Welcome to the chatroom!' },
        { id: 2, sender: 'User2', message: 'How can I help you today?' },
      ],
    }).as('getMessages');

    cy.reload();
    cy.wait('@getMessages');

    cy.contains('.chat-message', 'Welcome to the chatroom!').should('be.visible');
    cy.contains('.chat-message', 'How can I help you today?').should('be.visible');
  });

  it('displays an error when chat messages fail to load', () => {
    // inline failure stub
    cy.intercept('GET', '/api/military-support/messages', {
      statusCode: 500,
      body: { error: 'Failed to load messages' },
    }).as('apiFailure');

    cy.reload();
    cy.wait('@apiFailure');
    cy.contains(/failed to load messages/i).should('be.visible');
  });

  it('shows the disclaimer at the bottom of the page', () => {
    cy.get('[data-cy="military-disclaimer"]')
      .should('be.visible')
      .and(
        'contain.text',
        'Disclaimer: The Military Support Section provides peer support and resource recommendations. It is not a substitute for professional medical or mental health advice.',
      );
  });

  it('notifies users of new messages', () => {
    cy.intercept('GET', '/api/military-support/new-messages', {
      statusCode: 200,
      body: { hasNewMessages: true },
    }).as('checkNewMessages');

    cy.reload();
    cy.wait('@checkNewMessages');
    cy.get('[data-cy="new-message-notification"]')
      .should('be.visible')
      .and('contain.text', 'You have new messages');
  });

  it('supports clearing chat history', () => {
    cy.intercept('DELETE', '/api/military-support/messages', {
      statusCode: 200,
    }).as('clearMessages');

    cy.get('[data-cy="clear-chat-button"]').click();
    cy.contains(/are you sure you want to clear the chat/i).should('be.visible');
    cy.get('[data-cy="confirm-clear-button"]').click();

    cy.wait('@clearMessages');
    cy.get('.chat-message').should('not.exist');
  });

  it('restricts access to military members only', () => {
    cy.intercept('GET', '/api/user/role', {
      statusCode: 200,
      body: { role: 'military' },
    }).as('getUserRole');

    cy.reload();
    cy.wait('@getUserRole');
    cy.contains(/welcome military member/i).should('be.visible');
  });

  it('denies access to non-military users', () => {
    cy.intercept('GET', '/api/user/role', {
      statusCode: 403,
      body: { error: 'Access denied' },
    }).as('getUserRoleDenied');

    cy.reload();
    cy.wait('@getUserRoleDenied');
    cy.contains(/access denied/i).should('be.visible');
  });
});
