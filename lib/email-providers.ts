// Email service providers integration
import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// SendGrid Configuration
export const sendWithSendGrid = async (to: string, subject: string, body: string) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    throw new Error('SendGrid configuration missing');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>'),
  };

  await sgMail.send(msg);
};

// Resend Configuration
export const sendWithResend = async (to: string, subject: string, body: string) => {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    throw new Error('Resend configuration missing');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>'),
  });
};

// Gmail via Nodemailer Configuration
export const sendWithGmail = async (to: string, subject: string, body: string) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail configuration missing');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify connection
  await transporter.verify();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>'),
  });
};

// Custom SMTP Configuration
export const sendWithSMTP = async (to: string, subject: string, body: string) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration missing');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>'),
  });
};