import { Resend } from "resend";
import { render } from "@react-email/render";
import { WelcomeEmail }              from "./templates/welcome";
import { ResponseNotificationEmail } from "./templates/response-notification";
import { FormConfirmationEmail }     from "./templates/form-confirmation";

export { WelcomeEmail, ResponseNotificationEmail, FormConfirmationEmail };

// ── Singleton Resend client ───────────────────────────────────────────────────
function getResend(): Resend {
  const key = process.env["RESEND_API_KEY"];
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set.");
  return new Resend(key);
}

const FROM = process.env["RESEND_FROM_EMAIL"] ?? "FormCraft <noreply@formcraft.app>";
const APP_URL = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

// ── Email senders ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: {
  toEmail:  string;
  toName:   string;
}): Promise<void> {
  const resend = getResend();
  const html   = await render(
    WelcomeEmail({
      userName:    opts.toName,
      userEmail:   opts.toEmail,
      dashboardUrl: `${APP_URL}/dashboard`,
    })
  );
  await resend.emails.send({
    from:    FROM,
    to:      opts.toEmail,
    subject: `Welcome to FormCraft, ${opts.toName}!`,
    html,
  });
}

export async function sendResponseNotification(opts: {
  creatorEmail:   string;
  creatorName:    string;
  formId:         string;
  formTitle:      string;
  responseCount:  number;
  completionRate: number;
  answers:        Array<{ question: string; answer: string }>;
}): Promise<void> {
  const resend = getResend();
  const html   = await render(
    ResponseNotificationEmail({
      creatorName:    opts.creatorName,
      formTitle:      opts.formTitle,
      responseCount:  opts.responseCount,
      completionRate: opts.completionRate,
      responseUrl:    `${APP_URL}/dashboard/forms/${opts.formId}/responses`,
      answers:        opts.answers,
      submittedAt:    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    })
  );
  await resend.emails.send({
    from:    FROM,
    to:      opts.creatorEmail,
    subject: `New response for "${opts.formTitle}" (${opts.responseCount} total)`,
    html,
  });
}

export async function sendFormConfirmation(opts: {
  toEmail:        string;
  respondentName: string;
  formTitle:      string;
  formOwner:      string;
}): Promise<void> {
  const resend = getResend();
  const html   = await render(
    FormConfirmationEmail({
      respondentName: opts.respondentName,
      formTitle:      opts.formTitle,
      formOwner:      opts.formOwner,
      exploreUrl:     `${APP_URL}/explore`,
      createUrl:      `${APP_URL}/auth/register`,
    })
  );
  await resend.emails.send({
    from:    FROM,
    to:      opts.toEmail,
    subject: `Your response to "${opts.formTitle}" was received`,
    html,
  });
}
