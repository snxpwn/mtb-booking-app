'use server';

import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: MailOptions) {
  console.log("Debugging email sender:");
  console.log("process.env.GMAIL_EMAIL:", process.env.GMAIL_EMAIL);
  console.log("process.env.GMAIL_APP_PASSWORD:", !!process.env.GMAIL_APP_PASSWORD); // Log presence, not value
  console.log("process.env.RESEND_FROM_EMAIL_OVERRIDE:", process.env.RESEND_FROM_EMAIL_OVERRIDE);
  console.log("process.env.RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);

  const fromAddress = from || `"${process.env.BUSINESS_NAME}" <${process.env.GMAIL_EMAIL}>`;
  console.log("Resolved fromAddress:", fromAddress);

  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      'Gmail email or app password are not set in environment variables. Skipping email.'
    );
    console.log('Email that would have been sent:');
    console.log('To:', to);
    console.log('From:', fromAddress);
    console.log('Subject:', subject);
    console.log('Body:', html);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email.');
  }
}
