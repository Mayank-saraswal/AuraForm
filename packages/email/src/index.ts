import { Resend } from "resend";

export const resend = new Resend(process.env["RESEND_API_KEY"]);

export * from "./templates/response-notification";
export * from "./templates/welcome";
export * from "./templates/form-confirmation";
