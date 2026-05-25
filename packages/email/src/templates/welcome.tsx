import {
  Body, Button, Column, Container, Head, Heading,
  Hr, Html, Link, Preview, Row, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userName:    string;
  userEmail:   string;
  dashboardUrl: string;
}

export function WelcomeEmail({ userName, userEmail, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to FormCraft — your form builder is ready</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Logo */}
          <Section style={logoSection}>
            <div style={logoBox}>
              <Text style={logoText}>F</Text>
            </div>
            <Text style={logoLabel}>FormCraft</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>Welcome, {userName}!</Heading>
            <Text style={paragraph}>
              Your account is ready. You can now create beautiful, cinematic forms
              that your audience will actually want to fill.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Feature highlights */}
          <Section>
            <Heading style={h2}>What you can do right now</Heading>
            <Row>
              <Column style={featureCol}>
                <Text style={featureIcon}>01</Text>
                <Text style={featureTitle}>Create a form</Text>
                <Text style={featureDesc}>
                  Add questions, pick a theme, publish in minutes.
                </Text>
              </Column>
              <Column style={featureCol}>
                <Text style={featureIcon}>02</Text>
                <Text style={featureTitle}>Pick a theme</Text>
                <Text style={featureDesc}>
                  Netflix, Jaipur, Discord, Anime — 20+ themes included.
                </Text>
              </Column>
              <Column style={featureCol}>
                <Text style={featureIcon}>03</Text>
                <Text style={featureTitle}>Share and collect</Text>
                <Text style={featureDesc}>
                  Copy your link or download a QR code. Responses come in live.
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
            <Button href={dashboardUrl} style={ctaButton}>
              Open your dashboard
            </Button>
          </Section>

          {/* Demo credentials note */}
          <Section style={demoBox}>
            <Text style={demoTitle}>Your account details</Text>
            <Text style={demoText}>Email: {userEmail}</Text>
            <Text style={demoText}>
              Keep your password safe. You can reset it any time from the login page.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section>
            <Text style={footer}>
              You are receiving this because you created an account at{" "}
              <Link href="https://formcraft.app" style={link}>formcraft.app</Link>.
              If you did not sign up, you can ignore this email.
            </Text>
            <Text style={footer}>
              FormCraft · Jaipur, Rajasthan, India
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const body: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const logoSection: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  padding: "24px 32px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const logoBox: React.CSSProperties = {
  width: "32px",
  height: "32px",
  backgroundColor: "#6C47FF",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const logoText: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "18px",
  margin: "0",
  lineHeight: "32px",
  textAlign: "center",
};
const logoLabel: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "16px",
  margin: "0 0 0 10px",
};
const heroSection: React.CSSProperties = { padding: "40px 32px 24px" };
const h1: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 12px",
  lineHeight: "1.2",
};
const h2: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  margin: "24px 32px 16px",
};
const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4b5563",
  margin: "0",
};
const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "0 32px",
};
const featureCol: React.CSSProperties = { padding: "0 16px 0 32px", width: "33%" };
const featureIcon: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#6C47FF",
  margin: "0 0 4px",
  letterSpacing: "2px",
};
const featureTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 4px",
};
const featureDesc: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0",
  lineHeight: "1.5",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "15px",
  textDecoration: "none",
  display: "inline-block",
};
const demoBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px 32px",
  margin: "0 32px 24px",
  border: "1px solid #e5e7eb",
};
const demoTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const demoText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0 0 4px",
  fontFamily: "monospace",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center",
  padding: "0 32px 24px",
  margin: "0",
  lineHeight: "1.6",
};
const link: React.CSSProperties = { color: "#6C47FF", textDecoration: "none" };
