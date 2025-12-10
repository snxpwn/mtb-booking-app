
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export default function PolicyDialog({
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: PolicyDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center font-headline">
            MTB Policies & Terms
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Please review our terms before booking.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4 -mr-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-semibold text-base">
                  1. Privacy Policy
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p className="font-semibold">Last updated: 2025</p>
                    <h3 className="font-semibold text-foreground mt-2">Introduction</h3>
                    <p>
                      More Than Beauty (“MTB”, “we”, “our”) values your privacy. This
                      Privacy Policy explains how we collect, use, and protect your
                      personal information when you use our website, booking system,
                      or contact us. By booking an appointment or using our site, you
                      agree to this policy.
                    </p>
                    <h3 className="font-semibold text-foreground mt-2">
                      Information We Collect
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Information you provide:</strong> Name, Email
                        address, Phone number, Appointment details, Any notes you
                        send us.
                      </li>
                      <li>
                        <strong>Automatically collected:</strong> We use cookie-less
                        analytics. No personal data is stored. We only see
                        anonymous insights like page views.
                      </li>
                    </ul>
                    <h3 className="font-semibold text-foreground mt-2">
                      How We Use Your Information
                    </h3>
                    <p>
                      We use your details to manage bookings, send confirmations,
                      respond to messages, and improve our services, all in compliance with GDPR.
                      We do not sell or share your information for marketing.
                    </p>
                    <h3 className="font-semibold text-foreground mt-2">
                      Data Retention & Your Rights
                    </h3>
                    <p>
                      We keep booking records for up to 24 months. You have the right to access,
                      correct, or request deletion of your data at any time.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-semibold text-base">
                  2. Terms & Conditions
                </AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4 text-sm text-muted-foreground">
                    <p className="font-semibold">Last updated: 2025</p>
                    <p>
                      These Terms & Conditions apply to all bookings. By booking, you agree to these terms.
                      Bookings must be made via our website or direct contact. Please arrive on time.
                      You are responsible for disclosing any allergies and following aftercare instructions.
                      We reserve the right to refuse service if it may cause harm.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-semibold text-base">
                  3. Eyelash Policy
                </AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4 text-sm text-muted-foreground">
                      <h3 className="font-semibold text-foreground">Deposit:</h3>
                      <p>
                        To secure an appointment, I require a non-refundable booking fee.
                        This fee will be discounted off the cost of your treatment.
                      </p>
                      <h3 className="font-semibold text-foreground">Sickness:</h3>
                      <p>
                        If you, or someone within your household, has become unwell
                        with a contagious illness, please contact me as soon as
                        possible to reschedule your appointment.
                      </p>
                   </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                 <AccordionTrigger className="font-semibold text-base">
                  4. Cancellation & Lateness Policy
                </AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-4 text-sm text-muted-foreground">
                      <h3 className="font-semibold text-foreground">Cancellations:</h3>
                      <p>
                        You may cancel up to 24 hours before your appointment.
                        Cancellations with less notice may result in a fee.
                      </p>
                      <h3 className="font-semibold text-foreground">Lateness:</h3>
                      <p>
                        If you arrive more than 10 minutes late, your appointment may be
                        shortened or rescheduled. The full fee may still apply.
                      </p>
                      <h3 className="font-semibold text-foreground">No-Shows:</h3>
                      <p>
                        A no-show is when a client does not attend and does not inform
                        us. No-shows are charged 100% of the appointment fee.
                      </p>
                   </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onDecline}>Decline</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>I Agree</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
