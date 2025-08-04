/// <reference types="cypress" />

/**
 * spec.cy.ts
 *
 * A lightweight smoke‐test suite to verify that the app shell and key navigation
 * are working as expected.
 */

describe("App Smoke Tests", () => {
  beforeEach(() => {
    // Visit the root of the app before each test
    cy.visit("/")
  })

  it("should load the home page and display the main header", () => {
    // Assumes your homepage has a prominent headline, e.g. “Achieve your goals”
    cy.contains('[data-cy="landing-header"]', /achieve your goals/i).should(
      "be.visible",
    )
  })

  it("should have a working login link in the navbar", () => {
    // Assumes you’ve added a data-cy to your login link
    cy.get('[data-cy="nav-login"]').click()
    cy.url().should("include", "/login")
    cy.contains("button", /sign in/i).should("be.visible")
  })

  it("should navigate to the register page from the navbar", () => {
    cy.get('[data-cy="nav-register"]').click()
    cy.url().should("include", "/register")
    cy.contains("button", /register/i).should("be.visible")
  })

  it("should redirect to dashboard after programmatic login", () => {
    // Use your custom command to log in
    const EMAIL = "admin@example.com"
    const PASSWORD = Cypress.env("TEST_USER_PASSWORD")
    cy.loginViaSession(EMAIL, PASSWORD)

    // After loginViaSession, you should already be on /dashboard
    cy.url().should("include", "/dashboard")
    cy.contains('[data-cy="dashboard-title"]', /welcome back/i).should(
      "be.visible",
    )
  })
})
