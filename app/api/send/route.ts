import { NextRequest, NextResponse } from 'next/server';
import { sendWithSendGrid, sendWithResend, sendWithGmail, sendWithSMTP } from '@/lib/email-providers';

interface EmailRequest {
  emails: string[];
  subject: string;
  body: string;
}

// Choose your email provider here
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid'; // Options: 'sendgrid', 'resend', 'gmail', 'smtp'

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    switch (EMAIL_PROVIDER) {
      case 'sendgrid':
        await sendWithSendGrid(to, subject, body);
        break;
      case 'resend':
        await sendWithResend(to, subject, body);
        break;
      case 'gmail':
        await sendWithGmail(to, subject, body);
        break;
      case 'smtp':
        await sendWithSMTP(to, subject, body);
        break;
      default:
        throw new Error(`Unknown email provider: ${EMAIL_PROVIDER}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { emails, subject, body }: EmailRequest = await request.json();

    // Validation
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'No email addresses provided' },
        { status: 400 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }

    // Validate email addresses
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email addresses: ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    // Send emails with rate limiting (to avoid overwhelming the email service)
    const results = [];
    const batchSize = 10; // Send 10 emails at a time
    const delay = 1000; // 1 second delay between batches

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(email => sendEmail(email, subject, body))
      );
      results.push(...batchResults);

      // Add delay between batches (except for the last batch)
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value
    ).length;

    const failed = results.length - successful;

    console.log(`Email sending completed:
      Subject: ${subject}
      Recipients: ${emails.length}
      Successful: ${successful}
      Failed: ${failed}
    `);

    if (failed > 0) {
      return NextResponse.json(
        { 
          message: `Emails sent with some failures: ${successful} successful, ${failed} failed`,
          successful,
          failed 
        },
        { status: 207 } // Multi-status
      );
    }

    return NextResponse.json(
      { 
        message: `Successfully sent ${successful} emails`,
        successful,
        failed: 0
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}