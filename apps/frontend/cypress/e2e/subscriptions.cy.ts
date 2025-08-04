/// <reference types="cypress" />

describe("Subscription Management", () => {
  const VALID_EMAIL = "admin@example.com"
  const VALID_PASSWORD = Cypress.env("TEST_USER_PASSWORD")

  before(() => {
    // Programmatic login so we can access the subscriptions page
    cy.loginViaSession(VALID_EMAIL, VALID_PASSWORD)
  })

  beforeEach(() => {
    cy.visit("/subscriptions")
  })

  it("displays available subscription plans", () => {
    cy.intercept("GET", "/api/subscription/plans", {
      statusCode: 200,
      body: [
        { id: 1, name: "Basic", price: 10 },
        { id: 2, name: "Premium", price: 20 },
        { id: 3, name: "Pro", price: 30 },
      ],
    }).as("getPlans")

    cy.reload()
    cy.wait("@getPlans")

    // Verify each plan shows up in the UI
    cy.get('[data-cy="plan-item"]').should("have.length", 3)
    cy.contains('[data-cy="plan-item"]', "Basic").should("be.visible")
    cy.contains('[data-cy="plan-item"]', "Premium").should("be.visible")
    cy.contains('[data-cy="plan-item"]', "Pro").should("be.visible")
  })

  it("allows a user to subscribe to a plan", () => {
    // Stub the subscribe call
    cy.intercept("POST", "/api/subscription/subscribe", {
      statusCode: 200,
      body: { message: "Subscription successful" },
    }).as("subscribe")

    // Click the first subscribe button
    cy.get('[data-cy="subscribe-button"]').first().click()

    cy.wait("@subscribe")
    cy.contains("Subscription successful").should("be.visible")
  })

  it("displays the user's current subscription", () => {
    cy.intercept("GET", "/api/subscription/current", {
      statusCode: 200,
      body: { id: 2, name: "Premium", price: 20 },
    }).as("getCurrent")

    cy.reload()
    cy.wait("@getCurrent")

    cy.contains('[data-cy="current-subscription"]', "Premium").should(
      "be.visible",
    )
  })

  it("allows upgrading to a higher plan", () => {
    cy.intercept("POST", "/api/subscription/upgrade", {
      statusCode: 200,
      body: { message: "Upgrade successful" },
    }).as("upgrade")

    cy.get('[data-cy="upgrade-button"]').click()
    cy.wait("@upgrade")
    cy.contains("Upgrade successful").should("be.visible")
  })

  it("allows downgrading to a lower plan", () => {
    cy.intercept("POST", "/api/subscription/downgrade", {
      statusCode: 200,
      body: { message: "Downgrade successful" },
    }).as("downgrade")

    cy.get('[data-cy="downgrade-button"]').click()
    cy.wait("@downgrade")
    cy.contains("Downgrade successful").should("be.visible")
  })

  it("handles subscription errors gracefully", () => {
    // Use custom command to stub a 500 error
    cy.simulateApiFailure("/api/subscription/subscribe")
    cy.get('[data-cy="subscribe-button"]').first().click()
    cy.wait("@apiFailure")
    cy.contains(/subscription failed/i).should("be.visible")
  })

  it("allows canceling a subscription", () => {
    cy.intercept("POST", "/api/subscription/cancel", {
      statusCode: 200,
      body: { message: "Subscription canceled successfully" },
    }).as("cancel")

    cy.get('[data-cy="cancel-subscription-button"]').click()
    cy.wait("@cancel")
    cy.contains("Subscription canceled successfully").should("be.visible")
  })

  it("restricts access to subscription management for unauthenticated users", () => {
    // Simulate logout
    cy.clearCookies()
    cy.intercept("GET", "/api/subscription/plans", {
      statusCode: 401,
      body: { error: "Unauthorized" },
    }).as("unauthorized")

    cy.visit("/subscriptions")
    cy.wait("@unauthorized")
    cy.contains(/unauthorized/i).should("be.visible")
  })
})
