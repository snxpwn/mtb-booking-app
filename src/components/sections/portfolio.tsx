
"use client";

import Image from "next/image";
import Section from "@/components/section";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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
            "animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards",
            // Staggered animation delays
            `delay-[${index * 100}ms]`
          )}
          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
        >
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            data-ai-hint={image.imageHint}
            className="object-cover w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-110"
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 33vw, 25vw"
            loading={index < 6 ? "eager" : "lazy"}
          />
           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
           
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4">
        {portfolioImages.map((image, index) => renderImage(image, index))}
      </div>
    </Section>
  );
}
