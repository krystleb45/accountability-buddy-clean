/// <reference types="cypress" />

describe('Military Support Section', () => {
  before(() => {
    // Custom login command for authentication
    cy.loginAs('militaryuser@example.com', 'securepassword123'); // Replace with valid credentials or mock login
  });

  beforeEach(() => {
    // Visit the Military Support page before each test
    cy.visit('/military-support');
  });

  it('should display the Military Support page header', () => {
    // Verify the page header is visible
    cy.contains(/military support/i).should('be.visible');
  });

  it('should navigate to external resource links when clicked', () => {
    // Test resource links
    const resources = [
      {
        name: 'Veterans Crisis Line',
        url: 'https://www.veteranscrisisline.net/',
      },
      { name: 'Military OneSource', url: 'https://www.militaryonesource.mil/' },
      {
        name: 'National Suicide Prevention Lifeline',
        url: 'https://988lifeline.org/',
      },
    ];

    resources.forEach(({ name, url }) => {
      cy.contains('a', name).should('have.attr', 'href', url).and('have.attr', 'target', '_blank');
    });
  });

  it('should allow users to send messages in the chatroom', () => {
    // Type and send a chat message
    const testMessage = 'Hello, is anyone here?';

    cy.get('textarea[aria-label="Chat Input"]').type(testMessage);
    cy.get('button[aria-label="Send Message"]').click();

    // Verify the message appears in the chatroom
    cy.contains('.chat-message', testMessage).should('be.visible');
  });

  it('should load existing chat messages on page load', () => {
    // Mock API response for chat messages
    cy.intercept('GET', '/api/military-support/messages', {
      statusCode: 200,
      body: [
        { id: 1, sender: 'User1', message: 'Welcome to the chatroom!' },
        { id: 2, sender: 'User2', message: 'How can I help you today?' },
      ],
    }).as('getMessages');

    // Reload the page and wait for messages to load
    cy.reload();
    cy.wait('@getMessages');

    // Verify the chat messages are displayed
    cy.contains('.chat-message', 'Welcome to the chatroom!').should('be.visible');
    cy.contains('.chat-message', 'How can I help you today?').should('be.visible');
  });

  it('should display an error message if chat messages fail to load', () => {
    // Mock API error for chat messages
    cy.intercept('GET', '/api/military-support/messages', {
      statusCode: 500,
      body: { error: 'Failed to load messages' },
    }).as('getMessagesError');

    // Reload the page and wait for the error
    cy.reload();
    cy.wait('@getMessagesError');

    // Verify the error message is displayed
    cy.contains(/failed to load messages/i).should('be.visible');
  });

  it('should display the disclaimer at the bottom of the page', () => {
    // Verify the disclaimer is visible
    cy.get('.disclaimer')
      .should('be.visible')
      .contains(
        'Disclaimer: The Military Support Section provides peer support and resource recommendations. It is not a substitute for professional medical or mental health advice.',
      );
  });

  it('should notify users of new messages', () => {
    // Mock a new message notification
    cy.intercept('GET', '/api/military-support/new-messages', {
      statusCode: 200,
      body: { hasNewMessages: true },
    }).as('checkNewMessages');

    // Simulate a periodic check for new messages
    cy.wait('@checkNewMessages');

    // Verify the notification is displayed
    cy.get('.new-message-notification')
      .should('be.visible')
      .and('contain.text', 'You have new messages');
  });

  it('should support clearing chat history', () => {
    // Mock API response for clearing chat history
    cy.intercept('DELETE', '/api/military-support/messages', {
      statusCode: 200,
    }).as('clearMessages');

    // Click the "Clear Chat" button
    cy.get('button[aria-label="Clear Chat"]').click();

    // Verify confirmation dialog appears
    cy.contains(/are you sure you want to clear the chat/i).should('be.visible');

    // Confirm clearing chat history
    cy.get('button[aria-label="Confirm Clear"]').click();
    cy.wait('@clearMessages');

    // Verify the chatroom is empty
    cy.get('.chat-message').should('not.exist');
  });

  it('should restrict access to military members only', () => {
    // Mock API response for user role validation
    cy.intercept('GET', '/api/user/role', {
      statusCode: 200,
      body: { role: 'military' },
    }).as('getUserRole');

    // Wait for the role validation
    cy.wait('@getUserRole');

    // Verify the user has access
    cy.contains(/welcome military member/i).should('be.visible');
  });

  it('should deny access to non-military users', () => {
    // Mock API response for non-military role
    cy.intercept('GET', '/api/user/role', {
      statusCode: 403,
      body: { error: 'Access denied' },
    }).as('getUserRoleDenied');

    // Reload the page
    cy.reload();
    cy.wait('@getUserRoleDenied');

    // Verify the access denied message
    cy.contains(/access denied/i).should('be.visible');
  });
});
