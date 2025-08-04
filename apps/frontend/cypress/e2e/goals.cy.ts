/// <reference types="cypress" />

describe("Goal Tracking Features", () => {
  beforeEach(() => {
    // Visit the goals page; the stub in support/index.ts provides authentication
    cy.visit("/goals")
    cy.wait("@getSession")
  })

  it("displays the goal tracking page", () => {
    cy.contains(/goal tracking/i).should("be.visible")
  })

  it("creates a new goal successfully", () => {
    const goalName = "New Goal"

    // Enter a new goal and add it
    cy.get('[data-cy="goal-input"]').type(goalName)
    cy.get('[data-cy="add-goal-button"]').click()

    // Verify the new goal appears
    cy.get('[data-cy="goal-item"]').contains(goalName).should("be.visible")
  })

  it("updates a goal successfully", () => {
    const updatedGoalName = "Updated Goal"

    cy.get('[data-cy="goal-item"]').first().as("goalToEdit")
    cy.get("@goalToEdit").find('[data-cy="edit-goal-button"]').click()
    cy.get("@goalToEdit")
      .find('[data-cy="edit-goal-input"]')
      .clear()
      .type(updatedGoalName)
    cy.get("@goalToEdit").find('[data-cy="save-goal-button"]').click()

    cy.get('[data-cy="goal-item"]')
      .contains(updatedGoalName)
      .should("be.visible")
  })

  it("marks a goal as completed", () => {
    cy.get('[data-cy="goal-item"]').first().as("goalToComplete")
    cy.get("@goalToComplete").find('input[type="checkbox"]').check()
    cy.get("@goalToComplete").should("have.class", "completed")
  })

  it("deletes a goal", () => {
    cy.get('[data-cy="goal-item"]').first().as("goalToDelete")
    cy.get("@goalToDelete").find('[data-cy="delete-goal-button"]').click()
    cy.get("@goalToDelete").should("not.exist")
  })

  it("shows an error message if goal creation fails", () => {
    // Stub the goal creation endpoint to return a 500
    cy.simulateApiFailure("/api/goals")
    cy.get('[data-cy="goal-input"]').type("Error Goal")
    cy.get('[data-cy="add-goal-button"]').click()
    cy.wait("@apiFailure")
    cy.contains(/failed to create goal/i).should("be.visible")
  })

  it("displays goals loaded from the server", () => {
    cy.intercept("GET", "/api/goals", {
      statusCode: 200,
      body: [
        { id: 1, name: "Goal 1", completed: false },
        { id: 2, name: "Goal 2", completed: true },
      ],
    }).as("getGoals")

    cy.reload()
    cy.wait("@getGoals")

    cy.get('[data-cy="goal-item"]').should("have.length", 2)
    cy.contains("Goal 1").should("be.visible")
    cy.contains("Goal 2").should("be.visible")
  })

  it("shows progress for completed goals", () => {
    cy.get('[data-cy="progress-bar"]')
      .invoke("width")
      .should("be.greaterThan", 0)
  })

  it("displays a confirmation prompt before deleting a goal", () => {
    cy.get('[data-cy="goal-item"]').first().as("goalToDelete")
    cy.get("@goalToDelete").find('[data-cy="delete-goal-button"]').click()

    cy.contains(/are you sure you want to delete this goal/i).should(
      "be.visible",
    )
    cy.get('[data-cy="confirm-delete-button"]').click()
    cy.get("@goalToDelete").should("not.exist")
  })
})
