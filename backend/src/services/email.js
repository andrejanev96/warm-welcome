import nodemailer from 'nodemailer';
import { buildPasswordResetEmail } from '../templates/passwordReset.js';
import { logger } from '../utils/logger.js';

let cachedTransporter = null;

const buildTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST) {
    return null;
  }

  const port = Number(SMTP_PORT) || 587;
  const secure = SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465;

  const authConfigured = SMTP_USER && SMTP_PASS;

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: authConfigured
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });

  return cachedTransporter;
};

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  try {
    return buildTransporter();
  } catch (error) {
    logger.error('Failed to configure email transporter', error);
    return null;
  }
};

export const sendPasswordResetEmail = async ({ to, resetLink, expiresAt }) => {
  const transporter = getTransporter();

  if (!transporter) {
    logger.warn(
      'Password reset email not sent because SMTP credentials are not configured. Set SMTP_HOST to enable email delivery.'
    );
    return false;
  }

  const from = process.env.EMAIL_FROM || 'WarmWelcome.ai <no-reply@warmwelcome.ai>';
  const { subject, text, html } = buildPasswordResetEmail({ resetLink, expiresAt });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send password reset email', error);
    return false;
  }
};
