
'use client';

import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Section from "@/components/section";
import Autoplay from "embla-carousel-autoplay";

const reviews = [
  {
    name: "Ellodie.",
    quote: "Thank you again for doing them i love them and everyone has complimented them!! I think you've honestly done a good job, i definitely will come back to you when these ones fall out!! im so happy with them xxx",
  },
  {
    name: "Lauren.",
    quote: "My eyelashes are beautiful thank you so much im in love with them xx",
  },
  {
    name: "Manal M.",
    quote: "never thought i'd be lash girlie but i love them they're so cuteee",
  },
  {
    name: "Ance.",
    quote: "thanks so much! i love it (so does the bf) and i had a great time xx",
  },
];

export default function ReviewsSection() {
  return (
    <Section id="reviews" className="bg-accent">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Reviews
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full max-w-4xl mx-auto"
      >
        <CarouselContent>
          {reviews.map((review, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-4 h-full">
                <div className="group flex flex-col h-full overflow-hidden p-6 text-center items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105">
                    <Quote className="w-10 h-10 text-primary mb-6" />
                    <p className="text-muted-foreground mb-6 text-sm">
                      "{review.quote}"
                    </p>
                    <p className="font-semibold font-headline text-foreground">
                      - {review.name}
                    </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </Section>
  );
}
