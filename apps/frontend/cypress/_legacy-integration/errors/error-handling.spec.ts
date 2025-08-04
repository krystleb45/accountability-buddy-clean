/// <reference types="cypress" />

describe("error Handling", () => {
  const baseUrl = "http://localhost:3000" // Adjust this to your actual base URL

  beforeEach(() => {
    // Visit the home page before each test
    cy.visit(baseUrl)
  })

  it("displays 404 error page for non-existent routes", () => {
    // Visit a non-existent page
    cy.visit(`${baseUrl}/non-existent-page`, { failOnStatusCode: false })

    // Assert that 404 error page is displayed
    cy.contains("404").should("be.visible")
    cy.contains("Page Not Found").should("be.visible")

    // Verify there is a link to go back home
    cy.contains("Go back to Home").click()
    cy.url().should("eq", `${baseUrl}/`)
  })

  it("displays a network error message when API call fails", () => {
    // Mock API error response
    cy.intercept("GET", "**/api/data", {
      statusCode: 500,
      body: { message: "Internal Server Error" },
    }).as("getDataError")

    // Trigger the API call by visiting the page
    cy.visit(`${baseUrl}/data-page`)
    cy.wait("@getDataError")

    // Assert that the error message is displayed
    cy.contains("Internal Server Error").should("be.visible")
    cy.contains("We are experiencing issues. Please try again later.").should(
      "be.visible",
    )
  })

  it("displays a friendly message for network disconnection", () => {
    // Simulate a network failure
    cy.intercept("GET", "**/api/data", { forceNetworkError: true }).as(
      "networkError",
    )

    // Trigger the API call
    cy.visit(`${baseUrl}/data-page`)
    cy.wait("@networkError")

    // Assert that a friendly network error message is displayed
    cy.contains("Network Error").should("be.visible")
    cy.contains("Please check your internet connection and try again.").should(
      "be.visible",
    )
  })
})
