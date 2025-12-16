import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    console.log('[API Route] Received booking request:', json);

    // We will add the database logic here later

    return NextResponse.json({ message: 'Booking received' }, { status: 200 });
  } catch (error) {
    console.error('[API Route] Error processing booking request:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
