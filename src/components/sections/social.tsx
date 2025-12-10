
import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

import Section from "@/components/section";
import TikTokIcon from "@/components/icons/tiktok";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/mor3.tb?igsh=MXIxMHA3MG4xa3ljbA==",
    icon: Instagram,
    color: "group-hover:text-[#E4405F]",
    textColor: "text-[#E4405F]",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@mor3.tb?_r=1&_t=ZN-91jjx1wm",
    icon: TikTokIcon,
    color: "group-hover:text-white",
    textColor: "text-foreground",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1DQPD5suHX/?mibextid=wwXIfr",
    icon: Facebook,
    color: "group-hover:text-[#1877F2]",
    textColor: "text-[#1877F2]",
  },
];


export default function SocialSection() {
  return (
    <Section id="social" className="bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-4 mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Find Me Online
          </h2>
          <p className="text-lg text-muted-foreground">
            Follow my journey and see my latest work on Instagram, TikTok, and Facebook.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {socialLinks.map(({ name, href, icon: Icon, color, textColor }) => (
            <Link
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex flex-col items-center justify-center p-8 rounded-lg border bg-card hover:bg-accent transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
                <Icon
                  className={`h-12 w-12 mb-4 transition-colors duration-300 ${textColor} ${color}`}
                />
                <p className="font-semibold text-lg text-foreground">
                  {name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  View Profile &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
