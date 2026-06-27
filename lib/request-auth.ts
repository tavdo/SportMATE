import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "./auth-server";
import { getAdminAuth } from "./auth-server";
import { resolveAuthPhone } from "./phone";

export interface AuthUser {
  uid: string;
  phone: string;
  email: string;
}

type AuthResult = AuthUser | NextResponse;

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await getAdminAuth().verifyIdToken(token);
    const email = decoded.email ?? "";
    const phone = resolveAuthPhone(decoded.phone_number, email);
    return {
      uid: decoded.uid,
      phone,
      email,
    };
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const user = await requireUser(req);
  if (user instanceof NextResponse) return user;

  if (!isAdminUser(user.phone, user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return user;
}

export function isAuthUser(result: AuthResult): result is AuthUser {
  return !(result instanceof NextResponse);
}
