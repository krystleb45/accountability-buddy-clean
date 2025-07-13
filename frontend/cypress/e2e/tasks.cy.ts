/// <reference types="cypress" />

describe('Task Management', () => {
  const VALID_EMAIL = 'admin@example.com';
  const VALID_PASSWORD = Cypress.env('TEST_USER_PASSWORD');

  before(() => {
    // Programmatic login via NextAuth + CSRF + session caching
    cy.loginViaSession(VALID_EMAIL, VALID_PASSWORD);
  });

  beforeEach(() => {
    cy.visit('/tasks');
  });

  it('displays the task management page', () => {
    cy.contains(/task management/i).should('be.visible');
  });

  it('creates a new task successfully', () => {
    const taskName = 'New Task';

    // Stub network to monitor creation
    cy.intercept('POST', '/api/tasks').as('createTask');

    cy.get('[data-cy="task-input"]').type(taskName);
    cy.get('[data-cy="add-task-button"]').click();

    cy.wait('@createTask');
    cy.contains('[data-cy="task-item"]', taskName).should('be.visible');
  });

  it('marks a task as completed', () => {
    cy.get('[data-cy="task-item"]').first().as('firstTask');
    cy.get('@firstTask').find('[data-cy="task-complete-checkbox"]').check();
    cy.get('@firstTask').should('have.class', 'completed');
  });

  it('deletes a task', () => {
    cy.get('[data-cy="task-item"]').first().as('taskToDelete');
    cy.get('@taskToDelete').find('[data-cy="delete-task-button"]').click();
    cy.get('@taskToDelete').should('not.exist');
  });

  it('displays an error message if task creation fails', () => {
    // Use custom command to stub server error
    cy.simulateApiFailure('/api/tasks');

    cy.get('[data-cy="task-input"]').type('Error Task');
    cy.get('[data-cy="add-task-button"]').click();

    cy.wait('@apiFailure');
    cy.contains(/failed to create task/i).should('be.visible');
  });

  it('allows editing a task', () => {
    const updatedTaskName = 'Updated Task';

    cy.get('[data-cy="task-item"]').first().as('taskToEdit');
    cy.get('@taskToEdit').find('[data-cy="edit-task-button"]').click();
    cy.get('@taskToEdit').find('[data-cy="edit-task-input"]').clear().type(updatedTaskName);
    cy.get('@taskToEdit').find('[data-cy="save-task-button"]').click();

    cy.contains('[data-cy="task-item"]', updatedTaskName).should('be.visible');
  });

  it('loads tasks on page load', () => {
    cy.intercept('GET', '/api/tasks', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Task 1', completed: false },
        { id: 2, name: 'Task 2', completed: true },
      ],
    }).as('loadTasks');

    cy.reload();
    cy.wait('@loadTasks');

    cy.get('[data-cy="task-item"]').should('have.length', 2);
    cy.contains('[data-cy="task-item"]', 'Task 1').should('be.visible');
    cy.contains('[data-cy="task-item"]', 'Task 2').should('be.visible');
  });
});
