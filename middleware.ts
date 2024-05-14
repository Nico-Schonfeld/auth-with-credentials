import { NextRequest } from "next/server";
import { updateSession } from "./src/utils/lib";

export async function middleware(req: NextRequest) {
  return await updateSession(req);
}
