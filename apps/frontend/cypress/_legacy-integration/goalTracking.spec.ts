/// <reference types="cypress" />

describe('Goal Tracking Features', () => {
  before(() => {
    // Custom command to log in the user
    cy.loginAs('testuser@example.com', 'password123'); // Replace with actual credentials or mock login
  });

  beforeEach(() => {
    // Visit the goal tracking page before each test
    cy.visit('/goals');
  });

  it('should display the goal tracking page', () => {
    // Verify the goal tracking page is loaded
    cy.contains(/goal tracking/i).should('be.visible');
  });

  it('should create a new goal successfully', () => {
    // Enter a new goal and add it
    const goalName = 'New Goal';
    cy.get('input[placeholder="Enter your goal"]').type(goalName);
    cy.get('button[aria-label="Add Goal"]').click();

    // Verify the new goal appears in the goal list
    cy.contains(goalName).should('be.visible');
  });

  it('should update a goal successfully', () => {
    // Edit the first goal in the list
    const updatedGoalName = 'Updated Goal';
    cy.get('.goal-item').first().as('goalToEdit');
    cy.get('@goalToEdit').find('button[aria-label="Edit Goal"]').click();
    cy.get('@goalToEdit').find('input[aria-label="Edit Goal Name"]').clear().type(updatedGoalName);
    cy.get('@goalToEdit').find('button[aria-label="Save Goal"]').click();

    // Verify the updated goal name
    cy.contains(updatedGoalName).should('be.visible');
  });

  it('should mark a goal as completed', () => {
    // Mark the first goal as completed
    cy.get('.goal-item').first().as('goalToComplete');
    cy.get('@goalToComplete').find('input[type="checkbox"]').check();

    // Verify the goal is marked as completed
    cy.get('@goalToComplete').should('have.class', 'completed');
  });

  it('should delete a goal', () => {
    // Delete the first goal
    cy.get('.goal-item').first().as('goalToDelete');
    cy.get('@goalToDelete').find('button[aria-label="Delete Goal"]').click();

    // Verify the goal is removed from the list
    cy.get('@goalToDelete').should('not.exist');
  });

  it('should display an error message if goal creation fails', () => {
    // Simulate a server error for goal creation
    cy.intercept('POST', '/api/goals', {
      statusCode: 500,
      body: { error: 'Failed to create goal' },
    }).as('createGoalError');

    // Attempt to create a new goal
    cy.get('input[placeholder="Enter your goal"]').type('Error Goal');
    cy.get('button[aria-label="Add Goal"]').click();

    // Wait for the API call and verify the error message
    cy.wait('@createGoalError');
    cy.contains(/failed to create goal/i).should('be.visible');
  });

  it('should display goals loaded from the server', () => {
    // Mock API response with goals
    cy.intercept('GET', '/api/goals', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Goal 1', completed: false },
        { id: 2, name: 'Goal 2', completed: true },
      ],
    }).as('getGoals');

    // Reload the page and wait for the goals to load
    cy.reload();
    cy.wait('@getGoals');

    // Verify the goals are displayed
    cy.get('.goal-item').should('have.length', 2);
    cy.contains('Goal 1').should('be.visible');
    cy.contains('Goal 2').should('be.visible');
  });

  it('should show progress for completed goals', () => {
    // Verify that completed goals contribute to the progress bar
    cy.get('.progress-bar').invoke('width').should('be.greaterThan', 0);
  });

  it('should display a confirmation prompt before deleting a goal', () => {
    // Click the delete button for the first goal
    cy.get('.goal-item').first().as('goalToDelete');
    cy.get('@goalToDelete').find('button[aria-label="Delete Goal"]').click();

    // Verify the confirmation prompt appears
    cy.contains(/are you sure you want to delete this goal/i).should('be.visible');

    // Confirm deletion
    cy.get('button[aria-label="Confirm Delete"]').click();

    // Verify the goal is removed
    cy.get('@goalToDelete').should('not.exist');
  });
});
