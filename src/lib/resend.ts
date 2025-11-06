import { Resend } from "resend";

export const runtime = "nodejs";

interface SendMagicLinkOptions {
  to: string;
  magicLink: string;
}

export class ResendEmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM || "";

    if (!apiKey || !this.fromEmail) {
      throw new Error(
        "Missing Resend configuration. Please check your environment variables."
      );
    }

    this.resend = new Resend(apiKey);
  }

  async sendMagicLink({ to, magicLink }: SendMagicLinkOptions): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: "Votre lien magique pour vous connecter",
        html: this.generateMagicLinkEmail(magicLink),
        text: `Connectez-vous à Net&Connect\n\nCliquez sur le lien ci-dessous pour vous connecter :\n${magicLink}\n\nCe lien expirera dans 20 minutes.`,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error("Failed to send magic link email");
      }

      console.log("Magic link email sent successfully:", data);
    } catch (error) {
      console.error("Failed to send magic link email:", error);
      throw new Error("Failed to send magic link email");
    }
  }

  private generateMagicLinkEmail(magicLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Connexion à Net&Connect</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { color: #A4D65E; font-size: 24px; font-weight: bold; }
            .button { 
              display: inline-block; 
              background-color: #A4D65E; 
              color: black; 
              padding: 12px 24px; 
              border-radius: 24px; 
              text-decoration: none; 
              font-weight: 500;
              margin: 20px 0;
            }
            .footer { margin-top: 40px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Net&Connect</div>
              <h1>Connectez-vous à votre compte</h1>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Vous avez demande à vous connecter à votre compte Net&Connect. Cliquez sur le bouton ci-dessous pour vous connecter :</p>
            
            <div style="text-align: center;">
              <a href="${magicLink}" class="button">Se connecter à Net&Connect</a>
            </div>
            
            <p>Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email en toute securite.</p>
            
            <p>Ce lien expirera dans 20 minutes pour des raisons de securite.</p>
            
            <div class="footer">
              <p>Cordialement,<br>L'equipe Net&Connect</p>
              <p><em>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</em><br>
              <a href="${magicLink}">${magicLink}</a></p>
            </div>
          </div>
        </body>
      </html>e
    `;
  }
}

export const resendEmailService = new ResendEmailService();
