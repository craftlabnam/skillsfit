import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/Hero";
import { Features } from "@/components/homepage/Features";
import { Testimonial } from "@/components/homepage/Testimonial";
import { CTA } from "@/components/homepage/CTA";
import { createInsforgeServer } from "@/lib/insforge-server";

const Home = async () => {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const ctaHref = data.user ? "/dashboard" : "/login";

  return (
    <>
      <Navbar ctaHref={ctaHref} />
      <main className="flex-1">
        <Hero ctaHref={ctaHref} />
        <div className="w-full border-t border-border" />
        <Features />
        <div className="w-full border-t border-border" />
        <Testimonial />
        <CTA ctaHref={ctaHref} />
      </main>
      <Footer />
    </>
  );
};

export default Home;
