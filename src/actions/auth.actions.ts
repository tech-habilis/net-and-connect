"use server";

import { signIn } from "@/lib/auth";
import { SignInFormData } from "@/lib/schemas/auth.schema";
import { redirect } from "next/navigation";

export async function signInAction(data: SignInFormData) {
  try {
    await signIn("nodemailer", {
      email: data.email,
      redirect: false,
    });
    redirect("/verify-request");
  } catch (error) {
    throw new Error("Failed to send magic link");
  }
}
