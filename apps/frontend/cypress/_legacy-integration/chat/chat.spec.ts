/// <reference types="cypress" />

describe('Chat Functionality', () => {
  before(() => {
    // Custom login command to authenticate the user
    cy.loginAs('testuser@example.com', 'password123'); // Replace with actual credentials or mock login
  });

  beforeEach(() => {
    // Navigate to the chat page before each test
    cy.visit('/chat');
  });

  it('should load the chat page and display the header', () => {
    // Verify that the chat page loads and the header is visible
    cy.contains(/chat/i).should('be.visible');
  });

  it('should send a chat message', () => {
    const message = 'Hello, this is a test message!';

    // Type a message into the input field
    cy.get('input[aria-label="Type a message"]').type(message);

    // Click the send button
    cy.get('button[aria-label="Send"]').click();

    // Verify the message appears in the chat
    cy.get('.chat-message').contains(message).should('be.visible'); // Adjust the selector if needed
  });

  it('should receive a new message notification', () => {
    // Simulate receiving a new message notification
    cy.intercept('GET', '/api/chat/messages', {
      fixture: 'new-message.json',
    }).as('getNewMessage');
    cy.wait('@getNewMessage');

    // Verify that the new message notification is visible
    cy.get('.new-message-notification').should('be.visible');
  });

  it('should display the chat history', () => {
    // Verify that chat history items are displayed
    cy.get('.chat-history-item').should('have.length.greaterThan', 0); // Adjust selector based on your app's structure
  });

  it('should load older messages when scrolling up', () => {
    // Simulate scrolling to the top of the chat history
    cy.get('.chat-history').scrollTo('top');

    // Verify that older messages are loaded
    cy.intercept('GET', '/api/chat/older-messages', {
      fixture: 'older-messages.json',
    }).as('getOlderMessages');
    cy.wait('@getOlderMessages');
    cy.get('.chat-history-item').should('have.length.greaterThan', 10); // Adjust based on your app's behavior
  });

  it('should allow reacting to a chat message', () => {
    // Hover over a chat message to reveal reaction options
    cy.get('.chat-message').first().trigger('mouseover');

    // Click on a reaction button
    cy.get('button[aria-label="React with heart"]').click(); // Adjust selector based on your app's structure

    // Verify that the reaction is added
    cy.get('.chat-message .reaction').should('contain.text', '❤️'); // Adjust selector based on your app
  });

  it('should display an error message when the chat server is unavailable', () => {
    // Simulate a server error
    cy.intercept('POST', '/api/chat/send', {
      statusCode: 500,
      body: { error: 'Server unavailable' },
    }).as('sendMessageError');

    const message = 'This message will fail';
    cy.get('input[aria-label="Type a message"]').type(message);
    cy.get('button[aria-label="Send"]').click();

    // Verify that the error message is displayed
    cy.get('.chat-error').should('contain.text', 'Server unavailable');
  });
});
