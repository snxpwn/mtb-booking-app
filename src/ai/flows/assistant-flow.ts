
'use server';
/**
 * @fileoverview A conversational AI assistant flow for booking and enquiries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ConverseRequestSchema,
  ConverseResponseSchema,
  MessageSchema,
  type ConverseRequest,
  type ConverseResponse,
  type Message,
} from '@/lib/schemas';
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

const assistantPrompt = `You are a friendly and professional AI assistant for '${process.env.BUSINESS_NAME}', a beautician specializing in eyelash services.\nYour persona is helpful, polite, and efficient. Use emojis to make the conversation feel warm and friendly ✨.\n\nYour primary tasks are:\n1.  **Answer Questions**: Use the provided tools to answer questions about services (Classic, Hybrid, Volume lashes, Infills, Removal) and business policies (cancellations, deposits, lateness).\n2.  **Service Recommendations**: If a user asks for advice (e.g., "what lashes should I get?"), use the \`getServiceInfo\` tool with the \`recommendationQuery\` to provide a recommendation.\n\n**Conversation Flow Rules:**\n- Be conversational. Don't just fire questions. For example, say "Of course, I can help with that! What can I help you with today?"\n- If you don't understand, ask for clarification.\n`;

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
      messages: messages,
      tools: [getPolicyInfo, getServiceInfo],
      config: { temperature: 0.9 }
    });

    let replyText = result.text || "";

    return {
        reply: replyText,
        bookingNumber: undefined
    };
  }
);

export async function converse(
  input: ConverseRequest
): Promise<ConverseResponse> {
  return assistantFlow(input);
}
