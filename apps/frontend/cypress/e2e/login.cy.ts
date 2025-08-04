/// <reference types="cypress" />

describe("Login Flow", () => {
  const VALID_EMAIL = "admin@example.com" // seeded test user
  const VALID_PASSWORD = Cypress.env("TEST_USER_PASSWORD") // uses shared env var

  it("logs in programmatically and lands on the dashboard", () => {
    // Programmatic login via NextAuth + CSRF + session caching
    cy.loginViaSession(VALID_EMAIL, VALID_PASSWORD)
    // After setting the session cookie, visit dashboard
    cy.visit("/dashboard")
    cy.get('[data-cy="dashboard-title"]', { timeout: 10000 })
      .should("be.visible")
      .and("contain.text", "Welcome to your dashboard")
  })

  it("shows an error on invalid login via the form", () => {
    cy.visit("/login")
    cy.get('input[name="email"]').type("noone@nowhere.com")
    cy.get('input[name="password"]').type("wrongpassword")
    cy.get('button[type="submit"]').click()
    cy.contains(/invalid email or password/i).should("be.visible")
  })
})
