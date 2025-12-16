
'use server';

import { converse } from '@/ai/flows/assistant-flow';
import type { BookingResponse, ConverseRequest, ConverseResponse } from '@/lib/schemas';
import { getAdminDb } from '@/lib/firebase-admin';
import { bookingSchema } from '@/lib/schemas';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

type ClientBookingRequest = z.infer<typeof bookingSchema>;

/**
 * Verifies the admin PIN.
 */
export async function verifyPin(pin: string): Promise<{ success: boolean }> {
    const adminPin = process.env.ADMIN_PIN || '1825';
    if (pin === adminPin) {
        return { success: true };
    }
    return { success: false };
}

/**
 * Creates a booking by processing the input data and saving it to Firestore.
 */
export async function createBooking(
  input: ClientBookingRequest
): Promise<BookingResponse> {
    console.log('[Server Action] createBooking called with:', input);
    
    const validatedData = bookingSchema.parse(input);

    const db = getAdminDb();
    const bookingRef = db.collection('bookings').doc();
    const bookingNumber = `MTB-${bookingRef.id.slice(0, 6).toUpperCase()}`;

    const newBooking = {
        ...validatedData,
        bookingNumber,
        status: 'confirmed',
        createdAt: FieldValue.serverTimestamp(),
    };

    await bookingRef.set(newBooking);
    
    console.log(`[Server Action] Booking ${bookingNumber} created successfully.`);

    return {
        bookingNumber,
        emailSubject: `Your booking ${bookingNumber} is confirmed!`,
        emailBody: `Thank you for booking with us. Your appointment for ${validatedData.service} on ${validatedData.date} is confirmed.`
    };
}

/**
 * Cancels a booking by updating its status to 'cancelled'.
 */
export async function cancelBooking(bookingNumber: string): Promise<void> {
    const db = getAdminDb();
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.where('bookingNumber', '==', bookingNumber).limit(1).get();

    if (snapshot.empty) {
        console.warn(`[Server Action] cancelBooking: Booking number ${bookingNumber} not found.`);
        return;
    }

    const bookingDoc = snapshot.docs[0];
    await bookingDoc.ref.update({ status: 'cancelled' });
    console.log(`[Server Action] Booking ${bookingNumber} cancelled.`);
}

/**
 * Retrieves booking details by booking number.
 */
export async function getBooking(bookingNumber: string) {
    const db = getAdminDb();
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.where('bookingNumber', '==', bookingNumber).limit(1).get();

    if (snapshot.empty) {
        return null;
    }
    
    const bookingData = snapshot.docs[0].data();
    return { id: snapshot.docs[0].id, ...bookingData };
}

/**
 * Handles a conversation with the AI assistant.
 */
export async function askAssistant(
  input: ConverseRequest
): Promise<ConverseResponse> {
  return converse(input);
}

/**
 * Fetches all bookings from Firestore for the admin dashboard.
 */
export async function getBookings() {
    try {
        const db = getAdminDb();
        const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
        console.error("Error fetching bookings:", error);
        throw new Error(`Failed to fetch bookings. Original error: ${error.message}`);
    }
}

/**
 * Deletes all bookings from the Firestore collection.
 */
export async function deleteAllBookings(): Promise<void> {
    const db = getAdminDb();
    const snapshot = await db.collection('bookings').get();
    if (snapshot.empty) {
        return;
    }
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

/**
 * Deletes a single booking by its document ID.
 */
export async function deleteBooking(id: string): Promise<void> {
    const db = getAdminDb();
    await db.collection('bookings').doc(id).delete();
}

/**
 * Updates the status of a single booking.
 */
export async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<void> {
    const db = getAdminDb();
    await db.collection('bookings').doc(id).update({ status });
}
