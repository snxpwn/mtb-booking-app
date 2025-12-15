
'use server';
/**
 * @fileOverview A flow for processing booking and cancellation requests.
 *
 * - processBooking - A function that handles the booking process.
 * - processCancellation - A function that handles the cancellation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  BookingRequestSchema,
  BookingResponseSchema,
  type BookingRequest,
  type BookingResponse,
} from '@/lib/schemas';
import { sendEmail } from '@/lib/email';
import { getAdminDb } from '@/lib/firebase-admin';

async function generateBookingNumber(): Promise<string> {
  const min = 10000;
  const max = 99999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

export async function processBooking(
  input: BookingRequest
): Promise<BookingResponse> {
  console.log('[Booking Flow] Starting booking process for:', input.email);
  const bookingNumber = await generateBookingNumber();
  console.log(`[Booking Flow] Generated booking number: ${bookingNumber}`);

  // 1. Save to Firestore
  try {
    console.log(`[Booking Flow] Step 1: Saving booking to Firestore...`);
    const db = getAdminDb();
    await db.collection('bookings').doc(bookingNumber).set({
      ...input,
      bookingNumber,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    });
    console.log(`[Booking Flow] Step 1: Successfully saved booking.`);
  } catch (error: any) {
    console.error('[Booking Flow] CRITICAL: Step 1 FAILED - Error saving to Firestore:', error.message, error.stack);
    throw new Error(`Failed during Firestore operation: ${error.message}`);
  }

  // 2. Generate email content - DISABLED
  // let promptOutput;
  // try {
  //   console.log(`[Booking Flow] Step 2: Generating email content with AI...`);
  //   const { output } = await bookingPrompt({ ...input, bookingNumber });
  //   if (!output) {
  //     throw new Error('AI prompt returned empty output.');
  //   }
  //   promptOutput = output;
  //   console.log(`[Booking Flow] Step 2: Successfully generated email content.`);
  // } catch (error: any) {
  //   console.error('[Booking Flow] CRITICAL: Step 2 FAILED - Error generating AI content:', error.message, error.stack);
  //   throw new Error(`Failed during AI content generation: ${error.message}`);
  // }

  // 3. Send emails - DISABLED
  // try {
  //   console.log(`[Booking Flow] Step 3: Sending booking emails...`);
  //   await sendBookingEmailTool({
  //     ...input,
  //     bookingNumber,
  //     emailSubject: promptOutput.emailSubject,
  //     emailBody: promptOutput.emailBody,
  //   });
  //   console.log(`[Booking Flow] Step 3: Successfully sent emails.`);
  // } catch (error: any) {
  //   console.error('[Booking Flow] CRITICAL: Step 3 FAILED - Error sending emails:', error.message, error.stack);
  //   throw new Error(`Failed during email sending: ${error.message}`);
  // }

  // 4. Return response
  console.log('[Booking Flow] Booking process completed successfully (Email sending disabled).');
  return {
    bookingNumber: bookingNumber,
    emailSubject: 'Your Appointment is Confirmed ✨',
    emailBody: 'Your booking has been received. You will get a manual confirmation shortly.',
  };
}

export async function getBookingDetails(bookingNumber: string) {
    try {
        const db = getAdminDb();
        const doc = await db.collection('bookings').doc(bookingNumber).get();
        if (doc.exists) {
            return doc.data();
        } else {
            return null;
        }
    } catch (error: any) {
        console.error(`[Booking Flow] Error fetching booking details for #${bookingNumber}:`, error);
        throw new Error(`Failed to fetch booking details. Original error: ${error.message}`);
    }
}


export async function processCancellation(bookingNumber: string): Promise<void> {
  await processCancellationFlow(bookingNumber);
}

const bookingPrompt = ai.definePrompt({
  name: 'processBookingPrompt',
  input: { schema: BookingRequestSchema.extend({ bookingNumber: z.string() }) },
  output: { schema: z.object({emailSubject: z.string(), emailBody: z.string() }) },
  model: 'googleai/gemini-2.0-flash',
  config: {
    temperature: 0.9,
  },
  prompt: `
    You are an email generation assistant. A customer has submitted a booking request.
    Your task is to populate the provided HTML email template with the customer\\'s details.

    **DO NOT** change the HTML structure. Only replace the placeholders.
    - Replace [Booking Number] with {{{bookingNumber}}}.
    - Replace [Customer Name] with {{{name}}}.
    - Replace [Service Name – e.g., Eyelash Extensions / Infills] with {{{service}}}.
    - Replace [Date] with {{{date}}}.
    - Replace [Studio Address] with "${process.env.BUSINESS_ADDRESS}".
    - Replace [Phone / WhatsApp] with "${process.env.BUSINESS_CONTACT}".
    - Replace [Business Name] with "${process.env.BUSINESS_NAME}".
    - Replace [Instagram Handle] with "${process.env.INSTAGRAM_HANDLE}".
    - Replace [TikTok Handle] with "${process.env.TIKTOK_HANDLE}".

    The final output should only be a JSON object with 'emailSubject' and 'emailBody' properties. The 'emailSubject' should be "Your Appointment is Confirmed ✨".

    HTML Template:
    <div style="font-family: 'Helvetica', Arial, sans-serif; background:#39040C; padding:25px; color:#FCEFEF;">
      <div style="text-align:center; margin-bottom:20px;">
        <img src="https://i.ibb.co/ZDgmVdD/385-CE8-DD-6-A3-E-4963-8-D1-C-DBB9932-C4-B73.png" 
             alt="MTB Logo" 
             style="width:180px; max-width:60%; height:auto;">
      </div>

      <h2 style="text-align:center; margin-bottom:10px; color:#FCEFEF;">
        Your Appointment is Confirmed ✨
      </h2>

      <p>Hi <strong>[Customer Name]</strong>,</p>

      <p>
        Thank you for booking with <strong>[Business Name]</strong>.<br>
        Your appointment has been successfully scheduled.
      </p>

      <p><strong>Appointment Details:</strong><br>
        • Booking Number: <strong>[Booking Number]</strong><br>
        • Service: <strong>[Service Name – e.g., Eyelash Extensions / Infills]</strong><br>
        • Date: <strong>[Date]</strong><br>
        • Location: <strong>[Studio Address]</strong>
      </p>

      <p>
        Please arrive a few minutes early so we can get you comfortably settled before we start.
        If you need to make any changes, just reply to this email or contact us on
        <strong>[Phone / WhatsApp]</strong>.
      </p>

      <p style="margin-top:20px;">
        We can’t wait to see you and make you feel even more beautiful. 💛
      </p>

      <p>
        Warm regards,<br>
        <strong>[Business Name]</strong>
      </p>

      <div style="text-align:center; margin-top:25px; font-size:13px; opacity:0.9;">
        Follow us:<br>
        Instagram: [Instagram Handle]<br>
        TikTok: [TikTok Handle]
      </div>
    </div>
  `,
});

const cancellationPrompt = ai.definePrompt({
    name: 'cancellationPrompt',
    input: { schema: z.object({
        name: z.string(),
        service: z.string(),
        date: z.string(),
        bookingNumber: z.string(),
    }) },
    output: { schema: z.object({ emailSubject: z.string(), emailBody: z.string() }) },
    model: 'googleai/gemini-2.0-flash',
    config: {
        temperature: 0.9,
    },
    prompt: `
    You are an email generation assistant. A customer has cancelled their booking.
    Your task is to populate the provided HTML email template with the customer\\'s details.

    **DO NOT** change the HTML structure. Only replace the placeholders.
    - Replace {{client_name}} with {{{name}}}.
    - Replace {{appointment_date}} with {{{date}}}.
    - The booking link in the button is static: https://mtbxov1--mtbxov1.us-central1.hosted.app/#booking.
    
    The final output should only be a JSON object with 'emailSubject' and 'emailBody' properties. The 'emailSubject' should be "Appointment Cancelled".

    HTML Template:
    <!DOCTYPE html>
    <html lang="en" style="margin:0; padding:0;">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Cancelled</title>
      </head>
    
      <body style="margin:0; padding:0; background-color:#39040C; font-family:Arial, sans-serif;">
    
        <!-- Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#39040C; padding:20px 0;">
          <tr>
            <td align="center">
    
              <!-- Email Card -->
              <table width="90%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#2A0206; border-radius:12px; padding:20px;">
                
                <!-- Logo -->
                <tr>
                  <td align="center" style="padding-bottom:15px;">
                    <img src="https://i.ibb.co/ZDgmVdD/385-CE8-DD-6-A3-E-4963-8-D1-C-DBB9932-C4-B73.png" 
                         alt="MTB Logo" 
                         width="140" 
                         style="display:block; border:0;" />
                  </td>
                </tr>
    
                <!-- Title -->
                <tr>
                  <td style="color:#FFFFFF; text-align:center; font-size:22px; font-weight:bold; padding-bottom:10px;">
                    Appointment Cancelled
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
                  <td style="color:#FFFFFF; font-size:15px; line-height:1.6; padding-bottom:20px;">
                    Hi <strong>{{client_name}}</strong>,<br><br>
                    We’re sorry to let you know that your appointment scheduled for 
                    <strong>{{appointment_date}}</strong> has been 
                    <span style="color:#D4AF37;"><strong>cancelled</strong></span>.<br><br>
                    If this wasn’t intentional or you’d like to rebook, please feel free to reply to this email or book again through our website.
                  </td>
                </tr>
    
                <!-- Button -->
                <tr>
                  <td align="center" style="padding-bottom:25px;">
                    <a href="https://mtbxov1--mtbxov1.us-central1.hosted.app/#booking" 
                       style="background-color:#D4AF37; color:#39040C; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold; display:inline-block;">
                      Book a New Appointment
                    </a>
                  </td>
                </tr>
    
                <!-- Footer -->
                <tr>
                  <td style="color:#FFFFFF; font-size:13px; text-align:center; opacity:0.8;">
                    Thank you for your understanding.<br>
                    <strong>${process.env.BUSINESS_NAME}</strong><br>
                  </td>
                </tr>
    
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
});

const sendBookingEmailTool = ai.defineTool(
  {
    name: 'sendBookingEmail',
    description:
      'Sends a booking confirmation email to the customer and a notification to the business owner.',
    inputSchema: BookingRequestSchema.extend({
      emailSubject: z.string(),
      emailBody: z.string(),
      bookingNumber: z.string(),
    }),
    outputSchema: z.void(),
  },
  async (input: BookingRequest & { emailSubject: string, emailBody: string, bookingNumber: string }) => {
    // Send confirmation to the customer
    await sendEmail({
      to: input.email,
      subject: input.emailSubject,
      html: input.emailBody,
      from: process.env.GMAIL_EMAIL // Set sender email here
    });

    // Send notification to the business owner
    const notificationSubject = `New Booking Request: ${input.name} - ${input.service}`;
    const notificationBody = `
      <h2>New Booking Request</h2>
      <p><strong>Booking Number:</strong> ${input.bookingNumber}</p>
      <p><strong>Name:</strong> ${input.name}</p>
      <p><strong>Email:</strong> ${input.email}</p>
      <p><strong>Phone:</strong> ${input.phone}</p>
      <p><strong>Postcode:</strong> ${input.postcode}</p>
      <p><strong>Service:</strong> ${input.service}</p>
      <p><strong>Date:</strong> ${input.date}</p>
      ${input.notes ? `<p><strong>Notes:</strong> ${input.notes}</p>` : ''}
    `;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn('ADMIN_EMAIL is not set in environment variables. Skipping admin notification.');
        return;
    }

    await sendEmail({
      to: adminEmail,
      subject: notificationSubject,
      html: notificationBody,
      from: process.env.GMAIL_EMAIL // Set sender email here
    });
  }
);

const processCancellationFlow = ai.defineFlow(
  {
    name: 'processCancellationFlow',
    inputSchema: z.string(),
    outputSchema: z.void(),
  },
  async (bookingNumber) => {
    // 1. Get booking from DB
    const db = getAdminDb();
    const bookingDoc = await db.collection('bookings').doc(bookingNumber).get();
    
    if (!bookingDoc.exists) {
        throw new Error(`No booking found with this reference: ${bookingNumber}`);
    }

    const booking = bookingDoc.data() as any; 

    if (booking.status === 'cancelled') {
        throw new Error('This booking has already been cancelled.');
    }

    // 2. Cancel booking in DB (update status)
    await db.collection('bookings').doc(bookingNumber).update({
        status: 'cancelled'
    });

    // 3. Generate cancellation email - DISABLED
    // const { output } = await cancellationPrompt({
    //     name: booking.name,
    //     service: booking.service,
    //     date: booking.date, 
    //     bookingNumber: booking.bookingNumber
    // });

    // if (!output) {
    //   throw new Error('Failed to generate cancellation email content.');
    // }

    // // 4. Send cancellation email to customer - DISABLED
    // await sendEmail({
    //     to: booking.email,
    //     subject: output.emailSubject,
    //     html: output.emailBody,
    //     from: process.env.GMAIL_EMAIL
    // });

    //  // 5. Send internal notification to admin - DISABLED
    // const adminEmail = process.env.ADMIN_EMAIL;
    // if (adminEmail) {
    //     await sendEmail({
    //         to: adminEmail,
    //         subject: `Booking Cancellation: #${bookingNumber}`,
    //         html: \`
    //             <h2>Booking Cancellation Notification</h2>
    //             <p>The following booking has been cancelled by the customer:</p>
    //             <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
    //             <p><strong>Name:</strong> ${booking.name}</p>
    //             <p><strong>Email:</strong> ${booking.email}</p>
    //             <p><strong>Service:</strong> ${booking.service}</p>
    //             <p><strong>Original Date:</strong> ${booking.date}</p>
    //         \`,
    //         from: process.env.GMAIL_EMAIL
    //     });
    // }
  }
);
