import Hero from "@/components/hero";
import BrandyfyMarquee from "@/components/brandyfy-marquee";
import { Introduction } from "@/components/home-content";
import BrandyfyServices from "@/components/brandyfy-services";
import BrandyfyShowcase from "@/components/brandyfy-showcase";
import BrandyfyProcess from "@/components/brandyfy-process";
import BrandyfyComparison from "@/components/brandyfy-comparison";
import BrandyfyTestimonials from "@/components/brandyfy-testimonials";
import BrandyfyFAQ from "@/components/brandyfy-faq";
import BrandyfyCTA from "@/components/brandyfy-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandyfyMarquee />
      <Introduction />
      <BrandyfyServices />
      <BrandyfyShowcase />
      <BrandyfyProcess />
      <BrandyfyComparison />
      <BrandyfyTestimonials />
      <BrandyfyFAQ />
      <BrandyfyCTA />
    </>
  );
}
