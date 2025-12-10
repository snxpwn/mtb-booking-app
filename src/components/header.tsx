"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ImageIcon,
  MessageSquareQuote,
  BookUser,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const navLinks = [
  { name: "Home", href: "/#home", icon: Home },
  { name: "Services", href: "/#services", icon: Sparkles },
  { name: "Portfolio", href: "/#portfolio", icon: ImageIcon },
  { name: "Book", href: "/#booking", icon: BookUser },
];

export default function Header() {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -70% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.current?.observe(section));

    return () => {
      sections.forEach((section) => observer.current?.unobserve(section));
    };
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href.startsWith("/#")) {
      const sectionId = href.substring(2);
      if (pathname === "/") {
        return activeSection === sectionId;
      }
      return false;
    }
    return pathname === href;
  };

  const desktopLinks = [
    { name: "Home", href: "/#home" },
    { name: "Services", href: "/#services" },
    { name: "Portfolio", href: "/#portfolio" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Social", href: "/#social" },
    { name: "Bookings", href: "/#booking" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-transparent"
        )}
      >
        <div className="container flex items-center justify-between h-16">
          <Logo />
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {desktopLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  isLinkActive(link.href)
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-accent border-t z-50">
        <div className="container h-full">
          <nav className="grid grid-cols-4 items-center h-full text-xs">
            {navLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 transition-colors h-full",
                    isLinkActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <LinkIcon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
