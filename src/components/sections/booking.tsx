
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Section from '@/components/section';
import { createBooking } from '@/app/actions';
import { bookingSchema } from '@/lib/schemas';
import PolicyDialog from '@/components/policy-dialog';
import BookingLoader from '@/components/booking-loader';

type BookingFormData = z.infer<typeof bookingSchema>;

const services = [
  { id: 'classic', name: 'Classic Lashes' },
  { id: 'hybrid', name: 'Hybrid Lashes' },
  { id: 'volume', name: 'Volume Lashes' },
  { id: 'infill', name: 'Infill' },
  { id: 'removal', name: 'Lash Removal' },
];

export default function BookingSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [formData, setFormData] = useState<BookingFormData | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      postcode: '',
      service: '',
      date: '',
      notes: '',
    },
  });

  function onFormSubmit(data: BookingFormData) {
    setFormData(data);
    setShowPolicy(true);
  }

  async function handleAcceptPolicy() {
    setShowPolicy(false);
    if (!formData) return;

    setIsSubmitting(true);
    try {
      const result = await createBooking(formData);
      console.log('AI-generated email content:', result);

      toast({
        title: 'Booking Request Sent!',
        description:
          "Thank you for your booking. We'll be in touch shortly to confirm.",
      });
      form.reset();
      setFormData(null);
    } catch (error) {
      console.error('Error processing booking:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          'There was a problem submitting your booking. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeclinePolicy() {
    setShowPolicy(false);
    setFormData(null);
    toast({
      variant: 'destructive',
      title: "We're sorry to see you go!",
      description:
        "We can't continue with the booking until you agree to the policy.",
    });
  }

  return (
    <>
      <Section id="booking">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
              Book an Appointment
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fill out the form below to request an appointment.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. WD17 1DA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map(service => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Anything else you'd like to add?"
                        className="resize-none"
                        {...field}
                      />
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
                Request Booking
              </Button>
            </form>
          </Form>
        </div>
      </Section>
      <PolicyDialog
        open={showPolicy}
        onAccept={handleAcceptPolicy}
        onDecline={handleDeclinePolicy}
        onOpenChange={setShowPolicy}
      />
      {isSubmitting && <BookingLoader />}
    </>
  );
}
