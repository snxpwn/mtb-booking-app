
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

const portfolioImages = PlaceHolderImages.filter(
  (img) =>
    img.imageHint.includes("portfolio") ||
    img.imageHint.includes("model") ||
    img.imageHint.includes("curl")
).slice(0, 3);

export default function PortfolioSection() {
  const renderImage = (image: (typeof portfolioImages)[0], index: number) => (
    <Dialog key={image.id}>
      <DialogTrigger asChild>
        <div className="overflow-hidden rounded-lg cursor-pointer group aspect-[3/4] relative">
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            data-ai-hint={image.imageHint}
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 33vw, 33vw"
            loading={index === 0 ? "eager" : "lazy"}
          />
           <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0">
        <Image
          src={image.imageUrl}
          alt={image.description}
          width={1200}
          height={1600}
          data-ai-hint={image.imageHint}
          className="w-full h-auto rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <Section id="portfolio" className="bg-card">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Portfolio
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          A glimpse into my work and the beautiful results.
        </p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
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
