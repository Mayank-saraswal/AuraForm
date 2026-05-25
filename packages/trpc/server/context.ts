import type { Request, Response } from "express";
import { auth } from "./auth";

export interface Context {
  req: Request;
  res: Response;
  user: {
    id: string;
    email: string;
    fullName: string;
    plan: string;
    emailVerified: boolean;
  } | null;
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  let user: Context["user"] = null;

  try {
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (session?.user) {
      user = {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.name ?? "",
        plan: (session.user as Record<string, unknown>)["plan"] as string ?? "free",
        emailVerified: session.user.emailVerified ?? false,
      };
    }
  } catch {
    // No valid session — user remains null (public request)
  }

  return { req, res, user };
}
