import { NextRequest, NextResponse } from "next/server";
import { isAdminUser } from "@/lib/auth-server";
import { requireUser, isAuthUser } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthUser(auth)) return auth;

  return NextResponse.json({
    uid: auth.uid,
    phone: auth.phone,
    email: auth.email,
    is_admin: isAdminUser(auth.phone, auth.email),
  });
}
