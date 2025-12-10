import { Clock, HeartHandshake, ShieldAlert, Wallet } from "lucide-react";
import Section from "@/components/section";

const policies = [
  {
    icon: Wallet,
    title: "Deposit",
    description: "To secure an appointment, a non-refundable booking fee is required. This fee will be discounted from the cost of your treatment.",
  },
  {
    icon: Clock,
    title: "Lateness",
    description: "Please arrive on time. If you are more than 10 minutes late, your appointment may be shortened or rescheduled, and the full fee may still apply.",
  },
  {
    icon: ShieldAlert,
    title: "Cancellations",
    description: "We require at least 24 hours' notice for any cancellations. This allows us to offer the slot to another client. Late cancellations may incur a fee.",
  },
  {
    icon: HeartHandshake,
    title: "Sickness",
    description: "If you or someone in your household has a contagious illness, please contact us as soon as possible to reschedule your appointment.",
  },
];

export default function PolicySection() {
  return (
    <Section id="policy" className="bg-background">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          My Policy
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A few important things to know before you book.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <div key={policy.title} className="text-center p-6 border rounded-lg bg-card/50">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                   <Icon className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold font-headline mb-2">
                {policy.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {policy.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
