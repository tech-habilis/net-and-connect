"use server";

import { SignInFormData } from "@/lib/schemas/auth.schema";

export async function signInAction(data: SignInFormData) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth?req=request-link`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send magic link");
    }

    const result = await response.json();

    return {
      success: true,
      message: result.dev_link
        ? `Development mode: ${result.dev_link}`
        : " Le lien magique a été envoyé sur ton mail",
    };
  } catch (error) {
    console.error("Sign-in error:", error);
    return {
      success: false,
      message: "Failed to send magic link. Please try again.",
    };
  }
}
