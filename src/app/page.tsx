import { HeroSection } from "@/components/landing/HeroSection";
import { CooperativeDifference } from "@/components/landing/CooperativeDifference";
import { CategoryCards } from "@/components/landing/CategoryCards";
import { StepCards } from "@/components/landing/StepCards";
import { FamilyMembershipSection } from "@/components/landing/FamilyMembershipSection";
import { TestimonialCards } from "@/components/landing/TestimonialCards";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* 1. Hero on the blue gradient with StatRow */}
      <HeroSection />

      {/* 2. White rounded panel: The Cooperative Difference */}
      <CooperativeDifference />

      {/* 3. Cream section: Every Home Deserves Reliable Help */}
      <CategoryCards />

      {/* 4. Cream section: Getting Help Has Never Been Easier */}
      <StepCards />

      {/* 5. Family membership section: 1+3 plan box */}
      <FamilyMembershipSection />

      {/* 6. Testimonials: Trust Is Earned One Job At A Time */}
      <TestimonialCards />

      {/* 7. FAQ accordion */}
      <FaqAccordion />

      {/* 8. Final CTA on the blue gradient */}
      <FinalCtaSection />
    </div>
  );
}
