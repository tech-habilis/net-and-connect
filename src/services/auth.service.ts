import { signIn } from "@/lib/auth";
import { SignInFormData } from "@/lib/schemas/auth.schema";

export interface IAuthService {
  signInWithEmail(data: SignInFormData): Promise<void>;
}

export class AuthService implements IAuthService {
  async signInWithEmail(data: SignInFormData): Promise<void> {
    await signIn("nodemailer", {
      email: data.email,
      redirect: false,
    });
  }
}
