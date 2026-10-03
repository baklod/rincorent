"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession, registerUser } from "@/lib/auth";

export type LoginState = {
  error: string | null;
};

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (email.length > 255 || password.length > 128) {
    return { error: "Those details do not match an account." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "Those details do not match an account." };
  }

  await createSession(user.id);
  redirect("/home");
}

export type RegisterState = {
  error: string | null;
};

export async function register(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Name, email, and password are required." };
  }

  if (name.length > 80) {
    return { error: "Name must be 80 characters or fewer." };
  }

  if (email.length > 255 || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8 || password.length > 128) {
    return { error: "Password must be 8 to 128 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const user = await registerUser(name, email, password);
  if (!user) {
    return { error: "An account with that email already exists." };
  }

  await createSession(user.id);
  redirect("/home");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
