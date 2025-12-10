
import { z } from 'zod';
import { format } from 'date-fns';

// Schema for the booking form on the client-side.
export const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  postcode: z.string().min(5, { message: 'Please enter a valid postcode.' }),
  service: z.string({ required_error: 'Please select a service.' }),
  date: z.string().min(1, { message: "A date of booking is required."}),
  notes: z.string().optional(),
});


// This is the schema for the AI prompt and the server-side flow.
// It matches the data structure after the client formats the date to a string.
export const BookingRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  postcode: z.string().min(5),
  service: z.string(),
  date: z.string(), // The date is now a string, e.g., "2025-12-04"
  notes: z.string().optional(),
});
export type BookingRequest = z.infer<typeof BookingRequestSchema>;


// This is the schema for the output of the AI generation.
export const BookingResponseSchema = z.object({
  bookingNumber: z.string(),
  emailSubject: z
    .string()
    .describe('The subject line for the confirmation email.'),
  emailBody: z.string().describe('The body content for the confirmation email.'),
});
export type BookingResponse = z.infer<typeof BookingResponseSchema>;


// New schema for conversational AI
export const MessageSchema = z.object({
  role: z.enum(['user', 'model', 'system', 'tool']), // Expanded to include all valid roles
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConverseRequestSchema = z.object({
  history: z.array(MessageSchema),
  prompt: z.string(),
});
export type ConverseRequest = z.infer<typeof ConverseRequestSchema>;

export const ConverseResponseSchema = z.object({
  reply: z.string(),
  bookingNumber: z.string().optional(),
});
export type ConverseResponse = z.infer<typeof ConverseResponseSchema>;
