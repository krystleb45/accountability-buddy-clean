// src/app/api/newsletter/subscribe/route.ts
import type { NextRequest } from "next/server"

import mailchimp from "@mailchimp/mailchimp_marketing"
import { NextResponse } from "next/server"

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      )
    }

    // Check environment variables
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_AUDIENCE_ID) {
      console.error("Missing Mailchimp configuration")
      return NextResponse.json(
        { error: "Newsletter service not configured" },
        { status: 500 },
      )
    }

    try {
      // Add subscriber to Mailchimp audience
      const response = await mailchimp.lists.addListMember(
        process.env.MAILCHIMP_AUDIENCE_ID!,
        {
          email_address: email,
          status: "subscribed",
          tags: ["accountability-buddy-website"], // Optional: tag for tracking source
          merge_fields: {
            // Optional: add any additional fields you want to track
            SOURCE: "Website Popup",
            SIGNUP_DATE: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
          },
        },
      )

      console.log("✅ Successfully added subscriber to Mailchimp:", email)
      console.log("📊 Mailchimp response:", response.status)

      return NextResponse.json(
        { message: "Successfully subscribed to newsletter" },
        { status: 200 },
      )
    } catch (mailchimpError: any) {
      // Handle specific Mailchimp errors
      if (mailchimpError.status === 400) {
        // Check if it's a "Member Exists" error
        if (mailchimpError.response?.body?.title === "Member Exists") {
          console.log("📧 User already subscribed:", email)
          return NextResponse.json(
            { message: "Already subscribed to newsletter" },
            { status: 200 },
          )
        }

        // Other validation errors from Mailchimp
        console.error(
          "❌ Mailchimp validation error:",
          mailchimpError.response?.body,
        )
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 },
        )
      }

      // Log the full error for debugging
      console.error("❌ Mailchimp API error:", {
        status: mailchimpError.status,
        message: mailchimpError.message,
        body: mailchimpError.response?.body,
      })

      return NextResponse.json(
        { error: "Newsletter service temporarily unavailable" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// Optional: Health check endpoint
export async function GET() {
  try {
    // Test Mailchimp connection
    const ping = await mailchimp.ping.get()

    return NextResponse.json({
      status: "healthy",
      mailchimp: ping,
      timestamp: new Date().toISOString(),
    })
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Mailchimp connection failed" },
      { status: 500 },
    )
  }
}
