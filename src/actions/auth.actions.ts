"use server";

import { SignInFormData } from "@/lib/schemas/auth.schema";
import { UserService } from "@/services/user.service";

export async function signInAction(data: SignInFormData) {
  try {
    // First, check if the email exists in Airtable
    const existingUser = await UserService.findUserByEmail(data.email);

    if (!existingUser) {
      return {
        success: false,
        message:
          "Cette adresse email n'est pas enregistree dans notre systeme. Veuillez contacter l'administrateur pour creer votre compte.",
      };
    }

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
        : " Le lien magique a ete envoye sur ton mail",
    };
  } catch (error) {
    console.error("Sign-in error:", error);
    return {
      success: false,
      message:
        "Une erreur s'est produite lors de l'envoi du lien. Veuillez réessayer.",
    };
  }
}
