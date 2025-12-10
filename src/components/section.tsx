import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  className?: string;
  children: ReactNode;
}

const Section: FC<SectionProps> = ({ id, className, children }) => {
  return (
    <section id={id} className={cn("w-full py-16 md:py-24", className)}>
      <div className="container px-4 md:px-6">{children}</div>
    </section>
  );
};

export default Section;
