import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"

import { colors } from "../colors"

const main = {
  backgroundColor: colors.background,
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "0px 20px",
  textAlign: "center" as const,
}

const logoContainer = {
  marginTop: "32px",
}

const h1 = {
  color: colors.foreground,
  fontSize: "36px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
}

const heroText = {
  fontSize: "20px",
  lineHeight: "28px",
  marginBottom: "30px",
  color: colors.foreground,
}

const buttonSection = {
  margin: "48px 0",
}

interface VerifyEmailProps {
  link: string
  logoUrl?: string
}

export function VerifyEmail({ link, logoUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Confirm your email address</Preview>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoContainer}>
              <Img
                src={logoUrl}
                width="36"
                height="36"
                alt="Accountability Buddy Logo"
                style={{
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </Section>
          )}
          <Heading style={h1}>Confirm your email address</Heading>
          <Text style={heroText}>
            Please confirm your email address by clicking the button below. This
            link expires in 24 hours.
          </Text>

          <Section style={buttonSection}>
            <Button
              href={link}
              style={{
                color: colors.background,
                backgroundColor: colors.primary,
                padding: "16px 24px",
                fontSize: "20px",
                fontWeight: "500",
                borderRadius: "8px",
              }}
            >
              Verify Email
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

VerifyEmail.PreviewProps = {
  link: "https://example.com?token=123456abcdef",
  logoUrl: "http://localhost:3000/logo.png",
} as VerifyEmailProps

export default VerifyEmail
