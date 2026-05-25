import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from "@react-email/components";

interface FormConfirmationEmailProps {
  formTitle: string;
  respondentMessage?: string;
  formOwnerName: string;
}

export function FormConfirmationEmail({
  formTitle,
  respondentMessage,
  formOwnerName,
}: FormConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your response to {formTitle} was received</Preview>
      <Body style={{ backgroundColor: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ fontSize: "24px", color: "#111827", marginBottom: "8px" }}>
            Response Confirmed
          </Heading>
          <Text style={{ color: "#374151", fontSize: "16px" }}>
            Your response to <strong>{formTitle}</strong> has been successfully recorded.
          </Text>
          {respondentMessage && (
            <Text style={{ color: "#6b7280", fontSize: "14px", marginTop: "16px" }}>
              {respondentMessage}
            </Text>
          )}
          <Hr style={{ marginTop: "32px", borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#9ca3af", fontSize: "12px" }}>
            This form was created by {formOwnerName} using FormCraft.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
