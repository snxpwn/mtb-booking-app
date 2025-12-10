import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-headline text-2xl font-bold tracking-tighter text-foreground hover:text-primary transition-colors",
        className
      )}
    >
      MTB
    </Link>
  );
}
