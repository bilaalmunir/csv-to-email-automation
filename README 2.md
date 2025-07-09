# CSV Email Sender

A modern Next.js application for sending bulk emails to addresses extracted from CSV files.

## Setup Instructions

### 1. Choose an Email Provider

Pick one of the following email services and follow the setup instructions:

#### Option A: SendGrid (Recommended)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key in your SendGrid dashboard
3. Verify your sender email address
4. Add to `.env.local`:
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=your-verified-sender@yourdomain.com
```

#### Option B: Resend (Modern & Developer-Friendly)
1. Sign up at [Resend](https://resend.com/)
2. Create an API key
3. Verify your domain or use their test domain
4. Add to `.env.local`:
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=your-verified-sender@yourdomain.com
```

#### Option C: Gmail (Personal Use)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password (not your regular password)
3. Add to `.env.local`:
```
EMAIL_PROVIDER=gmail
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

#### Option D: Custom SMTP (Any Email Provider)
1. Get SMTP settings from your email provider
2. Add to `.env.local`:
```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your_email_password_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
```bash
npm run dev
```

## Features

- **CSV Upload**: Drag-and-drop or click to upload CSV files
- **Email Extraction**: Automatically finds email addresses in any column
- **Email Preview**: Shows all extracted emails before sending
- **Bulk Email Sending**: Sends personalized emails to all recipients
- **Rate Limiting**: Prevents overwhelming email services
- **Error Handling**: Proper validation and error reporting
- **Responsive Design**: Works on all devices

## Usage

1. Upload a CSV file containing email addresses
2. Review the extracted email addresses
3. Write your subject and message
4. Click "Send Emails" to send to all recipients

## Important Notes

- **Email Limits**: Most email providers have daily sending limits
- **Sender Reputation**: Use a verified domain for better deliverability
- **Compliance**: Ensure you have permission to email all recipients
- **Testing**: Test with a small group before sending to large lists

## Troubleshooting

- **Authentication Errors**: Double-check your API keys and credentials
- **Rate Limiting**: The app includes built-in rate limiting, but you may need to adjust for your provider
- **Delivery Issues**: Check your sender reputation and email content for spam triggers