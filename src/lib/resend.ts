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
        subject: "Your magic link to sign in",
        html: this.generateMagicLinkEmail(magicLink),
        text: `Sign in to Net&Connect\n\nClick the link below to sign in:\n${magicLink}\n\nThis link will expire in 20 minutes.`,
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
          <title>Sign in to Net&Connect</title>
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
              <h1>Sign in to your account</h1>
            </div>
            
            <p>Hello,</p>
            
            <p>You requested to sign in to your Net&Connect account. Click the button below to sign in:</p>
            
            <div style="text-align: center;">
              <a href="${magicLink}" class="button">Sign in to Net&Connect</a>
            </div>
            
            <p>If you didn't request this, you can safely ignore this email.</p>
            
            <p>This link will expire in 20 minutes for security reasons.</p>
            
            <div class="footer">
              <p>Best regards,<br>The Net&Connect Team</p>
              <p><em>If the button doesn't work, you can copy and paste this link into your browser:</em><br>
              <a href="${magicLink}">${magicLink}</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const resendEmailService = new ResendEmailService();
