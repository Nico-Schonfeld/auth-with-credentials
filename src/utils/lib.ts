import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/utils/db";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10 minutes")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function register(formData: FormData) {
  // Verify credentials && get the user
  const getPass = formData.get("pass");
  const getEmail = formData.get("email");
  const getName = formData.get("name");

  if (
    !getPass ||
    typeof getPass !== "string" ||
    !getEmail ||
    typeof getEmail !== "string" ||
    !getName ||
    typeof getName !== "string"
  )
    return;
  const passHash = await bcrypt.hash(getPass, 10);

  const user = {
    email: getEmail,
    name: getName,
    pass: passHash,
  };

  const res = await db.user.create({
    data: {
      email: user.email,
      name: user.name,
      pass: user.pass,
    },
  });

  if (!res)
    return {
      error: true,
      success: false,
    };

  return {
    error: false,
    success: true,
    res: {
      name: res?.name,
      email: res?.email,
    },
  };
}

export async function login(formData: FormData) {
  // Get the user of db
  // Verify credentials && get the user
  const getPass = formData.get("pass");
  const getEmail = formData.get("email");

  if (
    !getPass ||
    typeof getPass !== "string" ||
    !getEmail ||
    typeof getEmail !== "string"
  )
    return { error: true, success: false, message: "* Campos obligatorios" };

  const user = {
    email: getEmail,
    pass: getPass,
  };

  const [getUserInDb] = await db.user.findMany({
    where: {
      email: user.email,
    },
  });

  if (!getUserInDb || !getUserInDb.pass) {
    return { error: true, success: false, message: "Usuario no encontrado" };
  }

  const isPasswordMatch = await bcrypt.compare(getPass, getUserInDb.pass);

  if (!isPasswordMatch) {
    return { error: true, success: false, message: "Contraseña incorrecta" };
  }

  // Create the session
  const expires = new Date(Date.now() + 600 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });

  return {
    error: false,
    success: true,
    message: "Inicio de sesión exitoso",
    res: {
      name: getUserInDb?.name,
      email: getUserInDb?.email,
    },
  };
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  if (!session) return null;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 600 * 1000);

  const res = NextResponse.next();

  res.cookies.set({
    name: session,
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });

  return res;
}
