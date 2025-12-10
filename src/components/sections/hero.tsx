
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Section from '@/components/section';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function HeroSection() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

  return (
    <Section
      id="home"
      className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden pt-24 md:pt-32 lg:pt-40 text-center"
    >
      {heroImage && (
         <Image
            src={heroImage.imageUrl}
            alt=""
            fill
            className="object-cover object-center z-[-1] opacity-20"
            data-ai-hint={heroImage.imageHint}
            priority
        />
      )}
      <div className="container px-4 md:px-6 z-10">
          <Logo className="text-5xl md:text-7xl lg:text-8xl inline-block" />
          <h2 className="mt-4 font-headline text-xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground/90">
            A New Beautician based in Watford
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Hi girlies! Welcome to my website - a convenient way to book your appointments so I can take care of all your beauty needs ;)
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="font-semibold text-base shadow-lg transition-transform transform hover:scale-105">
              <Link href="/#booking">
                Book Now
              </Link>
            </Button>
          </div>
      </div>
    </Section>
  );
}
