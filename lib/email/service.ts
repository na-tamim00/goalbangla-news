import { EmailService, SendVerificationCodeParams } from './types';

// In-memory store for development testing to display codes in dev banner
const globalForDevCodes = globalThis as unknown as { devVerificationCodes?: Map<string, string> };
if (!globalForDevCodes.devVerificationCodes) {
  globalForDevCodes.devVerificationCodes = new Map<string, string>();
}
const devCodes = globalForDevCodes.devVerificationCodes;

export class ResendEmailProvider implements EmailService {
  private apiKey: string | undefined;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'GoalBangla Newsroom <onboarding@resend.dev>';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getLastDevCode(email: string): string | null {
    return devCodes.get(email.toLowerCase()) || null;
  }

  async sendVerificationCode({
    to,
    code,
    recipientName,
  }: SendVerificationCodeParams): Promise<{ success: boolean; error?: string; devCode?: string }> {
    const isDeployedProduction =
      Boolean(process.env.VERCEL) ||
      process.env.NETLIFY === 'true' ||
      process.env.RESEND_STRICT_PROD === 'true';

    // Development / local fallback when RESEND_API_KEY is not configured
    if (!this.isConfigured()) {
      if (isDeployedProduction) {
        return {
          success: false,
          error:
            'Email delivery is unconfigured (missing RESEND_API_KEY). Please set RESEND_API_KEY in your deployment environment variables.',
        };
      }

      // Log clearly to the server console in development / local testing
      devCodes.set(to.toLowerCase(), code);
      console.log('\n======================================================');
      console.log(' [DEV EMAIL SERVICE] ✉️ Transactional Verification Email');
      console.log(`  To: ${recipientName} <${to}>`);
      console.log(`  Verification Code: [ ${code} ]`);
      console.log('  Validity: 15 minutes');
      console.log('======================================================\n');

      return { success: true, devCode: code };
    }

    // Real transactional delivery via Resend API
    try {
      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GoalBangla Newsroom Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f4f5;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#09090b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#18181b;border:1px solid #27272a;border-radius:16px;padding:36px 32px;text-align:left;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:1px;color:#ffffff;text-transform:uppercase;">
                GOAL<span style="color:#ef4444;">BANGLA</span>
              </h1>
              <p style="margin:4px 0 0 0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:2px;font-weight:700;">
                Editorial Newsroom Access
              </p>
            </td>
          </tr>
          <tr>
            <td style="color:#e4e4e7;font-size:14px;line-height:22px;">
              <p style="margin:0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
              <p style="margin:0 0 24px 0;color:#a1a1aa;">
                Your account on the GoalBangla Editorial CMS has been created. Use the single-use 6-digit verification code below to confirm your Gmail address and activate your account.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 0 28px 0;">
              <div style="display:inline-block;background-color:#09090b;border:2px solid #ef4444;border-radius:12px;padding:16px 36px;letter-spacing:10px;font-size:32px;font-weight:900;color:#ffffff;font-family:monospace;">
                ${code}
              </div>
              <p style="margin:12px 0 0 0;font-size:12px;color:#71717a;">
                This code is valid for <strong>15 minutes</strong>. Do not share this code with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #27272a;padding-top:20px;color:#71717a;font-size:11px;line-height:18px;">
              <p style="margin:0;">
                If you did not request or expect this account invitation, please ignore this email or notify your editorial administrator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: `${code} is your GoalBangla CMS verification code`,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ message: res.statusText }));
        console.error('[Resend Error]', errorJson);
        return {
          success: false,
          error: errorJson.message || `Failed to deliver email via Resend (${res.status})`,
        };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[Resend Provider Exception]', err);
      return { success: false, error: err.message || 'Email delivery failure' };
    }
  }
}

// Export singleton instance
export const emailService: EmailService = new ResendEmailProvider();
