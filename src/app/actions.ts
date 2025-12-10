
'use server';

import { processBooking, processCancellation, getBookingDetails } from '@/ai/flows/booking-flow';
import { converse } from '@/ai/flows/assistant-flow';
import type { BookingResponse, ConverseRequest, ConverseResponse } from '@/lib/schemas';
import { adminDb } from '@/lib/firebase-admin';
import { bookingSchema } from '@/lib/schemas';
import { z } from 'zod';

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
 * Creates a booking by processing the input data and calling the booking flow.
 */
export async function createBooking(
  input: ClientBookingRequest
): Promise<BookingResponse> {
    const serverInput = {
        ...input,
        date: input.date,
    };
  return processBooking(serverInput);
}

/**
 * Cancels a booking by calling the cancellation flow.
 */
export async function cancelBooking(bookingNumber: string): Promise<void> {
  return processCancellation(bookingNumber);
}

/**
 * Retrieves booking details by booking number.
 */
export async function getBooking(bookingNumber: string) {
    return getBookingDetails(bookingNumber);
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
    const snapshot = await adminDb.collection('bookings').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Deletes all bookings from the Firestore collection.
 */
export async function deleteAllBookings(): Promise<void> {
    const snapshot = await adminDb.collection('bookings').get();
    if (snapshot.empty) {
        return;
    }
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

/**
 * Deletes a single booking by its document ID.
 */
export async function deleteBooking(id: string): Promise<void> {
    await adminDb.collection('bookings').doc(id).delete();
}

/**
 * Updates the status of a single booking.
 */
export async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<void> {
    await adminDb.collection('bookings').doc(id).update({ status });
}
