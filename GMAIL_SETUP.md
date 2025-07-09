# Gmail Setup Instructions for bilaalmunir00@gmail.com

## Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2FA (you'll need your phone)

## Step 2: Generate App Password
1. After enabling 2FA, go back to the Security page
2. Under "Signing in to Google", click on "App passwords"
3. You might need to sign in again
4. Select "Mail" as the app and "Other (Custom name)" as the device
5. Enter "CSV Email Sender" as the custom name
6. Click "Generate"
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Update Environment Variables
The `.env.local` file has been created with your email. You just need to replace `your_app_password_here` with the 16-character app password you generated:

```
EMAIL_PROVIDER=gmail
GMAIL_USER=bilaalmunir00@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

## Step 4: Test the Setup
1. Run `npm run dev`
2. Upload a CSV file with a test email (maybe your own email)
3. Send a test email to verify everything works

## Important Notes:
- **Never use your regular Gmail password** - only use the App Password
- **Keep your App Password secure** - treat it like a password
- **Gmail has sending limits**: 
  - 500 emails per day for regular accounts
  - 2000 emails per day for Google Workspace accounts
- **Remove spaces** from the app password when copying to .env.local

## Troubleshooting:
- If you get "Invalid credentials" error, double-check the app password
- If 2FA isn't available, you might need to verify your phone number first
- Make sure there are no extra spaces in the .env.local file

## Security Tips:
- Don't commit the .env.local file to version control
- Consider using a dedicated Gmail account for sending emails
- Monitor your sent emails in Gmail to ensure delivery