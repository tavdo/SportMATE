import { NextRequest } from "next/server";
import { getLocaleFromHeader, getMessages } from "./index";

export function tFromRequest(req: NextRequest) {
  return getMessages(getLocaleFromHeader(req.headers.get("accept-language")));
}
