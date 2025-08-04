/// <reference types="cypress" />

describe("User Profile Page", () => {
  beforeEach(() => {
    // Navigate to the profile page; auth is stubbed globally
    cy.visit("/profile")
    cy.wait("@getSession")
  })

  it("displays the user profile information", () => {
    cy.contains(/profile information/i).should("be.visible")

    // Check the name and email inputs
    cy.get('[data-cy="profile-name-input"]').should("have.value", "Admin User")
    cy.get('[data-cy="profile-email-input"]').should(
      "have.value",
      "admin@example.com",
    )
  })

  it("updates the user's profile successfully", () => {
    const newName = "Updated Name"
    const newEmail = "updated@example.com"

    // Clear and type new values
    cy.get('[data-cy="profile-name-input"]').clear().type(newName)
    cy.get('[data-cy="profile-email-input"]').clear().type(newEmail)

    // Save changes
    cy.get('[data-cy="save-profile-button"]').click()

    // Success message
    cy.contains(/profile updated successfully/i).should("be.visible")

    // Reload and verify persistence
    cy.reload()
    cy.get('[data-cy="profile-name-input"]').should("have.value", newName)
    cy.get('[data-cy="profile-email-input"]').should("have.value", newEmail)
  })

  it("shows an error message if the update fails", () => {
    // Stub failure on profile update
    cy.simulateApiFailure("/api/profile")

    // Attempt update
    cy.get('[data-cy="profile-name-input"]').clear().type("Fail Update")
    cy.get('[data-cy="save-profile-button"]').click()

    // Wait for stub and assert
    cy.wait("@apiFailure")
    cy.contains(/update failed/i).should("be.visible")
  })

  it("allows the user to upload a profile picture", () => {
    const fileName = "profile-pic.jpg"

    // Attach file using custom command
    cy.uploadFileCustom('[data-cy="profile-picture-input"]', fileName)

    // Verify image src includes uploaded file
    cy.get('[data-cy="profile-picture-img"]')
      .should("have.attr", "src")
      .and("include", fileName)
  })

  it("displays a confirmation prompt before deleting the profile", () => {
    cy.get('[data-cy="delete-profile-button"]').click()

    // Confirm prompt appears
    cy.contains(/are you sure you want to delete your profile/i).should(
      "be.visible",
    )

    // Confirm deletion
    cy.get('[data-cy="confirm-delete-button"]').click()

    // Redirect and success message
    cy.url().should("include", "/goodbye")
    cy.contains(/profile deleted successfully/i).should("be.visible")
  })
})
