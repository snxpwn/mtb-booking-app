
"use client";

import Image from "next/image";
import Section from "@/components/section";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

// Select all images intended for the gallery
const portfolioImages = PlaceHolderImages.filter(
  (img) => img.id.startsWith("gallery-")
);

export default function PortfolioSection() {
  const renderImage = (image: (typeof portfolioImages)[0], index: number) => (
    <Dialog key={image.id}>
      <DialogTrigger asChild>
        <div 
          className={cn(
            "overflow-hidden rounded-lg cursor-pointer group aspect-[3/4] relative w-full shadow-md hover:shadow-xl transition-all duration-500 ease-out",
            // Staggered animation classes based on index (up to a reasonable limit)
            "animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards",
            index === 0 && "delay-0",
            index === 1 && "delay-100",
            index === 2 && "delay-200",
            index === 3 && "delay-300",
            index === 4 && "delay-150", // row 2 starts slightly faster
            index === 5 && "delay-250",
            index === 6 && "delay-350",
            index === 7 && "delay-450"
          )}
          style={{ animationFillMode: 'both' }} // Ensures items stay hidden before animation starts
        >
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            data-ai-hint={image.imageHint}
            className="object-cover w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-110"
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 33vw, 25vw"
            loading={index < 4 ? "eager" : "lazy"}
          />
           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
           
           {/* Optional: Add a subtle overlay text or icon on hover */}
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <span className="text-white font-medium tracking-wider uppercase text-sm border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm bg-black/10">
               View
             </span>
           </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
         <div className="relative w-full h-[80vh] flex items-center justify-center pointer-events-none">
            <div className="relative w-auto h-full max-w-full pointer-events-auto">
               <Image
                src={image.imageUrl}
                alt={image.description}
                width={1200}
                height={1600}
                data-ai-hint={image.imageHint}
                className="w-auto h-full max-h-[80vh] rounded-lg object-contain"
                />
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Section id="portfolio" className="bg-card">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          Portfolio
        </h2>
        <p className="mt-4 text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          A glimpse into my work and the beautiful results.
        </p>
      </div>

      {/* Desktop Grid - Responsive */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {portfolioImages.map((image, index) => renderImage(image, index))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full max-w-sm mx-auto"
        >
          <CarouselContent>
            {portfolioImages.map((image, index) => (
              <CarouselItem key={index} className="basis-4/5">
                <div className="p-1">
                    {renderImage(image, index)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </Section>
  );
}
