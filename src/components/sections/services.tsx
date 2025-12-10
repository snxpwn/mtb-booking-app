
'use client';

import Link from 'next/link';
import Section from '@/components/section';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const servicesList = [
  {
    id: 'classic-lashes',
    name: 'Classic Lashes',
    description:
      'A single extension is applied to one natural lash. Perfect for a subtle and natural enhancement, adding length and curl.',
  },
  {
    id: 'hybrid-lashes',
    name: 'Hybrid Lashes',
    description:
      'A mix of Classic and Volume lashes. This gives you a fuller look than classics but is less dramatic than full volume.',
  },
  {
    id: 'volume-lashes',
    name: 'Volume Lashes',
    description:
      'Multiple fine lash extensions are fanned out and applied to a single natural lash, creating a full and glamorous look.',
  },
];

export default function ServicesSection() {
  return (
    <Section id="services" className="bg-muted/40">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          My Services
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Find the perfect lash style for you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {servicesList.map(service => {
          return (
            <Card key={service.id} className="flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/#booking">Book Now</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
