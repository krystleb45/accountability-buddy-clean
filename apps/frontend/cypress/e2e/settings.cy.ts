/// <reference types="cypress" />

describe("Settings Management", () => {
  const VALID_EMAIL = "admin@example.com"
  const VALID_PASSWORD = Cypress.env("TEST_USER_PASSWORD")

  before(() => {
    // Programmatic login to access protected settings page
    cy.loginViaSession(VALID_EMAIL, VALID_PASSWORD)
  })

  beforeEach(() => {
    cy.visit("/settings")
  })

  it("loads the settings page", () => {
    // Use a data-cy selector for the header
    cy.get('[data-cy="settings-header"]').should("contain.text", "Settings")
  })

  it("updates user preferences successfully", () => {
    // Stub the preferences API call
    cy.intercept("PUT", "/api/settings", {
      statusCode: 200,
      body: { message: "Preferences updated successfully" },
    }).as("updateSettings")

    // Use data-cy selectors for form fields and buttons
    cy.get('[data-cy="settings-username-input"]').clear().type("UpdatedUser")

    cy.get('[data-cy="settings-save-button"]').click()

    // Wait for the API and assert UI feedback
    cy.wait("@updateSettings")
    cy.contains("Preferences updated successfully").should("be.visible")
  })

  it("displays an error when updating preferences fails", () => {
    // Simulate a server error with your custom command
    cy.simulateApiFailure("/api/settings")

    cy.get('[data-cy="settings-username-input"]').clear().type("WillFail")

    cy.get('[data-cy="settings-save-button"]').click()
    cy.wait("@apiFailure")

    // Check for the error message
    cy.contains(/failed to update preferences/i).should("be.visible")
  })
})
