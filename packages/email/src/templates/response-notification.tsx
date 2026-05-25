import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from "@react-email/components";

interface ResponseNotificationProps {
  creatorName: string;
  formTitle: string;
  responseCount: number;
  formUrl: string;
}

export function ResponseNotificationEmail({
  creatorName,
  formTitle,
  responseCount,
  formUrl,
}: ResponseNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New response received for {formTitle}</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>
            New Response Received
          </Heading>
          <Text style={{ color: "#6b7280", fontSize: "16px" }}>
            Hello {creatorName},
          </Text>
          <Text style={{ color: "#374151", fontSize: "16px" }}>
            Your form <strong>{formTitle}</strong> just received a new response.
            You now have <strong>{responseCount}</strong> total response{responseCount !== 1 ? "s" : ""}.
          </Text>
          <Section style={{ marginTop: "24px" }}>
            <a
              href={formUrl}
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
              View Responses
            </a>
          </Section>
          <Hr style={{ marginTop: "32px", borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            FormCraft — Forms that feel like an experience. You can turn off
            email notifications in your form settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
