
'use server';
/**
 * @fileoverview A conversational AI assistant flow for booking and enquiries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  BookingRequestSchema,
  ConverseRequestSchema,
  ConverseResponseSchema,
  MessageSchema,
  type ConverseRequest,
  type ConverseResponse,
  type Message,
} from '@/lib/schemas';
import { processBooking, getBookingDetails, processCancellation } from './booking-flow';
import { format } from 'date-fns';

// Helper to get business policy information
const getPolicyInfo = ai.defineTool(
  {
    name: 'getPolicyInfo',
    description: 'Retrieves information about business policies like cancellation, deposits, or lateness.',
    inputSchema: z.object({
      topic: z.string().describe('The policy topic, e.g., "cancellation", "deposit", "sickness", "lateness"'),
    }),
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    // In a real app, this would fetch from a database or a CMS.
    // For now, we'll hardcode the policies based on policy-dialog.tsx.
    const policies = {
      cancellation: 'You may cancel up to 24 hours before your appointment. Cancellations with less notice may result in a fee. To cancel, I need your booking number.',
      deposit: 'To secure an appointment, a non-refundable booking fee is required. This fee will be discounted off the cost of your treatment.',
      sickness: 'If you or someone in your household has a contagious illness, please contact me as soon as possible to reschedule.',
      lateness: 'Please arrive on time. If you are more than 10 minutes late, your appointment may be shortened or rescheduled, and the full fee may still apply.',
      general: "I can help with bookings, cancellations, and questions about our services and policies. What would you like to do?",
    };
    const key = topic.toLowerCase() as keyof typeof policies;
    return policies[key] || "I don't have information on that specific policy. The main policies are about cancellations, deposits, sickness, and lateness.";
  }
);

// Helper to get service information
const getServiceInfo = ai.defineTool(
  {
      name: 'getServiceInfo',
      description: 'Provides information about available lash services, like "Classic", "Hybrid", or "Volume" lashes, or recommendations.',
      inputSchema: z.object({
        serviceName: z.string().optional().describe('The specific service to get info about.'),
        recommendationQuery: z.string().optional().describe('A user query asking for a service recommendation, e.g., "I want a natural look".'),
      }),
      outputSchema: z.string(),
  },
  async ({ serviceName, recommendationQuery }) => {
      const services = {
          'classic lashes': 'Classic lashes are a 1:1 application, perfect for a natural, subtle enhancement. They add length and curl.',
          'hybrid lashes': 'Hybrid lashes are a mix of Classic and Volume lashes, offering a fuller look than classics but less dramatic than full volume. It\'s a great in-between!',
          'volume lashes': 'Volume lashes use handmade fans of multiple fine lashes applied to each natural lash, creating a dense, full, and dramatic look.',
          'infill': 'Infills are for maintaining your lash extensions. They should be booked every 2-3 weeks to keep your lashes looking full.',
          'lash removal': 'A professional removal service to safely and gently remove your eyelash extensions without damaging your natural lashes.',
      };

      if (serviceName) {
          const key = serviceName.toLowerCase() as keyof typeof services;
          return services[key] || `I don't recognize the service "${serviceName}". Available services are: Classic, Hybrid, Volume, Infill, and Removal.`;
      }
      if (recommendationQuery) {
          // This is a simple logic. A real app might call another AI model for this.
          if (recommendationQuery.includes('natural') || recommendationQuery.includes('subtle')) {
              return "For a natural look, I'd recommend Classic Lashes. They enhance your natural lashes beautifully.";
          }
          if (recommendationQuery.includes('dramatic') || recommendationQuery.includes('full')) {
              return "If you want a full, dramatic look, Volume Lashes are the way to go!";
          }
          return "For a look that's not too natural but not too dramatic, Hybrid Lashes are the perfect choice. Would you like to book one of these?";
      }
      return 'We offer Classic, Hybrid, and Volume lashes, as well as Infills and Removals. Which service are you interested in?';
  }
);

// Tool to create a booking
const createBookingTool = ai.defineTool(
    {
        name: 'createBookingTool',
        description: 'Use this tool to finalize and create a new booking appointment when you have all the required information.',
        inputSchema: BookingRequestSchema.omit({ date: true }).extend({
          date: z.string().describe("The desired date for the appointment, formatted as a string like 'Dec 25, 2025'"),
        }),
        outputSchema: z.object({ bookingNumber: z.string() }),
    },
    async (input) => {
        const response = await processBooking({ ...input });
        return { bookingNumber: response.bookingNumber };
    }
);

// Tool to check booking details
const getBookingDetailsTool = ai.defineTool({
    name: 'getBookingDetailsTool',
    description: 'Retrieves the details of an existing booking using the booking number.',
    inputSchema: z.object({ bookingNumber: z.string() }),
    outputSchema: z.object({
        details: z.string(),
        isCancellable: z.boolean(),
    }),
}, async ({ bookingNumber }) => {
    const booking = await getBookingDetails(bookingNumber);
    if (!booking) {
        return { details: `I couldn't find a booking with the number ${bookingNumber}. Please check the number and try again.`, isCancellable: false };
    }
    const detailsString = `Booking #${booking.bookingNumber} for ${booking.service} on ${booking.date}.`;
    return { details: detailsString, isCancellable: booking.status !== 'cancelled' };
});

// Tool to cancel a booking
const cancelBookingTool = ai.defineTool({
    name: 'cancelBookingTool',
    description: 'Cancels a booking using the booking number.',
    inputSchema: z.object({ bookingNumber: z.string() }),
    outputSchema: z.string(),
},
async ({ bookingNumber }) => {
    try {
        await processCancellation(bookingNumber);
        return `Your booking #${bookingNumber} has been successfully cancelled. A confirmation email has been sent.`;
    } catch (error: any) {
        return `There was an error cancelling booking #${bookingNumber}. The booking may not exist or has already been cancelled.`;
    }
});

const createEnquiryRedirectTool = ai.defineTool({
    name: 'createEnquiryRedirectTool',
    description: 'Creates a WhatsApp redirect link for a user to make an enquiry about a specific booking.',
    inputSchema: z.object({ bookingNumber: z.string() }),
    outputSchema: z.string(),
},
async ({ bookingNumber }) => {
    const booking = await getBookingDetails(bookingNumber);
    if (!booking) {
        return `I couldn't find a booking with the number ${bookingNumber}. Please check the number and try again.`;
    }
    const whatsAppNumber = process.env.BUSINESS_CONTACT || "447438289674"; 
    if (!whatsAppNumber) {
        return "I'm sorry, I can't create a WhatsApp link right now. Please contact us directly.";
    }
    const message = `Hi, my name is ${booking.name}, these are my booking details: Booking #${booking.bookingNumber} for ${booking.service} on ${booking.date}.`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
});


const assistantPrompt = `You are a friendly and professional AI assistant for '${process.env.BUSINESS_NAME}', a beautician specializing in eyelash services.\nYour persona is helpful, polite, and efficient. Use emojis to make the conversation feel warm and friendly ✨.\n\nYour primary tasks are:\n1.  **Answer Questions**: Use the provided tools to answer questions about services (Classic, Hybrid, Volume lashes, Infills, Removal) and business policies (cancellations, deposits, lateness).\n2.  **Manage Bookings**:\n    - **Create Bookings**: Guide the user to provide all necessary information: full name, email, phone number, postcode, desired service, and desired date. Once you have all details, you MUST use the \`createBookingTool\`.\n    - **Check Bookings**: If a user asks about their booking, ask for their booking number and use the \`getBookingDetailsTool\`.\n    - **Cancel Bookings**: If a user wants to cancel, ask for their booking number. Use the \`getBookingDetailsTool\` to verify the booking. If it exists, confirm with the user that they want to cancel that specific appointment. If they confirm, THEN use the \`cancelBookingTool\`.\n    - **Handle Enquiries about Bookings**: If a user wants to make an enquiry or change their appointment, ask for their booking number and use the \`createEnquiryRedirectTool\` to generate a WhatsApp link for them to continue the conversation.\n3.  **Service Recommendations**: If a user asks for advice (e.g., "what lashes should I get?"), use the \`getServiceInfo\` tool with the \`recommendationQuery\` to provide a recommendation.\n\n**Conversation Flow Rules:**\n- Be conversational. Don't just fire questions. For example, say "Of course, I can help with that! To get started, could I get your full name please?"\n- When asking for booking details, ask for one piece of information at a time to avoid overwhelming the user.\n- Before creating or cancelling a booking, ALWAYS confirm with the user. For example: "Just to confirm, you want to book Hybrid Lashes for this Tuesday. Is that correct?" or "I found your booking for Classic Lashes. Are you sure you want to cancel it?"\n- If you don't understand, ask for clarification.\n- If a booking is successfully created or cancelled, end the conversation by saying the action is complete and a confirmation email has been sent.\n- When providing a WhatsApp link, present it clearly to the user. For example: "No problem, please use this link to chat with us on WhatsApp about your booking: [link]"\n\nServices available: Classic Lashes, Hybrid Lashes, Volume Lashes, Infill, Lash Removal.\n`;

// Define the shape that ai.generate expects
type ApiChatMessage = {
  role: 'user' | 'model' | 'system' | 'tool';
  content: { text: string }[];
};

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: ConverseRequestSchema,
    outputSchema: ConverseResponseSchema,
  },
  async ({ history, prompt }) => {
    
    // Transform the incoming history and prompt into the format ai.generate expects
    const messages: ApiChatMessage[] = [
      {
        role: 'system',
        content: [{ text: assistantPrompt }],
      },
      ...history.map((msg: Message) => ({
        role: msg.role as 'user' | 'model', // Cast role to the expected union type
        content: [{ text: msg.content }], // Wrap content in the Part array
      })),
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ];

    const result = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      messages: messages, // Use the correctly formatted messages
      tools: [getPolicyInfo, getServiceInfo, createBookingTool, getBookingDetailsTool, cancelBookingTool, createEnquiryRedirectTool],
      config: { temperature: 0.9 }
    });

    let replyText = result.text || ""; // Initialize replyText to an empty string if result.text is undefined
    const toolCalls = result.output?.message.toolCalls;

    let bookingNumber: string | undefined;
    if (toolCalls) {
        for (const call of toolCalls) {
            if (call.toolName === 'createBookingTool') {
                const toolOutput = call.output as { bookingNumber: string };
                bookingNumber = toolOutput.bookingNumber;
                break;
            } else if (call.toolName === 'createEnquiryRedirectTool') {
                const toolOutput = call.output as string; // The output of this tool is the WhatsApp URL string
                replyText = `No problem, please use this link to chat with us on WhatsApp about your booking: ${toolOutput}`;
                break; // Assuming only one tool call for this response
            }
        }
    }

    return {
        reply: replyText,
        bookingNumber: bookingNumber
    };
  }
);

export async function converse(
  input: ConverseRequest
): Promise<ConverseResponse> {
  return assistantFlow(input);
}
