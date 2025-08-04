/// <reference types="cypress" />

describe("user Profile Page", () => {
  before(() => {
    // Custom command to log in the user
    cy.loginAs("testuser@example.com", "password123") // Replace with actual credentials or mock login
  })

  beforeEach(() => {
    // Visit the profile page before each test
    cy.visit("/profile")
  })

  it("should display the user profile information", () => {
    // Verify the "Profile Information" section is visible
    cy.contains(/profile information/i).should("be.visible")

    // Check for user details
    cy.get('input[name="name"]').should("have.value", "Test User") // Replace with actual name
    cy.get('input[name="email"]').should("have.value", "testuser@example.com") // Replace with actual email
  })

  it("should update the user's profile successfully", () => {
    // Update name and email fields
    cy.get('input[name="name"]').clear().type("Updated Name")
    cy.get('input[name="email"]').clear().type("updated@example.com")

    // Click the "Save Changes" button
    cy.get('button[aria-label="Save Changes"]').click()

    // Verify the success message is displayed
    cy.contains(/profile updated successfully/i).should("be.visible")

    // Verify that the updated values persist
    cy.reload()
    cy.get('input[name="name"]').should("have.value", "Updated Name")
    cy.get('input[name="email"]').should("have.value", "updated@example.com")
  })

  it("should show an error message if the update fails", () => {
    // Simulate a server error for the profile update API
    cy.intercept("PUT", "/api/profile", {
      statusCode: 500,
      body: { error: "Update failed" },
    }).as("updateProfileError")

    // Attempt to update the profile
    cy.get('input[name="name"]').clear().type("Failed Update")
    cy.get('button[aria-label="Save Changes"]').click()

    // Wait for the mocked API call
    cy.wait("@updateProfileError")

    // Verify the error message is displayed
    cy.contains(/update failed/i).should("be.visible")
  })

  it("should allow the user to upload a profile picture", () => {
    // Mock file upload
    const fileName = "profile-pic.jpg"
    cy.get('input[type="file"]').attachFile(fileName)

    // Verify that the profile picture is displayed
    cy.get(".profile-picture")
      .should("have.attr", "src")
      .and("include", fileName)
  })

  it("should display a confirmation prompt before deleting the profile", () => {
    // Click the "Delete Profile" button
    cy.get('button[aria-label="Delete Profile"]').click()

    // Verify that a confirmation dialog appears
    cy.contains(/are you sure you want to delete your profile/i).should(
      "be.visible",
    )

    // Confirm deletion
    cy.get('button[aria-label="Confirm Delete"]').click()

    // Verify the user is redirected after deletion
    cy.url().should("include", "/goodbye")
    cy.contains(/profile deleted successfully/i).should("be.visible")
  })
})
