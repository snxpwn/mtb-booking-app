
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Section from '@/components/section';
import { cancelBooking } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import BookingLoader from '@/components/booking-loader';

const cancellationSchema = z.object({
  bookingNumber: z.string().min(1, 'Booking number is required'),
});

type CancellationFormData = z.infer<typeof cancellationSchema>;

export default function BookingCancellationSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationSchema),
    defaultValues: {
      bookingNumber: '',
    },
  });

  async function onFormSubmit(data: CancellationFormData) {
    setIsSubmitting(true);
    try {
      await cancelBooking(data.bookingNumber);

      toast({
        title: 'Booking Cancelled!',
        description: `Your booking (#${data.bookingNumber}) has been successfully cancelled. A confirmation email has been sent.`,
      });
      form.reset();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <Section id="cancel-booking" className="bg-accent">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
            Cancel Your Booking
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Enter your booking number below to cancel your appointment.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="bookingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your booking number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</> : 'Cancel Booking'}
            </Button>
          </form>
        </Form>
      </div>
    </Section>
    {isSubmitting && <BookingLoader />}
    </>
  );
}
