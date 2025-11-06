import axios from "axios";

export const runtime = "nodejs";

interface SendMagicLinkOptions {
  to: string;
  magicLink: string;
}

interface BrevoEmailData {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
  }>;
  subject: string;
  htmlContent: string;
}

export class BrevoEmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || "";
    this.fromEmail = process.env.BREVO_FROM_EMAIL || "";
    this.fromName = process.env.BREVO_FROM_NAME || "";

    if (!this.apiKey || !this.fromEmail || !this.fromName) {
      throw new Error(
        "Missing Brevo configuration. Please check your environment variables."
      );
    }
  }

  async sendMagicLink({ to, magicLink }: SendMagicLinkOptions): Promise<void> {
    const emailData: BrevoEmailData = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: to,
        },
      ],
      subject: "Votre lien magique pour vous connecter",
      htmlContent: this.generateMagicLinkEmail(magicLink),
    };

    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        emailData,
        {
          headers: {
            "api-key": this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Magic link email sent successfully:", response.data);
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
      </html>
    `;
  }
}

export const brevoEmailService = new BrevoEmailService();
