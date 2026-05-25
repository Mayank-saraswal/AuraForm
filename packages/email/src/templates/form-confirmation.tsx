import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface FormConfirmationProps {
  respondentName: string;
  formTitle:      string;
  formOwner:      string;
  exploreUrl:     string;
  createUrl:      string;
}

export function FormConfirmationEmail({
  respondentName,
  formTitle,
  formOwner,
  exploreUrl,
  createUrl,
}: FormConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your response to {formTitle} was received</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={checkmark}>✓</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Response received!</Heading>
            <Text style={paragraph}>
              Hi {respondentName}, your response to{" "}
              <strong>{formTitle}</strong> by{" "}
              <strong>{formOwner}</strong> has been recorded successfully.
            </Text>
            <Text style={paragraph}>
              You do not need to do anything else. If the form creator
              needs more information they will reach out to you directly.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Explore CTA */}
          <Section style={exploreSection}>
            <Text style={exploreTitle}>Enjoyed the form experience?</Text>
            <Text style={exploreDesc}>
              FormCraft lets anyone build beautiful, Typeform-style forms with
              20+ themes — Netflix, Jaipur, Discord, Anime and more.
              Free to start, no credit card required.
            </Text>
            <div style={{ textAlign: "center" as const, marginTop: "16px" }}>
              <Button href={createUrl} style={ctaButton}>
                Create your own form
              </Button>
            </div>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={footer}>
              You are receiving this confirmation because you submitted a form
              powered by FormCraft. FormCraft does not share your data with
              third parties.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
};
const container: React.CSSProperties = {
  maxWidth: "520px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const header: React.CSSProperties = {
  backgroundColor: "#10B981",
  padding: "28px",
  textAlign: "center",
};
const checkmark: React.CSSProperties = {
  fontSize: "40px",
  color: "#ffffff",
  margin: "0",
  lineHeight: "1",
};
const content: React.CSSProperties = { padding: "32px" };
const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 16px",
};
const paragraph: React.CSSProperties = {
  fontSize: "15px",
  color: "#4b5563",
  lineHeight: "1.6",
  margin: "0 0 12px",
};
const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "0 32px" };
const exploreSection: React.CSSProperties = { padding: "24px 32px" };
const exploreTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 8px",
};
const exploreDesc: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "1.6",
  margin: "0",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "13px",
  textDecoration: "none",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  padding: "16px 32px 24px",
  margin: "0",
  lineHeight: "1.6",
};
