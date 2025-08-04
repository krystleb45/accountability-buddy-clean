/// <reference types="cypress" />

describe("Error Pages", () => {
  beforeEach(() => {
    // Ensure we start from the root so that history is clean
    cy.visit("/")
  })

  it("displays a 404 page for non-existent routes", () => {
    cy.visit("/non-existent-page")
    // Expect a clear 404 indicator
    cy.contains("404").should("be.visible")
    cy.contains(/page not found/i).should("be.visible")
  })

  it("handles server errors gracefully (500 Internal Server Error)", () => {
    // Use your custom command to stub a 500 on the dashboard API
    cy.simulateApiFailure("/api/failing-endpoint")
    cy.visit("/error-page")
    // Wait for the alias we set in simulateApiFailure
    cy.wait("@apiFailure")

    // Verify the UI shows a friendly error message
    cy.contains(/something went wrong/i).should("be.visible")
  })

  it("redirects to a custom error page on major failures", () => {
    // Visiting this route should trigger your app’s major-failure logic
    cy.visit("/major-failure")

    // Optionally assert the URL changed
    cy.url().should("include", "/error-page")

    // Then verify your custom error page content
    cy.contains(/custom error page/i).should("be.visible")
  })
})
