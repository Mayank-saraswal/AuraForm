import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  fullName: string;
  loginUrl: string;
}

export function WelcomeEmail({
  fullName,
  loginUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to FormCraft, {fullName}!</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>
            Welcome to FormCraft!
          </Heading>
          <Text style={{ color: "#6b7280", fontSize: "16px" }}>
            Hello {fullName},
          </Text>
          <Text style={{ color: "#374151", fontSize: "16px" }}>
            Thanks for signing up for FormCraft. You can now create beautiful,
            engaging forms that feel like an experience.
          </Text>
          <Section style={{ marginTop: "24px" }}>
            <a
              href={loginUrl}
              style={{
                backgroundColor: "#6C47FF",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Go to Dashboard
            </a>
          </Section>
          <Hr style={{ marginTop: "32px", borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            FormCraft — Forms that feel like an experience.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
