/// <reference types="cypress" />

describe('Task Management', () => {
  before(() => {
    // Custom command to handle user login
    cy.loginAs('testuser@example.com', 'password123'); // Replace with actual credentials or mock login
  });

  beforeEach(() => {
    // Visit the task management page before each test
    cy.visit('/tasks');
  });

  it('should display the task management page', () => {
    // Verify the task management page is loaded
    cy.contains(/task management/i).should('be.visible');
  });

  it('should create a new task successfully', () => {
    // Enter a new task and add it
    const taskName = 'New Task';
    cy.get('input[placeholder="Enter new task"]').type(taskName);
    cy.get('button[aria-label="Add Task"]').click();

    // Verify the new task appears in the task list
    cy.contains(taskName).should('be.visible');
  });

  it('should mark a task as completed', () => {
    // Check the first task's checkbox
    cy.get('.task-item').first().as('firstTask');
    cy.get('@firstTask').find('input[type="checkbox"]').check();

    // Verify the task is marked as completed
    cy.get('@firstTask').should('have.class', 'completed');
  });

  it('should delete a task', () => {
    // Delete the first task
    cy.get('.task-item').first().as('taskToDelete');
    cy.get('@taskToDelete').find('button[aria-label="Delete Task"]').click();

    // Verify the task is removed from the list
    cy.get('.task-item').should('not.contain', '@taskToDelete');
  });

  it('should display an error message if task creation fails', () => {
    // Simulate a server error for task creation
    cy.intercept('POST', '/api/tasks', {
      statusCode: 500,
      body: { error: 'Failed to create task' },
    }).as('createTaskError');

    // Attempt to create a new task
    cy.get('input[placeholder="Enter new task"]').type('Error Task');
    cy.get('button[aria-label="Add Task"]').click();

    // Wait for the API call and verify the error message
    cy.wait('@createTaskError');
    cy.contains(/failed to create task/i).should('be.visible');
  });

  it('should allow editing a task', () => {
    // Edit the first task
    const updatedTaskName = 'Updated Task';
    cy.get('.task-item').first().as('taskToEdit');
    cy.get('@taskToEdit').find('button[aria-label="Edit Task"]').click();
    cy.get('@taskToEdit').find('input[aria-label="Edit Task Name"]').clear().type(updatedTaskName);
    cy.get('@taskToEdit').find('button[aria-label="Save Task"]').click();

    // Verify the updated task name
    cy.contains(updatedTaskName).should('be.visible');
  });

  it('should load tasks on page load', () => {
    // Simulate tasks being loaded from the server
    cy.intercept('GET', '/api/tasks', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Task 1', completed: false },
        { id: 2, name: 'Task 2', completed: true },
      ],
    }).as('loadTasks');

    // Reload the page and wait for tasks to load
    cy.reload();
    cy.wait('@loadTasks');

    // Verify the tasks are displayed
    cy.get('.task-item').should('have.length', 2);
    cy.contains('Task 1').should('be.visible');
    cy.contains('Task 2').should('be.visible');
  });
});
