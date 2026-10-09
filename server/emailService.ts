/**
 * Email Service Abstraction with Real Nodemailer Integration
 * Supports Google SMTP (smtp.gmail.com), custom SMTP hosts,
 * connection verification, and development fallback mode.
 */
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailSendOptions {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  referenceId?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId: string;
  channel: 'email';
  recipient: string;
  provider: string;
  status: 'sent' | 'failed' | 'delivered';
  providerResponse: string;
  error?: string;
  timestamp: string;
  durationMs: number;
}

export interface SmtpConfigStatus {
  configured: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  isGoogleSmtp: boolean;
}

/**
 * Returns current SMTP configuration status (without leaking secrets)
 */
export function getSmtpConfigStatus(): SmtpConfigStatus {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const from = process.env.EMAIL_FROM || user || 'notifications@manziliq.pk';

  const isGoogleSmtp = host.includes('gmail.com') || host.includes('google') || user.endsWith('@gmail.com');

  return {
    configured: Boolean(user && pass),
    host,
    port,
    secure,
    user: user ? `${user.substring(0, 3)}***@${user.split('@')[1] || 'domain'}` : '',
    from,
    isGoogleSmtp
  };
}

/**
 * Creates a Nodemailer transporter using environment variables or optional custom params
 */
export function createMailTransporter(customConfig?: {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}): Transporter | null {
  const host = customConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = customConfig?.port ?? (Number(process.env.SMTP_PORT) || 465);
  const secure = customConfig?.secure ?? (process.env.SMTP_SECURE === 'true' || port === 465);
  const user = customConfig?.user || process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = customConfig?.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  const cleanUser = user.trim();
  const cleanPass = pass.trim().replace(/\s+/g, ''); // Google App Passwords often have spaces like "abcd efgh ijkl mnop"
  const isGoogle = host.includes('gmail') || host.includes('google') || cleanUser.endsWith('@gmail.com');

  // For Gmail / Google Workspace, service: 'gmail' automatically configures optimal ports and TLS
  if (isGoogle) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });
  }

  // Configure transporter for custom SMTP
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Verifies live SMTP credentials / connection with mail server
 */
export async function verifySmtpConnection(customConfig?: {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}): Promise<{ ok: boolean; message: string; details?: any }> {
  const transporter = createMailTransporter(customConfig);
  if (!transporter) {
    return {
      ok: false,
      message: 'SMTP credentials not configured. Please supply SMTP_USER and SMTP_PASS (Google App Password).'
    };
  }

  try {
    await transporter.verify();
    return {
      ok: true,
      message: 'SMTP handshake successful! Mail server is ready to send outgoing messages.'
    };
  } catch (error: any) {
    let errorHelp = error.message;
    if (error.code === 'EAUTH') {
      errorHelp = 'Authentication failed. If using Google/Gmail, make sure 2-Step Verification is enabled and you are using a 16-character Google App Password (not your normal account password).';
    }
    return {
      ok: false,
      message: `SMTP Connection failed: ${errorHelp}`,
      details: error.code || error.message
    };
  }
}

/**
 * Dispatches an email notification via live SMTP or sandbox fallback
 */
export async function sendEmailNotification(options: EmailSendOptions): Promise<EmailSendResult> {
  const startTime = Date.now();
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const fromEmail = process.env.EMAIL_FROM || smtpUser || 'notifications@manziliq.pk';
  const fromName = process.env.EMAIL_FROM_NAME || 'MANZILIQ Smart Housing';

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!options.recipientEmail || !emailRegex.test(options.recipientEmail)) {
    return {
      success: false,
      messageId: `EMAIL-ERR-${Date.now()}`,
      channel: 'email',
      recipient: options.recipientEmail,
      provider: 'ValidationEngine',
      status: 'failed',
      providerResponse: 'INVALID_EMAIL_ADDRESS',
      error: 'Invalid recipient email format',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime
    };
  }

  // Live SMTP Mode (if credentials provided)
  if (smtpUser && smtpPass) {
    try {
      const transporter = createMailTransporter();
      if (!transporter) {
        throw new Error('Transporter could not be created');
      }

      console.log(`[Email Orchestrator] Dispatching live email via ${smtpHost} to ${options.recipientEmail}`);

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.recipientName ? `"${options.recipientName}" <${options.recipientEmail}>` : options.recipientEmail,
        subject: options.subject,
        text: options.bodyText,
        html: options.bodyHtml || `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: -0.5px;">${fromName}</h2>
              <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Official Property & Society Notification</p>
            </div>
            <div style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">
              ${options.bodyText}
            </div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              This is an automated notification from ${fromName}. Please do not reply directly to this email.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;

      console.log(`[Email Orchestrator] Live email sent successfully! MessageId: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        channel: 'email',
        recipient: options.recipientEmail,
        provider: `Live SMTP (${smtpHost})`,
        status: 'delivered',
        providerResponse: `250 OK: ${info.response || 'Message accepted for delivery'}`,
        timestamp: new Date().toISOString(),
        durationMs: duration
      };
    } catch (err: any) {
      console.error('[Email Orchestrator] SMTP Send Error:', err);
      let errMsg = err?.message || 'Failed to dispatch email through SMTP';
      if (err.code === 'EAUTH') {
        errMsg = 'Authentication failed. Please verify your Google App Password.';
      }

      return {
        success: false,
        messageId: `EMAIL-SMTP-ERR-${Date.now()}`,
        channel: 'email',
        recipient: options.recipientEmail,
        provider: `SMTP (${smtpHost})`,
        status: 'failed',
        providerResponse: 'SMTP_DELIVERY_FAILED',
        error: errMsg,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime
      };
    }
  }

  // Safe Development & Sandbox Mode (When SMTP is unconfigured)
  const duration = Math.floor(Math.random() * 90) + 50;
  const mockMsgId = `SIM-EMAIL-${Date.now().toString(36).toUpperCase()}`;

  console.log(`[Email Orchestrator (Dev Mode)] Subject: "${options.subject}" | To: ${options.recipientEmail} | Provider: Simulated Mailer (Configure SMTP_USER & SMTP_PASS in .env for Live Google SMTP Delivery)`);

  return {
    success: true,
    messageId: mockMsgId,
    channel: 'email',
    recipient: options.recipientEmail,
    provider: 'MANZILIQ Mailer (Sandbox Simulation - Supply Google SMTP credentials to send real emails)',
    status: 'delivered',
    providerResponse: `DEV_EMAIL_SENT: 250 OK Simulated message generated for ${options.recipientEmail} with subject "${options.subject}"`,
    timestamp: new Date().toISOString(),
    durationMs: duration
  };
}
