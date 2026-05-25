import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Section, Text, Row, Column,
} from "@react-email/components";
import * as React from "react";

interface ResponseNotificationProps {
  creatorName:    string;
  formTitle:      string;
  responseCount:  number;
  completionRate: number;
  responseUrl:    string;
  answers:        Array<{ question: string; answer: string }>;
  submittedAt:    string;
}

export function ResponseNotificationEmail({
  creatorName,
  formTitle,
  responseCount,
  completionRate,
  responseUrl,
  answers,
  submittedAt,
}: ResponseNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>{`New response for ${formTitle} — ${responseCount} total responses`}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <div style={dot} />
            <Text style={headerLabel}>New Response</Text>
          </Section>

          {/* Title */}
          <Section style={titleSection}>
            <Heading style={h1}>
              Someone filled out your form
            </Heading>
            <Text style={formTitleStyle}>{formTitle}</Text>
            <Text style={meta}>
              Submitted {submittedAt}
            </Text>
          </Section>

          {/* Stats row */}
          <Section style={statsRow}>
            <Row>
              <Column style={statCol}>
                <Text style={statValue}>{responseCount}</Text>
                <Text style={statLabel}>Total responses</Text>
              </Column>
              <Column style={statCol}>
                <Text style={statValue}>{completionRate}%</Text>
                <Text style={statLabel}>Completion rate</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Answers preview (first 5) */}
          {answers.slice(0, 5).length > 0 && (
            <Section style={answersSection}>
              <Heading style={h2}>Response preview</Heading>
              {answers.slice(0, 5).map((a, i) => (
                <div key={i} style={answerRow}>
                  <Text style={questionText}>{a.question}</Text>
                  <Text style={answerText}>{a.answer || "(no answer)"}</Text>
                </div>
              ))}
              {answers.length > 5 && (
                <Text style={moreAnswers}>
                  +{answers.length - 5} more answers in the dashboard
                </Text>
              )}
            </Section>
          )}

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={responseUrl} style={ctaButton}>
              View all responses
            </Button>
          </Section>

          {/* Footer */}
          <Section>
            <Text style={footer}>
              Hello {creatorName}, you are receiving this because you enabled
              email notifications for this form. Turn them off in your form settings.
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
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const header: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  padding: "20px 32px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const dot: React.CSSProperties = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.6)",
  display: "inline-block",
};
const headerLabel: React.CSSProperties = {
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "14px",
  margin: "0 0 0 10px",
  letterSpacing: "0.5px",
};
const titleSection: React.CSSProperties = { padding: "32px 32px 16px" };
const h1: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 8px",
};
const formTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#6C47FF",
  fontWeight: "600",
  margin: "0 0 6px",
};
const meta: React.CSSProperties = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "0",
};
const statsRow: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  margin: "0 32px 16px",
  borderRadius: "8px",
  padding: "16px",
  border: "1px solid #e5e7eb",
};
const statCol: React.CSSProperties = { textAlign: "center", width: "50%" };
const statValue: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#111827",
  margin: "0",
};
const statLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const hr: React.CSSProperties = { borderColor: "#e5e7eb", margin: "0 32px" };
const answersSection: React.CSSProperties = { padding: "24px 32px" };
const h2: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
  margin: "0 0 16px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};
const answerRow: React.CSSProperties = {
  marginBottom: "12px",
  paddingBottom: "12px",
  borderBottom: "1px solid #f3f4f6",
};
const questionText: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 4px",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
};
const answerText: React.CSSProperties = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: "500",
  margin: "0",
};
const moreAnswers: React.CSSProperties = {
  fontSize: "13px",
  color: "#6C47FF",
  margin: "8px 0 0",
  fontStyle: "italic",
};
const ctaSection: React.CSSProperties = {
  textAlign: "center",
  padding: "24px 32px",
};
const ctaButton: React.CSSProperties = {
  backgroundColor: "#6C47FF",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "14px",
  textDecoration: "none",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  padding: "0 32px 24px",
  margin: "16px 0 0",
  lineHeight: "1.6",
};
