import type { Request, Response } from "express";
import { getSessionFromRequest } from "./auth";

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
    const sessionUser = await getSessionFromRequest(
      req.headers as Record<string, string | string[] | undefined>
    );
    if (sessionUser) {
      user = {
        id: sessionUser.id,
        email: sessionUser.email,
        fullName: sessionUser.name ?? "",
        plan: sessionUser.plan ?? "free",
        emailVerified: !!sessionUser.emailVerified,
      };
    }
  } catch {
    // No valid session — user remains null (public request)
  }

  return { req, res, user };
}
