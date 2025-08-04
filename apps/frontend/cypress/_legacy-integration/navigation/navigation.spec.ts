/// <reference types="cypress" />

describe("navigation Functionality", () => {
  beforeEach(() => {
    cy.log("This is a log message")
    cy.visit("/")
  })

  it("should navigate to the dashboard page", () => {
    cy.get(".nav-dashboard-link").click()
    cy.url().should("include", "/dashboard")
    cy.get(".dashboard-header").should("be.visible")
  })

  it("should navigate to the profile page", () => {
    cy.get(".nav-profile-link").click()
    cy.url().should("include", "/profile")
    cy.get(".profile-header").should("be.visible")
  })

  it("should navigate to the settings page", () => {
    cy.get(".nav-settings-link").click()
    cy.url().should("include", "/settings")
    cy.get(".settings-header").should("be.visible")
  })

  it("should logout and redirect to the login page", () => {
    cy.get(".nav-logout-link").click()
    cy.url().should("include", "/login")
    cy.contains("Please log in").should("be.visible")
  })
})
