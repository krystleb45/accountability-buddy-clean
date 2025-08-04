/// <reference types="cypress" />

describe("Dashboard Notifications", () => {
  beforeEach(() => {
    // Global session stub from support/index.ts provides authentication
    cy.visit("/dashboard/notifications")
    cy.wait("@getSession")
  })

  it("displays the notifications page header", () => {
    cy.contains(/notifications/i).should("be.visible")
  })

  it("shows a list of notifications", () => {
    cy.get('[data-cy="notification-item"]')
      .should("have.length.greaterThan", 0)
      .each(($notification) => {
        cy.wrap($notification).should("be.visible")
      })
  })

  it("marks a notification as read when clicked", () => {
    cy.get('[data-cy="notification-item"]').first().as("firstNotification")
    cy.get("@firstNotification").click()
    cy.get("@firstNotification").should("have.class", "read")
  })

  it('loads more notifications when "Load More" is clicked', () => {
    cy.intercept("GET", "/api/notifications?offset=5").as(
      "loadMoreNotifications",
    )
    cy.contains(/load more/i).click()
    cy.wait("@loadMoreNotifications")
    cy.get('[data-cy="notification-item"]').should("have.length.greaterThan", 5)
  })

  it("displays an error message if notifications fail to load", () => {
    // Stub the notifications endpoint to fail
    cy.simulateApiFailure("/api/notifications")
    // Reload the page to trigger the API call again
    cy.reload()
    cy.wait("@apiFailure")
    cy.contains(/failed to load notifications/i).should("be.visible")
  })

  it('clears all notifications when "Clear All" is clicked', () => {
    cy.intercept("DELETE", "/api/notifications").as("clearAllNotifications")
    cy.contains(/clear all/i).click()
    cy.wait("@clearAllNotifications")
    cy.get('[data-cy="notification-item"]').should("not.exist")
  })
})
