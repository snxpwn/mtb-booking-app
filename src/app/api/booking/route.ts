
import { NextResponse } from 'next/server';
import { processBooking } from '@/ai/flows/booking-flow';
import { bookingSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log('[API Route] Received booking request:', json);

    // Validate the request body against the booking schema
    const validatedData = bookingSchema.safeParse(json);
    if (!validatedData.success) {
      console.error('[API Route] Invalid booking data:', validatedData.error);
      return NextResponse.json({ error: 'Invalid data', details: validatedData.error.flatten() }, { status: 400 });
    }

    // Call the original booking processing flow
    const result = await processBooking(validatedData.data);
    console.log('[API Route] Booking processed successfully:', result);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[API Route] CRITICAL: Error processing booking request:', error.message, error.stack);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
