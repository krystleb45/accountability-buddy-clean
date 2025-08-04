/// <reference types="cypress" />

import { expect as chaiExpect } from "chai" // Import Chai's expect explicitly
import { mount } from "cypress/react"
import React from "react"

import MilitarySupport from "../../src/components/MilitarySupport/MilitarySupport"

describe("military Support Component Tests", () => {
  const resources = [
    {
      name: "Veterans Crisis Line",
      url: "https://www.veteranscrisisline.net/",
    },
    { name: "Military OneSource", url: "https://www.militaryonesource.mil/" },
    {
      name: "National Suicide Prevention Lifeline",
      url: "https://988lifeline.org/",
    },
  ]

  beforeEach(() => {
    mount(<MilitarySupport />)
  })

  it("should navigate to the correct resource links when buttons are clicked", () => {
    resources.forEach(({ name, url }) => {
      cy.contains("button", name)
        .should("have.attr", "data-url")
        .then((dataUrl) => {
          chaiExpect(dataUrl).to.equal(url)
        })
    })
  })

  it("should display the chatroom area with the default welcome message", () => {
    cy.get(".chatroom")
      .should("be.visible")
      .within(() => {
        cy.get(".chatroom-header").contains("Chatroom").should("be.visible")
        cy.get(".chatroom-messages")
          .contains("Welcome to the Military Support Chatroom!")
          .should("be.visible")
      })
  })

  it("should allow sending and displaying messages in the chatroom", () => {
    const testMessage = "Hello, is anyone here?"

    cy.get(".chatroom-input").type(testMessage)
    cy.get(".chatroom-send-button").click()

    cy.get(".chatroom-messages").contains(testMessage).should("be.visible")
  })

  it("should display the disclaimer at the bottom of the page", () => {
    cy.get(".disclaimer")
      .should("be.visible")
      .contains(
        "Disclaimer: The Military Support Section provides peer support and resource recommendations. It is not a substitute for professional medical or mental health advice.",
      )
  })

  it("should validate free access for military members", () => {
    cy.get(".access-status")
      .should("be.visible")
      .contains("Free Access for Military Members")
  })

  it("should show an error message if the chatroom fails to load", () => {
    // stub the failing chatroom API
    cy.intercept("GET", "/api/chatroom", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getChatroomError")

    // remount so the stub is in effect
    mount(<MilitarySupport />)
    cy.wait("@getChatroomError")

    cy.get(".chatroom-error")
      .should("be.visible")
      .contains("Failed to load the chatroom. Please try again later.")
  })
})
