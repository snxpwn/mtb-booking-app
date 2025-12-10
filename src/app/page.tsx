import Header from "@/components/header";
import HeroSection from "@/components/sections/hero";
import ServicesSection from "@/components/sections/services";
import PortfolioSection from "@/components/sections/portfolio";
import ReviewsSection from "@/components/sections/reviews";
import SocialSection from "@/components/sections/social";
import BookingSection from "@/components/sections/booking";
import Footer from "@/components/footer";
import ChatBubble from "@/components/chat-bubble";
import BookingCancellationSection from "@/components/sections/booking-cancellation";
import PolicySection from "@/components/sections/policy";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <PolicySection />
        <PortfolioSection />
        <ReviewsSection />
        <SocialSection />
        <BookingSection />
        <BookingCancellationSection />
      </main>
      <Footer />
      <ChatBubble />
    </>
  );
}
