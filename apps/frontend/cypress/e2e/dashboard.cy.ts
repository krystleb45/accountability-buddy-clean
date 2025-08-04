/// <reference types="cypress" />

describe("Dashboard Functionality (real backend)", () => {
  beforeEach(() => {
    // 1) Stub NextAuth session so the app thinks we're logged in
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 day
        user: {
          name: "Test User",
          email: "test@example.com",
          id: "test-user-id",
        },
      },
    }).as("getSession")

    // 2) Visit dashboard and wait for session to resolve
    cy.visit("/dashboard")
    cy.wait("@getSession")
  })

  it("should display the dashboard title and user name", () => {
    cy.get('[data-cy="dashboard-title"]').should(
      "contain",
      "Welcome to your dashboard",
    )
    cy.get('[data-cy="user-name"]').should("contain", "Test User")
  })

  it("should display XP and level info from real user progress", () => {
    // adapt these selectors to whatever your real UI shows
    cy.get('[data-cy="xp"]').should("exist")
    cy.get('[data-cy="level"]').should("exist")
    cy.get('[data-cy="to-next-level"]').should("exist")
  })

  it("should display stats and current streak from real data", () => {
    // you might need to seed your test DB with known values for this user
    cy.contains("Total Goals:").should("exist")
    cy.contains("Completed Goals:").should("exist")
    cy.contains("🔥").should("exist") // checks for any flame icon + streak
  })
})
